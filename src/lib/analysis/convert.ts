import { resolveProvider, parseJsonResponse } from "@/lib/ai";
import { runRuleEngine } from "@/lib/rule-engine";
import type {
  ConvertOutputMode,
  ConvertResult,
  Optimization,
} from "@/lib/types";
import { CONVERT_OUTPUT_MODES } from "@/lib/types";
import { clamp } from "@/lib/utils";
import { buildStarterEmail } from "@/lib/analysis/template";
import {
  normalizeComponents,
  normalizeOptimizations,
} from "@/lib/analysis/normalize";

const MODE_GUIDANCE: Record<ConvertOutputMode, string> = {
  standard:
    "Produce standard table-based HTML email with inline CSS and MSO conditional comments.",
  sfmc:
    "Produce Salesforce Marketing Cloud compatible HTML. Include AMPscript blocks (e.g. %%[ ]%%, %%=v(@var)=%%) for personalization and SFMC unsubscribe (%%unsub_center_url%%).",
  mjml: "Produce valid MJML markup that compiles to responsive HTML.",
  foundation:
    "Produce Zurb Foundation for Emails (Inky) markup using <container>, <row>, <columns>, <button>.",
};

function buildConfidenceFor(html: string, mode: ConvertOutputMode): number {
  // MJML/Foundation are pre-compilation markup; the rule engine targets final
  // HTML, so only score the standard/sfmc HTML output deterministically.
  if (mode === "mjml" || mode === "foundation") return 90;
  const { summary } = runRuleEngine(html);
  return clamp(summary.healthScore, 0, 100);
}

function fallbackOptimizations(): Optimization[] {
  return [
    {
      title: "CTA enlarged for mobile usability",
      detail: "Primary CTA uses 14px/28px padding to exceed the 44px minimum tap target.",
      category: "mobile",
    },
    {
      title: "Live text generated",
      detail: "Headline and body rendered as live HTML text instead of baked into an image for accessibility and deliverability.",
      category: "accessibility",
    },
    {
      title: "Dark-mode handling added",
      detail: "color-scheme meta tags and prefers-color-scheme overrides included.",
      category: "dark-mode",
    },
    {
      title: "Outlook compatibility ensured",
      detail: "MSO conditional ghost table and PixelsPerInch fix added for Windows Outlook.",
      category: "outlook",
    },
  ];
}

/**
 * CONVERT pipeline. With a vision-capable provider, the design image is turned
 * into production HTML and an optimization report. Without AI, a best-practice
 * starter template is returned so the feature still produces valid output.
 */
export async function convertDesign(
  imageBase64: string,
  mimeType: string,
  mode: ConvertOutputMode,
): Promise<ConvertResult> {
  const provider = resolveProvider();

  if (!provider || !provider.supportsVision()) {
    const html = buildStarterEmail(mode);
    return {
      html,
      mode,
      optimizations: fallbackOptimizations(),
      components: [],
      buildConfidence: buildConfidenceFor(html, mode),
      modelProvider: "Deterministic Template Engine",
      usedAi: false,
    };
  }

  const modeLabel =
    CONVERT_OUTPUT_MODES.find((m) => m.value === mode)?.label ?? mode;

  const system = `You are EmailForge's CONVERT engine. You transform email design images into production-ready, bulletproof HTML email code.

HARD REQUIREMENTS for generated HTML (standard/sfmc modes):
- Use tables for layout with role="presentation"
- Inline CSS on elements
- Every <img> has alt, width and height attributes and style="display:block"
- Outlook support via MSO conditional comments and ghost tables
- Gmail, Yahoo, Apple Mail and mobile support via media queries
- Dark mode meta tags + prefers-color-scheme overrides
- Email-safe fonts only
- Accessibility friendly (semantic where possible, lang attribute)

FORBIDDEN: JavaScript, CSS grid, flexbox, external CSS, position:absolute/fixed, unsupported CSS.

DO NOT blindly recreate the design - IMPROVE it: enlarge small CTAs to >=44px, fix weak contrast, improve spacing, and convert text-in-image to live HTML text where possible.

${MODE_GUIDANCE[mode]}

Respond with STRICT JSON only:
{
  "html": "<full ${modeLabel} code as a string>",
  "components": [ { "type": "...", "label": "...", "description": "...", "confidence": 0-100 } ],
  "optimizations": [ { "title": "...", "detail": "...", "category": "<category slug>" } ]
}`;

  try {
    const raw = await provider.completeVision({
      system,
      prompt: `Convert this email design into ${modeLabel} code following every requirement. Improve the design where it violates best practices and report each improvement in "optimizations".`,
      json: true,
      image: { base64: imageBase64, mimeType },
      temperature: 0.3,
    });

    const parsed = parseJsonResponse<{
      html?: string;
      components?: unknown;
      optimizations?: unknown;
    }>(raw);

    const html = (parsed?.html ?? "").trim() || buildStarterEmail(mode);
    const optimizations = normalizeOptimizations(parsed?.optimizations);
    const components = normalizeComponents(parsed?.components);

    return {
      html,
      mode,
      optimizations:
        optimizations.length > 0 ? optimizations : fallbackOptimizations(),
      components,
      buildConfidence: buildConfidenceFor(html, mode),
      modelProvider: provider.label,
      usedAi: true,
    };
  } catch {
    const html = buildStarterEmail(mode);
    return {
      html,
      mode,
      optimizations: fallbackOptimizations(),
      components: [],
      buildConfidence: buildConfidenceFor(html, mode),
      modelProvider: "Deterministic Template Engine (AI unavailable)",
      usedAi: false,
    };
  }
}
