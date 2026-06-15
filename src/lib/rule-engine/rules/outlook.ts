import type { Rule } from "@/lib/rule-engine/types";
import { byTag, getAttr, hasAttr, snippet } from "@/lib/rule-engine/helpers";

export const outlookRules: Rule[] = [
  {
    id: "outlook.no-tables",
    category: "outlook",
    severity: "critical",
    title: "Layout not built with tables",
    impact:
      "Outlook on Windows uses the Microsoft Word rendering engine, which ignores modern CSS layout. Non-table layouts collapse or stack unpredictably.",
    recommendation:
      "Use nested <table> elements with role=\"presentation\" for layout instead of div-based positioning.",
    bestPractice:
      "Outlook (2007-2021) renders with Word's engine. Tables are the only reliable layout primitive for full client coverage.",
    confidence: 90,
    evaluate: (ctx) => {
      const tables = byTag(ctx, "table");
      const divs = byTag(ctx, "div");
      if (tables.length === 0 && divs.length > 2) {
        return [{ suggestedFix: "<table role=\"presentation\" width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"> ... </table>" }];
      }
      return undefined;
    },
  },
  {
    id: "outlook.flexbox",
    category: "outlook",
    severity: "critical",
    title: "Flexbox used for layout",
    impact:
      "display:flex is unsupported in Outlook (Word engine). Flex containers render as plain block elements, breaking columns and alignment.",
    recommendation:
      "Replace flex layouts with table columns (<td>) or stacked tables for mobile.",
    bestPractice:
      "Email layout must rely on tables; flex/grid only work in a handful of webmail clients.",
    confidence: 95,
    evaluate: (ctx) => {
      if (/display\s*:\s*flex/i.test(ctx.html)) {
        return [{ snippet: "display:flex" }];
      }
      return undefined;
    },
  },
  {
    id: "outlook.css-grid",
    category: "outlook",
    severity: "critical",
    title: "CSS Grid used for layout",
    impact:
      "display:grid is unsupported in most email clients including all desktop Outlook versions, causing total layout failure.",
    recommendation: "Use nested presentation tables instead of CSS grid.",
    bestPractice:
      "Grid has no meaningful email client support. Tables remain the layout standard.",
    confidence: 95,
    evaluate: (ctx) => {
      if (/display\s*:\s*grid/i.test(ctx.html)) {
        return [{ snippet: "display:grid" }];
      }
      return undefined;
    },
  },
  {
    id: "outlook.missing-mso-conditional",
    category: "outlook",
    severity: "warning",
    title: "No Outlook (MSO) conditional handling",
    impact:
      "Without MSO conditional comments, Outlook ignores max-width, padding and button styling, frequently producing full-width or misaligned content.",
    recommendation:
      "Add <!--[if mso]> conditional blocks for ghost tables and VML buttons targeting Outlook.",
    bestPractice:
      "Conditional comments let you ship Outlook-specific fixes (ghost tables, VML buttons) without affecting other clients.",
    confidence: 70,
    evaluate: (ctx) => {
      const hasTables = byTag(ctx, "table").length > 0;
      if (hasTables && !/\[if\s+(?:gte\s+)?mso/i.test(ctx.html)) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "outlook.background-image",
    category: "outlook",
    severity: "warning",
    title: "CSS background image without VML fallback",
    impact:
      "Outlook ignores CSS background-image. Hero sections relying on CSS backgrounds appear empty in Outlook.",
    recommendation:
      "Provide a VML <v:rect>/<v:fill> fallback for background images targeting Outlook.",
    bestPractice:
      "Use the bulletproof background-image pattern (VML + CSS) so Outlook and modern clients both render the background.",
    confidence: 75,
    evaluate: (ctx) => {
      if (
        /background-image\s*:/i.test(ctx.html) &&
        !/v:fill|v:rect/i.test(ctx.html)
      ) {
        return [{ snippet: "background-image: url(...)" }];
      }
      return undefined;
    },
  },
  {
    id: "outlook.unsupported-border-radius",
    category: "outlook",
    severity: "recommendation",
    title: "Rounded corners will not render in Outlook",
    impact:
      "border-radius is ignored by Word-engine Outlook, so rounded buttons/cards appear square there.",
    recommendation:
      "Accept square corners in Outlook or use VML rounded rectangles for buttons.",
    bestPractice:
      "Progressive enhancement: let modern clients show rounded corners while Outlook degrades gracefully to squares.",
    confidence: 60,
    evaluate: (ctx) => {
      if (/border-radius\s*:/i.test(ctx.html)) {
        return [{ snippet: "border-radius" }];
      }
      return undefined;
    },
  },
  {
    id: "outlook.img-missing-dimensions",
    category: "outlook",
    severity: "warning",
    title: "Image missing explicit width/height",
    impact:
      "Outlook can render images at their intrinsic size when width/height attributes are absent, breaking the layout before download.",
    recommendation:
      "Add explicit width and height attributes to every <img>.",
    bestPractice:
      "Explicit pixel dimensions reserve space and prevent reflow across Outlook and other clients.",
    confidence: 80,
    evaluate: (ctx) => {
      const imgs = byTag(ctx, "img");
      return imgs
        .filter((img) => !hasAttr(img, "width") || !hasAttr(img, "height"))
        .map((img) => ({
          snippet: snippet(img),
          suggestedFix: (() => {
            const src = getAttr(img, "src") ?? "";
            return `<img src="${src}" width="600" height="auto" alt="..." style="display:block;" />`;
          })(),
        }));
    },
  },
];
