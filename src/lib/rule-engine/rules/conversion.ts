import type { Rule } from "@/lib/rule-engine/types";
import { byTag, getAttr, snippet } from "@/lib/rule-engine/helpers";

export const conversionRules: Rule[] = [
  {
    id: "conversion.no-cta",
    category: "conversion",
    severity: "warning",
    title: "No clear call-to-action button detected",
    impact:
      "Without a prominent CTA, recipients have no obvious next step, suppressing click-through and conversion rates.",
    recommendation:
      "Add a bulletproof, button-styled primary CTA above the fold.",
    bestPractice:
      "A single, prominent CTA focuses attention and is the strongest driver of email conversions.",
    confidence: 55,
    evaluate: (ctx) => {
      const links = byTag(ctx, "a");
      const ctaLike = links.filter((a) => {
        const style = (getAttr(a, "style") || "").toLowerCase();
        return /background/.test(style) || /padding/.test(style);
      });
      if (links.length === 0 || ctaLike.length === 0) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "conversion.too-many-ctas",
    category: "conversion",
    severity: "recommendation",
    title: "Multiple competing primary CTAs",
    impact:
      "Many equally-weighted CTAs dilute focus and reduce the click-through rate of your most important action.",
    recommendation:
      "Establish a single primary CTA and demote the rest to secondary/text links.",
    bestPractice:
      "A clear visual hierarchy with one dominant CTA outperforms multiple competing buttons.",
    confidence: 50,
    evaluate: (ctx) => {
      const links = byTag(ctx, "a");
      const buttons = links.filter((a) => {
        const style = (getAttr(a, "style") || "").toLowerCase();
        return /background/.test(style) && /padding/.test(style);
      });
      if (buttons.length >= 4) {
        return [{ snippet: `${buttons.length} button-styled CTAs` }];
      }
      return undefined;
    },
  },
  {
    id: "conversion.vague-cta-copy",
    category: "conversion",
    severity: "recommendation",
    title: "Weak CTA copy",
    impact:
      "Generic CTA labels like 'Click here' or 'Submit' are less motivating and worse for accessibility than action-led copy.",
    recommendation:
      "Use specific, benefit-driven CTA copy (e.g. 'Start my free trial').",
    bestPractice:
      "Action- and value-oriented CTA copy lifts click-through and clarifies link purpose for screen readers.",
    confidence: 45,
    evaluate: (ctx) => {
      const links = byTag(ctx, "a");
      const weak = links.filter((a) =>
        /^(click here|submit|read more|here|learn more)$/i.test(a.text.trim()),
      );
      if (weak.length > 0) {
        return weak.slice(0, 3).map((a) => ({ snippet: snippet(a, 100) }));
      }
      return undefined;
    },
  },
];
