import type { AIProvider } from "@/lib/ai/provider";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import { AnthropicProvider } from "@/lib/ai/providers/anthropic";
import { GeminiProvider } from "@/lib/ai/providers/gemini";

export type { AIProvider } from "@/lib/ai/provider";
export { NoProviderError } from "@/lib/ai/provider";

/**
 * Registry of all known providers. Adding a new provider is as simple as
 * implementing the {@link AIProvider} interface and registering it here.
 */
const registry: AIProvider[] = [
  new OpenAIProvider(),
  new AnthropicProvider(),
  new GeminiProvider(),
];

/** Preference order used when AI_PROVIDER=auto. */
const DEFAULT_PRIORITY = ["openai", "anthropic", "gemini"];

/**
 * Resolve the active AI provider.
 *
 * - If `AI_PROVIDER` names a configured provider, it is used.
 * - Otherwise the first configured provider (by priority) is used.
 * - Returns `null` when no provider is configured, allowing callers to fall
 *   back to the deterministic rule engine.
 */
export function resolveProvider(): AIProvider | null {
  const requested = (process.env.AI_PROVIDER || "auto").toLowerCase();

  if (requested !== "auto") {
    const match = registry.find((p) => p.id === requested);
    if (match && match.isConfigured()) return match;
  }

  for (const id of DEFAULT_PRIORITY) {
    const provider = registry.find((p) => p.id === id);
    if (provider?.isConfigured()) return provider;
  }

  return null;
}

export function isAiAvailable(): boolean {
  return resolveProvider() !== null;
}

export function listProviderStatus(): {
  id: string;
  label: string;
  configured: boolean;
}[] {
  return registry.map((p) => ({
    id: p.id,
    label: p.label,
    configured: p.isConfigured(),
  }));
}

/**
 * Parse a JSON object from a model response, tolerating markdown code fences
 * and surrounding prose that models sometimes emit.
 */
export function parseJsonResponse<T>(raw: string): T | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fall back to extracting the first {...} or [...] block.
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    const candidate = objectMatch?.[0] ?? arrayMatch?.[0];
    if (!candidate) return null;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      return null;
    }
  }
}
