import { NextResponse } from "next/server";

import { askAssistant } from "@/lib/analysis/assistant";
import type { AssistantContext, ChatMessage } from "@/lib/types";
import { describeError, redactSecrets } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      messages?: ChatMessage[];
      context?: AssistantContext;
    };

    const messages = (body.messages ?? [])
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string",
      )
      .slice(-20);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 },
      );
    }

    const result = await askAssistant(messages, body.context);
    return NextResponse.json(result);
  } catch (err) {
    const detail = redactSecrets(describeError(err));
    console.error("[api/assistant] chat failed:", detail);
    return NextResponse.json(
      {
        reply: `The assistant encountered an error from the AI provider:\n\n${detail}\n\nThis usually means the API key is invalid/revoked or the configured model name is not available to your account.`,
        usedAi: false,
        provider: "None",
      },
      { status: 200 },
    );
  }
}
