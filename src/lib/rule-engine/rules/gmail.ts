import type { Rule } from "@/lib/rule-engine/types";
import { byTag, snippet } from "@/lib/rule-engine/helpers";

export const gmailRules: Rule[] = [
  {
    id: "gmail.style-in-body",
    category: "gmail",
    severity: "warning",
    title: "<style> block in body or excessive embedded CSS",
    impact:
      "Gmail strips/normalises some <style> rules and clips messages over 102KB. Heavy embedded CSS risks being dropped or causing the 'View entire message' clip.",
    recommendation:
      "Inline critical styles on elements and keep <style> reserved for media queries in <head>.",
    bestPractice:
      "Gmail supports <style> in <head> but inlined styles are the most reliable baseline across all Gmail surfaces (web, iOS, Android).",
    confidence: 65,
    evaluate: (ctx) => {
      const styleBlocks = byTag(ctx, "style");
      const totalLen = styleBlocks.reduce(
        (sum, s) => sum + s.innerHTML.length,
        0,
      );
      if (totalLen > 4000) {
        return [{ snippet: `~${totalLen} chars of embedded CSS` }];
      }
      return undefined;
    },
  },
  {
    id: "gmail.message-clipping",
    category: "gmail",
    severity: "warning",
    title: "Email size approaches Gmail 102KB clipping limit",
    impact:
      "Gmail clips messages larger than 102KB, hiding content and the unsubscribe footer behind a 'View entire message' link, which hurts engagement and compliance.",
    recommendation:
      "Reduce HTML size: trim whitespace, remove unused CSS, and host images externally.",
    bestPractice:
      "Keep total HTML under ~100KB so Gmail never clips the message.",
    confidence: 85,
    evaluate: (ctx) => {
      const bytes = Buffer.byteLength(ctx.html, "utf8");
      if (bytes > 90000) {
        return [{ snippet: `${Math.round(bytes / 1024)}KB HTML` }];
      }
      return undefined;
    },
  },
  {
    id: "gmail.class-on-body",
    category: "gmail",
    severity: "recommendation",
    title: "Relying on classes Gmail may rewrite",
    impact:
      "Gmail prefixes class names and IDs, which can break CSS selectors that target them, especially for dark mode or media-query overrides.",
    recommendation:
      "Use attribute selectors or data-* hooks and keep important styles inline.",
    bestPractice:
      "Because Gmail mangles class/id names, never depend on them for layout-critical styling.",
    confidence: 55,
    evaluate: (ctx) => {
      const styleBlocks = byTag(ctx, "style");
      const usesId = styleBlocks.some((s) => /#[a-z][\w-]*/i.test(s.innerHTML));
      if (usesId) {
        return [{ snippet: "#id selector in <style>" }];
      }
      return undefined;
    },
  },
];
