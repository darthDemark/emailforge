import { NextResponse } from "next/server";

import { validateHtml } from "@/lib/analysis/validate";
import { persistAnalysis } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { html?: string };
    const html = (body.html ?? "").trim();

    if (!html) {
      return NextResponse.json(
        { error: "No HTML provided." },
        { status: 400 },
      );
    }
    if (html.length > 500_000) {
      return NextResponse.json(
        { error: "HTML exceeds the 500KB analysis limit." },
        { status: 413 },
      );
    }

    const result = await validateHtml(html);
    void persistAnalysis({
      kind: "validate",
      provider: result.modelProvider,
      usedAi: result.usedAi,
      payload: result.summary,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to validate HTML." },
      { status: 500 },
    );
  }
}
