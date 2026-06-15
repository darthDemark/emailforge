import { GoogleGenerativeAI } from "@google/generative-ai";

import type {
  AIProvider,
  ChatRequest,
  TextRequest,
  VisionRequest,
} from "@/lib/ai/provider";

export class GeminiProvider implements AIProvider {
  readonly id = "gemini";
  readonly label = "Google Gemini";

  private get apiKey(): string | undefined {
    return process.env.GEMINI_API_KEY;
  }

  private get model(): string {
    return process.env.GEMINI_MODEL || "gemini-1.5-pro";
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  supportsVision(): boolean {
    return true;
  }

  private client() {
    return new GoogleGenerativeAI(this.apiKey ?? "").getGenerativeModel({
      model: this.model,
    });
  }

  async completeText(request: TextRequest): Promise<string> {
    const result = await this.client().generateContent({
      contents: [{ role: "user", parts: [{ text: request.prompt }] }],
      systemInstruction: request.system,
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        responseMimeType: request.json ? "application/json" : undefined,
      },
    });
    return result.response.text();
  }

  async completeVision(request: VisionRequest): Promise<string> {
    const result = await this.client().generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: request.prompt },
            {
              inlineData: {
                mimeType: request.image.mimeType,
                data: request.image.base64,
              },
            },
          ],
        },
      ],
      systemInstruction: request.system,
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        responseMimeType: request.json ? "application/json" : undefined,
      },
    });
    return result.response.text();
  }

  async chat(request: ChatRequest): Promise<string> {
    const result = await this.client().generateContent({
      contents: request.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      systemInstruction: request.system,
      generationConfig: { temperature: request.temperature ?? 0.4 },
    });
    return result.response.text();
  }
}
