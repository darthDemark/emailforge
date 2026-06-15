import type { Rule } from "@/lib/rule-engine/types";
import { byTag } from "@/lib/rule-engine/helpers";

export const maintainabilityRules: Rule[] = [
  {
    id: "maintainability.deep-nesting",
    category: "maintainability",
    severity: "recommendation",
    title: "Excessive table nesting",
    impact:
      "Deeply nested tables are hard to maintain and debug, and small edits risk breaking the layout.",
    recommendation:
      "Flatten the structure where possible and comment major sections.",
    bestPractice:
      "Modular, shallow structures are easier to update and less error-prone over a template's lifetime.",
    confidence: 45,
    evaluate: (ctx) => {
      const tables = byTag(ctx, "table");
      const deep = tables.some((t) => {
        let depth = 0;
        let node = t.parentNode;
        while (node) {
          if (node.rawTagName?.toLowerCase() === "table") depth += 1;
          node = node.parentNode;
        }
        return depth >= 4;
      });
      if (deep) {
        return [{ snippet: "table nested 4+ levels deep" }];
      }
      return undefined;
    },
  },
  {
    id: "maintainability.no-comments",
    category: "maintainability",
    severity: "recommendation",
    title: "No section comments",
    impact:
      "Long templates without comments are difficult for teammates to navigate and safely edit.",
    recommendation:
      "Add HTML comments marking major sections (header, hero, footer).",
    bestPractice:
      "Section comments make complex email templates maintainable across a team.",
    confidence: 40,
    evaluate: (ctx) => {
      const commentCount = (ctx.html.match(/<!--/g) || []).length;
      const bytes = Buffer.byteLength(ctx.html, "utf8");
      if (bytes > 8000 && commentCount === 0) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "maintainability.inline-everything-no-structure",
    category: "maintainability",
    severity: "recommendation",
    title: "No reusable structure or naming",
    impact:
      "Without consistent class hooks or modular blocks, updates must be made by hand in many places.",
    recommendation:
      "Adopt consistent, descriptive class names on key containers for targeted media-query overrides.",
    bestPractice:
      "A light, consistent naming convention improves long-term maintainability without harming compatibility.",
    confidence: 40,
    evaluate: (ctx) => {
      const bytes = Buffer.byteLength(ctx.html, "utf8");
      if (bytes > 12000 && !/class\s*=/.test(ctx.html)) {
        return [{}];
      }
      return undefined;
    },
  },
];
