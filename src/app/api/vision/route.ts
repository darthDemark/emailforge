import { NextResponse } from "next/server";

import { analyzeDesign } from "@/lib/analysis/vision";
import { parseDataUrl } from "@/lib/image";
import { persistAnalysis, uploadDesignImage } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { image?: string };
    if (!body.image) {
      return NextResponse.json(
        { error: "No image provided." },
        { status: 400 },
      );
    }

    const parsed = parseDataUrl(body.image);
    if (!parsed) {
      return NextResponse.json(
        { error: "Unsupported image. Use JPG, JPEG, PNG or WEBP." },
        { status: 400 },
      );
    }

    const result = await analyzeDesign(parsed.base64, parsed.mimeType);
    void uploadDesignImage(parsed.base64, parsed.mimeType);
    void persistAnalysis({
      kind: "vision",
      provider: result.modelProvider,
      usedAi: result.usedAi,
      payload: { components: result.components, summary: result.summary },
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze design." },
      { status: 500 },
    );
  }
}
