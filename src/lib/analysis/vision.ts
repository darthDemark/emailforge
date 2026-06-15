import { resolveProvider, parseJsonResponse } from "@/lib/ai";
import { summarize } from "@/lib/rule-engine";
import { withTimeout } from "@/lib/timeout";
import type { EmailIssue, VisionResult } from "@/lib/types";
import { GLOBAL_AI_DIRECTIVE } from "@/lib/analysis/prompts";
import {
  normalizeAiIssues,
  normalizeComponents,
} from "@/lib/analysis/normalize";

const VISION_PROMPT = `Analyze this email DESIGN image as an expert email developer reviewing it BEFORE any code is written.

Step 1 - Component detection. Identify which of these components are present:
logo, header, hero, headline, body-copy, cta, product-grid, promotional-block, social-icons, footer, legal-copy.

Step 2 - Issue detection. Evaluate the design against HTML email best practices. Look specifically for:
text embedded in images, poor contrast, weak visual hierarchy, small CTA buttons, accessibility problems, image-heavy design, mobile layout risks, Outlook rendering risks, dark-mode risks, deliverability risks, multiple competing CTAs, CTA below the fold, insufficient spacing, readability problems.

Report the 8-10 MOST important issues only. Keep "impact", "recommendation" and "bestPractice" to one or two concise sentences each so the response is fast.

For EACH issue also include a "marker" object with normalized coordinates (x and y between 0 and 1) locating the problem area on the image, so it can be annotated.

Return STRICT JSON with this shape:
{
  "components": [ { "type": "...", "label": "...", "description": "...", "confidence": 0-100 } ],
  "issues": [ {
     "severity": "critical|warning|recommendation",
     "confidence": 0-100,
     "category": "<category slug>",
     "issue": "...",
     "impact": "...",
     "recommendation": "...",
     "bestPractice": "...",
     "marker": { "x": 0-1, "y": 0-1 }
  } ]
}`;

interface VisionPayload {
  components?: unknown;
  issues?: unknown;
}

/** Result returned when no AI provider is configured. */
function noAiResult(): VisionResult {
  const issue: EmailIssue = {
    id: "vision-no-ai",
    severity: "recommendation",
    confidence: 100,
    category: "code-quality",
    issue: "AI vision provider not configured",
    impact:
      "Design image analysis requires a vision-capable AI provider. Without one, EmailForge cannot detect components or design issues from an image.",
    recommendation:
      "Add an OpenAI, Anthropic or Gemini API key in your environment to enable VISION analysis.",
    bestPractice:
      "EmailForge pairs a deterministic rule engine (for code) with AI vision (for designs). Designs are evaluated by a vision model before development begins.",
    source: "ai",
  };
  return {
    components: [],
    issues: [issue],
    summary: summarize([issue]),
    modelProvider: "None",
    usedAi: false,
  };
}

export async function analyzeDesign(
  imageBase64: string,
  mimeType: string,
): Promise<VisionResult> {
  const provider = resolveProvider();
  if (!provider || !provider.supportsVision()) {
    return noAiResult();
  }

  const raw = await withTimeout(
    provider.completeVision({
      system: GLOBAL_AI_DIRECTIVE,
      prompt: VISION_PROMPT,
      json: true,
      image: { base64: imageBase64, mimeType },
    }),
    110_000,
  );

  const parsed = parseJsonResponse<VisionPayload>(raw);
  const components = normalizeComponents(parsed?.components ?? parsed);
  const issues = normalizeAiIssues(parsed?.issues ?? parsed);

  // Assign sequential marker indices to issues that carry coordinates.
  let markerIndex = 0;
  for (const issue of issues) {
    if (issue.marker) {
      markerIndex += 1;
      issue.marker.index = markerIndex;
    }
  }

  return {
    components,
    issues,
    summary: summarize(issues),
    modelProvider: provider.label,
    usedAi: true,
  };
}
