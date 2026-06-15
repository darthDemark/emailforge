import type { Rule } from "@/lib/rule-engine/types";
import { byTag } from "@/lib/rule-engine/helpers";

export const structureRules: Rule[] = [
  {
    id: "structure.missing-doctype",
    category: "html-structure",
    severity: "critical",
    title: "Missing or non-standard DOCTYPE",
    impact:
      "Without the XHTML 1.0 Transitional DOCTYPE, clients fall back to quirks mode, producing inconsistent box sizing and spacing.",
    recommendation:
      'Add <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "...">.',
    bestPractice:
      "The XHTML 1.0 Transitional DOCTYPE gives the most predictable rendering across email clients.",
    confidence: 80,
    evaluate: (ctx) => {
      if (!/<!doctype/i.test(ctx.html)) {
        return [{ suggestedFix: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' }];
      }
      return undefined;
    },
  },
  {
    id: "structure.missing-charset",
    category: "html-structure",
    severity: "critical",
    title: "Missing charset meta tag",
    impact:
      "Without a UTF-8 charset declaration, special characters and emoji render as mojibake in many clients.",
    recommendation:
      'Add <meta charset="utf-8"> (and the http-equiv variant) inside <head>.',
    bestPractice:
      "Declare UTF-8 early in <head> so all clients decode content correctly.",
    confidence: 85,
    evaluate: (ctx) => {
      if (!/charset\s*=\s*["']?utf-8/i.test(ctx.html)) {
        return [{ suggestedFix: '<meta charset="utf-8">' }];
      }
      return undefined;
    },
  },
  {
    id: "structure.missing-viewport",
    category: "html-structure",
    severity: "warning",
    title: "Missing viewport meta tag",
    impact:
      "Mobile clients may not scale the email correctly without a viewport tag, leading to zoomed-out or oversized rendering.",
    recommendation:
      'Add <meta name="viewport" content="width=device-width, initial-scale=1">.',
    bestPractice:
      "The viewport meta tag is required for reliable responsive behaviour on mobile mail apps.",
    confidence: 80,
    evaluate: (ctx) => {
      if (!/name\s*=\s*["']viewport/i.test(ctx.html)) {
        return [{ suggestedFix: '<meta name="viewport" content="width=device-width, initial-scale=1">' }];
      }
      return undefined;
    },
  },
  {
    id: "structure.no-presentation-role",
    category: "html-structure",
    severity: "warning",
    title: "Layout tables missing role=\"presentation\"",
    impact:
      "Layout tables without role=\"presentation\" are announced as data tables by screen readers, creating a confusing experience.",
    recommendation:
      'Add role="presentation" to every layout <table>.',
    bestPractice:
      "role=\"presentation\" tells assistive tech to ignore table semantics used purely for layout.",
    confidence: 75,
    evaluate: (ctx) => {
      const tables = byTag(ctx, "table");
      const missing = tables.filter(
        (t) => (t.getAttribute("role") || "").toLowerCase() !== "presentation",
      );
      if (tables.length > 0 && missing.length > 0) {
        return missing.slice(0, 5).map(() => ({
          suggestedFix: '<table role="presentation" cellpadding="0" cellspacing="0" border="0">',
        }));
      }
      return undefined;
    },
  },
  {
    id: "structure.no-title",
    category: "html-structure",
    severity: "recommendation",
    title: "Missing <title> element",
    impact:
      "Some clients and accessibility tools use the document title; its absence reduces clarity for screen reader users.",
    recommendation: "Add a concise <title> describing the email.",
    bestPractice:
      "A descriptive <title> improves accessibility and helps when emails are viewed in a browser.",
    confidence: 60,
    evaluate: (ctx) => {
      if (byTag(ctx, "title").length === 0) {
        return [{ suggestedFix: "<title>Your campaign name</title>" }];
      }
      return undefined;
    },
  },
];
