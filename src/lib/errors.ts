/**
 * Extract a concise, safe-to-display message from an unknown error.
 *
 * AI SDK errors (OpenAI / Anthropic / Gemini) surface useful detail such as
 * "401 authentication_error" or "404 model not found". We expose that to help
 * diagnose configuration problems, while never echoing secrets — provider SDK
 * error messages do not include the API key.
 */
export function describeError(err: unknown): string {
  if (err instanceof Error) {
    // Anthropic/OpenAI SDK errors often carry `status` and `error` fields.
    const anyErr = err as { status?: number; name?: string };
    const status = anyErr.status ? `${anyErr.status} ` : "";
    return `${status}${err.message}`.trim();
  }
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown error";
  }
}

/** Redact anything resembling an API key from a string, as a safety net. */
export function redactSecrets(input: string): string {
  return input
    .replace(/sk-ant-[A-Za-z0-9_-]+/g, "sk-ant-***")
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "sk-***")
    .replace(/AIza[A-Za-z0-9_-]{20,}/g, "AIza***");
}
