import type { Rule } from "@/lib/rule-engine/types";
import { byTag, getAttr, snippet } from "@/lib/rule-engine/helpers";

export const mobileRules: Rule[] = [
  {
    id: "mobile.no-media-queries",
    category: "mobile",
    severity: "warning",
    title: "No responsive media queries",
    impact:
      "Without media queries the layout cannot adapt to small screens, causing horizontal scrolling and tiny tap targets on mobile.",
    recommendation:
      "Add @media (max-width: 600px) rules to stack columns and resize text/buttons.",
    bestPractice:
      "Responsive media queries (or a hybrid/fluid approach) are essential since the majority of email opens are on mobile.",
    confidence: 75,
    evaluate: (ctx) => {
      if (!/@media/i.test(ctx.html)) {
        return [{ suggestedFix: "@media (max-width: 600px) { .column { width: 100% !important; display: block !important; } }" }];
      }
      return undefined;
    },
  },
  {
    id: "mobile.fixed-wide-width",
    category: "mobile",
    severity: "warning",
    title: "Container wider than 600px",
    impact:
      "Containers wider than ~600px force horizontal scrolling or shrink-to-fit zooming on mobile devices.",
    recommendation:
      "Constrain the main container to 600px and use width=\"100%\" with max-width for fluidity.",
    bestPractice:
      "600px is the de facto safe maximum width for email content across clients and devices.",
    confidence: 70,
    evaluate: (ctx) => {
      const tables = byTag(ctx, "table");
      const wide = tables.filter((t) => {
        const w = Number((getAttr(t, "width") || "").replace(/[^\d]/g, ""));
        return w > 640;
      });
      if (wide.length > 0) {
        return wide.slice(0, 3).map((t) => ({ snippet: snippet(t, 120) }));
      }
      return undefined;
    },
  },
  {
    id: "mobile.small-tap-target",
    category: "mobile",
    severity: "warning",
    title: "Touch target likely below 44px",
    impact:
      "Buttons/links with little padding are hard to tap accurately on touchscreens, hurting conversion and accessibility.",
    recommendation:
      "Give CTAs at least 44px of tappable height via padding (e.g. padding: 14px 24px).",
    bestPractice:
      "Apple and WCAG recommend a minimum 44x44px touch target for comfortable tapping.",
    confidence: 55,
    evaluate: (ctx) => {
      const links = byTag(ctx, "a");
      const buttons = links.filter((a) => {
        const style = (getAttr(a, "style") || "").toLowerCase();
        return /background/.test(style) || /border/.test(style);
      });
      const tiny = buttons.filter((a) => {
        const style = (getAttr(a, "style") || "").toLowerCase();
        const pad = style.match(/padding\s*:\s*(\d+)px/);
        return pad ? Number(pad[1]) < 12 : !/padding/.test(style);
      });
      if (tiny.length > 0) {
        return tiny.slice(0, 3).map((a) => ({ snippet: snippet(a, 140) }));
      }
      return undefined;
    },
  },
];
