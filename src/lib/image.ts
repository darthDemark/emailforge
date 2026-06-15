/**
 * Split a data URL (data:image/png;base64,XXXX) into its mime type and the
 * raw base64 payload. Returns null when the input is not a supported image
 * data URL.
 */
export function parseDataUrl(
  dataUrl: string,
): { mimeType: string; base64: string } | null {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i.exec(
    dataUrl.trim(),
  );
  if (!match) return null;
  const mimeType = match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1];
  return { mimeType, base64: match[2] };
}
