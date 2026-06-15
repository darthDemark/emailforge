import Anthropic from "@anthropic-ai/sdk";

import type {
  AIProvider,
  ChatRequest,
  TextRequest,
  VisionRequest,
} from "@/lib/ai/provider";

export class AnthropicProvider implements AIProvider {
  readonly id = "anthropic";
  readonly label = "Anthropic Claude";

  private get apiKey(): string | undefined {
    return process.env.ANTHROPIC_API_KEY;
  }

  private get model(): string {
    return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  }

  private get visionModel(): string {
    return (
      process.env.ANTHROPIC_VISION_MODEL ||
      process.env.ANTHROPIC_MODEL ||
      "claude-sonnet-4-6"
    );
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  supportsVision(): boolean {
    return true;
  }

  private client(): Anthropic {
    // Bound request time and limit retries so a slow/unavailable upstream
    // fails fast instead of hanging past the serverless function limit.
    return new Anthropic({
      apiKey: this.apiKey,
      timeout: 50_000,
      maxRetries: 1,
    });
  }

  private extractText(message: Anthropic.Message): string {
    return message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");
  }

  async completeText(request: TextRequest): Promise<string> {
    const message = await this.client().messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: request.temperature ?? 0.2,
      system: request.system,
      messages: [{ role: "user", content: request.prompt }],
    });
    return this.extractText(message);
  }

  async completeVision(request: VisionRequest): Promise<string> {
    // Vision is the slowest path; give it one long, un-retried attempt so a
    // legitimately slow analysis can finish instead of timing out and retrying.
    const message = await this.client().messages.create(
      {
        model: this.visionModel,
        max_tokens: 4096,
        temperature: request.temperature ?? 0.2,
        system: request.system,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: request.prompt },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: request.image
                    .mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                  data: request.image.base64,
                },
              },
            ],
          },
        ],
      },
      { timeout: 115_000, maxRetries: 0 },
    );
    return this.extractText(message);
  }

  async chat(request: ChatRequest): Promise<string> {
    const message = await this.client().messages.create({
      model: this.model,
      max_tokens: 2048,
      temperature: request.temperature ?? 0.4,
      system: request.system,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });
    return this.extractText(message);
  }
}
