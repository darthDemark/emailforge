import { resolveProvider } from "@/lib/ai";
import type { AssistantContext, ChatMessage } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { truncate } from "@/lib/utils";

function buildContextBlock(context?: AssistantContext): string {
  if (!context) return "No project context is currently loaded.";

  const parts: string[] = [];
  if (context.page) parts.push(`Active page: ${context.page.toUpperCase()}.`);

  if (context.summary) {
    parts.push(
      `Current analysis: health score ${context.summary.healthScore}/100, ${context.summary.criticalCount} critical, ${context.summary.warningCount} warnings, ${context.summary.recommendationCount} recommendations.`,
    );
  }

  if (context.issues && context.issues.length > 0) {
    const top = context.issues
      .slice(0, 12)
      .map(
        (i) =>
          `- [${i.severity}] (${CATEGORY_LABELS[i.category]}) ${i.issue}: ${i.impact}`,
      )
      .join("\n");
    parts.push(`Detected issues:\n${top}`);
  }

  if (context.html) {
    parts.push(`Relevant HTML (truncated):\n${truncate(context.html, 4000)}`);
  }

  return parts.join("\n\n");
}

const ASSISTANT_SYSTEM = `You are "Ask EmailForge", an expert HTML email development assistant embedded in the EmailForge platform.

You help email developers, marketers and SFMC professionals understand and fix email issues. You can:
- Explain why a client (e.g. Outlook) breaks specific code
- Improve accessibility, deliverability and conversion
- Convert CTAs to bulletproof VML buttons
- Generate AMPscript / SFMC variants
- Teach email best practices

Always be precise, practical and educational. When you provide code, ensure it follows email best practices (tables, inline CSS, no JS/flex/grid). Reference the user's current project context when relevant. Keep answers focused and use short code blocks where helpful.`;

export async function askAssistant(
  messages: ChatMessage[],
  context?: AssistantContext,
): Promise<{ reply: string; usedAi: boolean; provider: string }> {
  const provider = resolveProvider();

  if (!provider) {
    return {
      reply:
        "The AI assistant requires an AI provider to be configured. Add an OpenAI, Anthropic, or Gemini API key to your environment to chat with EmailForge.\n\nIn the meantime, the deterministic rule engine on the Validate page still analyzes your HTML and explains every issue it finds, including the best-practice reasoning behind each recommendation.",
      usedAi: false,
      provider: "None",
    };
  }

  const contextBlock = buildContextBlock(context);
  const system = `${ASSISTANT_SYSTEM}\n\n--- CURRENT PROJECT CONTEXT ---\n${contextBlock}`;

  const reply = await provider.chat({
    system,
    messages,
  });

  return { reply, usedAi: true, provider: provider.label };
}
