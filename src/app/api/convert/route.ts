import { NextResponse } from "next/server";

import { convertDesign } from "@/lib/analysis/convert";
import { parseDataUrl } from "@/lib/image";
import type { ConvertOutputMode } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODES: ConvertOutputMode[] = ["standard", "sfmc", "mjml", "foundation"];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      image?: string;
      mode?: string;
    };

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

    const mode: ConvertOutputMode = MODES.includes(body.mode as ConvertOutputMode)
      ? (body.mode as ConvertOutputMode)
      : "standard";

    const result = await convertDesign(parsed.base64, parsed.mimeType, mode);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to convert design." },
      { status: 500 },
    );
  }
}
