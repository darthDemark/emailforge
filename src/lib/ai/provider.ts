/**
 * AI provider abstraction.
 *
 * Application logic depends ONLY on this interface, never on a concrete SDK.
 * Concrete providers (OpenAI, Anthropic, Gemini) implement {@link AIProvider}
 * and are selected at runtime by {@link resolveProvider}. This makes providers
 * fully swappable via the `AI_PROVIDER` env var without touching app code.
 */

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ImageInput {
  /** Base64-encoded image data (no data: prefix). */
  base64: string;
  /** MIME type, e.g. image/png. */
  mimeType: string;
}

export interface TextRequest {
  system: string;
  prompt: string;
  /** Hint that a JSON object response is expected. */
  json?: boolean;
  temperature?: number;
}

export interface VisionRequest extends TextRequest {
  image: ImageInput;
}

export interface ChatRequest {
  system: string;
  messages: AIChatMessage[];
  temperature?: number;
}

export interface AIProvider {
  /** Stable provider identifier (e.g. "openai"). */
  readonly id: string;
  /** Human-readable provider name. */
  readonly label: string;
  /** Whether the provider has the credentials it needs to run. */
  isConfigured(): boolean;
  /** Whether the provider supports image (vision) inputs. */
  supportsVision(): boolean;
  completeText(request: TextRequest): Promise<string>;
  completeVision(request: VisionRequest): Promise<string>;
  chat(request: ChatRequest): Promise<string>;
}

/** Error thrown when no AI provider is available/configured. */
export class NoProviderError extends Error {
  constructor(message = "No AI provider is configured.") {
    super(message);
    this.name = "NoProviderError";
  }
}
