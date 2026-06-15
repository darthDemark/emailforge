import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Optional Supabase integration.
 *
 * Supabase is used for persistence (analysis history) and Storage (uploaded
 * design images). It is entirely optional: when the env vars are absent every
 * helper here becomes a no-op so the platform runs fully without it.
 */

let cached: SupabaseClient | null | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

/** Returns a server-side Supabase client, or null when not configured. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "emailforge";

/**
 * Persist an analysis record. Fire-and-forget: failures (including missing
 * tables) are swallowed so analysis never breaks because of persistence.
 */
export async function persistAnalysis(record: {
  kind: "vision" | "convert" | "validate";
  provider: string;
  usedAi: boolean;
  payload: unknown;
}): Promise<void> {
  const client = getSupabaseAdmin();
  if (!client) return;
  try {
    await client.from("analyses").insert({
      kind: record.kind,
      provider: record.provider,
      used_ai: record.usedAi,
      payload: record.payload,
      created_at: new Date().toISOString(),
    });
  } catch {
    // Persistence is best-effort and must never break analysis.
  }
}

/**
 * Upload a design image to Supabase Storage and return its public URL, or null
 * when Storage is not configured or the upload fails.
 */
export async function uploadDesignImage(
  base64: string,
  mimeType: string,
): Promise<string | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;
  try {
    const ext = mimeType.split("/")[1] ?? "png";
    const path = `designs/${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(base64, "base64");
    const { error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });
    if (error) return null;
    const { data } = client.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl ?? null;
  } catch {
    return null;
  }
}
