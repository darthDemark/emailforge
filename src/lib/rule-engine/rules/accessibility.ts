import type { Rule } from "@/lib/rule-engine/types";
import { byTag, getAttr, hasAttr, snippet } from "@/lib/rule-engine/helpers";

export const accessibilityRules: Rule[] = [
  {
    id: "a11y.img-missing-alt",
    category: "accessibility",
    severity: "critical",
    title: "Image missing alt attribute",
    impact:
      "Screen readers cannot describe images without alt text, and when images are blocked the message loses meaning. Empty alt is required even for decorative images.",
    recommendation:
      'Add descriptive alt text to meaningful images and alt="" to decorative ones.',
    bestPractice:
      "WCAG 1.1.1 requires text alternatives. Alt text also shows when images are blocked (common in Outlook by default).",
    confidence: 90,
    evaluate: (ctx) => {
      const imgs = byTag(ctx, "img");
      return imgs
        .filter((img) => !hasAttr(img, "alt"))
        .map((img) => ({
          snippet: snippet(img),
          suggestedFix: `<img src="${getAttr(img, "src") ?? "..."}" alt="Describe the image" width="..." height="..." style="display:block;" />`,
        }));
    },
  },
  {
    id: "a11y.missing-lang",
    category: "accessibility",
    severity: "warning",
    title: "Missing lang attribute on <html>",
    impact:
      "Without a lang attribute, screen readers may use the wrong pronunciation engine, degrading the experience for assistive tech users.",
    recommendation: 'Add lang (e.g. <html lang="en">) to the root element.',
    bestPractice:
      "Declaring the document language is a WCAG 3.1.1 requirement and improves screen reader pronunciation.",
    confidence: 75,
    evaluate: (ctx) => {
      const html = byTag(ctx, "html")[0];
      if (html && !hasAttr(html, "lang")) {
        return [{ suggestedFix: '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">' }];
      }
      return undefined;
    },
  },
  {
    id: "a11y.small-font",
    category: "accessibility",
    severity: "warning",
    title: "Body font size below 14px",
    impact:
      "Font sizes under 14px are hard to read on mobile and fail comfortable-reading guidelines, increasing eye strain.",
    recommendation: "Use at least 14px (16px preferred) for body copy.",
    bestPractice:
      "Larger base font sizes improve legibility, especially on small screens and for low-vision users.",
    confidence: 70,
    evaluate: (ctx) => {
      const matches = [...ctx.html.matchAll(/font-size\s*:\s*(\d+)px/gi)];
      const small = matches.filter((m) => Number(m[1]) > 0 && Number(m[1]) < 14);
      if (small.length > 0) {
        return small.slice(0, 5).map((m) => ({ snippet: m[0] }));
      }
      return undefined;
    },
  },
  {
    id: "a11y.empty-link",
    category: "accessibility",
    severity: "warning",
    title: "Link without discernible text",
    impact:
      "Links containing only an image with no alt text, or no text at all, are announced as 'link' with no context by screen readers.",
    recommendation:
      "Ensure every <a> contains text or an image with meaningful alt text.",
    bestPractice:
      "WCAG 2.4.4 requires link purpose to be clear from its text or accessible name.",
    confidence: 65,
    evaluate: (ctx) => {
      const links = byTag(ctx, "a");
      return links
        .filter((a) => {
          const text = a.text.trim();
          if (text.length > 0) return false;
          const img = a.querySelector("img");
          const alt = img ? (img.getAttribute("alt") || "").trim() : "";
          return alt.length === 0;
        })
        .slice(0, 5)
        .map((a) => ({ snippet: snippet(a) }));
    },
  },
];
