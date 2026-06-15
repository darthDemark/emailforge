import OpenAI from "openai";

import type {
  AIProvider,
  ChatRequest,
  TextRequest,
  VisionRequest,
} from "@/lib/ai/provider";

export class OpenAIProvider implements AIProvider {
  readonly id = "openai";
  readonly label = "OpenAI";

  private get apiKey(): string | undefined {
    return process.env.OPENAI_API_KEY;
  }

  private get model(): string {
    return process.env.OPENAI_MODEL || "gpt-4o";
  }

  private get visionModel(): string {
    return process.env.OPENAI_VISION_MODEL || process.env.OPENAI_MODEL || "gpt-4o";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  supportsVision(): boolean {
    return true;
  }

  private client(): OpenAI {
    // Bound request time and limit retries so a slow/unavailable upstream
    // fails fast instead of hanging past the serverless function limit.
    return new OpenAI({ apiKey: this.apiKey, timeout: 50_000, maxRetries: 1 });
  }

  async completeText(request: TextRequest): Promise<string> {
    const res = await this.client().chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0.2,
      response_format: request.json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: request.system },
        { role: "user", content: request.prompt },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async completeVision(request: VisionRequest): Promise<string> {
    const res = await this.client().chat.completions.create({
      model: this.visionModel,
      temperature: request.temperature ?? 0.2,
      response_format: request.json ? { type: "json_object" } : undefined,
      messages: [
        { role: "system", content: request.system },
        {
          role: "user",
          content: [
            { type: "text", text: request.prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${request.image.mimeType};base64,${request.image.base64}`,
              },
            },
          ],
        },
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async chat(request: ChatRequest): Promise<string> {
    const res = await this.client().chat.completions.create({
      model: this.model,
      temperature: request.temperature ?? 0.4,
      messages: [
        { role: "system", content: request.system },
        ...request.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return res.choices[0]?.message?.content ?? "";
  }
}
