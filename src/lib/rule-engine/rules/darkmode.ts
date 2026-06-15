import type { Rule } from "@/lib/rule-engine/types";
import { byTag } from "@/lib/rule-engine/helpers";

export const darkModeRules: Rule[] = [
  {
    id: "dark-mode.no-color-scheme",
    category: "dark-mode",
    severity: "warning",
    title: "Missing color-scheme declaration",
    impact:
      "Without color-scheme meta/CSS, clients may aggressively invert colours in dark mode, producing low-contrast or inverted logos.",
    recommendation:
      'Add <meta name="color-scheme" content="light dark"> and the supported-color-schemes meta tag.',
    bestPractice:
      "Declaring color-scheme opts into predictable dark-mode handling in Apple Mail and iOS.",
    confidence: 70,
    evaluate: (ctx) => {
      if (!/color-scheme/i.test(ctx.html)) {
        return [
          {
            suggestedFix:
              '<meta name="color-scheme" content="light dark">\n<meta name="supported-color-schemes" content="light dark">',
          },
        ];
      }
      return undefined;
    },
  },
  {
    id: "dark-mode.pure-black-text",
    category: "dark-mode",
    severity: "recommendation",
    title: "Pure black/white relied upon for contrast",
    impact:
      "Some clients invert #000000 and #ffffff in dark mode. Logos and text set in pure black can become invisible against inverted backgrounds.",
    recommendation:
      "Use near-black (#1a1a1a) and near-white (#f5f5f5) and supply dark-mode media queries for critical brand assets.",
    bestPractice:
      "Off-black/off-white palettes survive client colour inversion better than pure extremes.",
    confidence: 50,
    evaluate: (ctx) => {
      if (/#000(000)?\b/i.test(ctx.html) && !/prefers-color-scheme/i.test(ctx.html)) {
        return [{ snippet: "#000000 without dark-mode handling" }];
      }
      return undefined;
    },
  },
  {
    id: "dark-mode.no-prefers-color-scheme",
    category: "dark-mode",
    severity: "recommendation",
    title: "No prefers-color-scheme styles",
    impact:
      "Dark-mode users on supporting clients see auto-adjusted colours that may clash with the brand without explicit dark styles.",
    recommendation:
      "Add @media (prefers-color-scheme: dark) overrides for backgrounds, text and logos.",
    bestPractice:
      "Explicit dark-mode styles give you control over how the email appears instead of leaving it to client heuristics.",
    confidence: 55,
    evaluate: (ctx) => {
      const hasStyle = byTag(ctx, "style").length > 0;
      if (hasStyle && !/prefers-color-scheme/i.test(ctx.html)) {
        return [{}];
      }
      return undefined;
    },
  },
];
