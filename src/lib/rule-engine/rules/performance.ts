import type { Rule } from "@/lib/rule-engine/types";
import { byTag, getAttr } from "@/lib/rule-engine/helpers";

export const performanceRules: Rule[] = [
  {
    id: "performance.too-many-images",
    category: "performance",
    severity: "recommendation",
    title: "High image count",
    impact:
      "Many images increase load time on mobile networks and the chance of broken images when some fail to load.",
    recommendation:
      "Consolidate decorative images and replace text-in-image with live HTML text where possible.",
    bestPractice:
      "Fewer, optimised images load faster and degrade more gracefully when blocked.",
    confidence: 50,
    evaluate: (ctx) => {
      const imgs = byTag(ctx, "img").length;
      if (imgs > 15) {
        return [{ snippet: `${imgs} images` }];
      }
      return undefined;
    },
  },
  {
    id: "performance.base64-images",
    category: "performance",
    severity: "warning",
    title: "Base64-embedded images",
    impact:
      "Inline base64 images bloat the HTML, are blocked by Outlook and Gmail, and push the email toward Gmail's clipping limit.",
    recommendation:
      "Host images on a CDN and reference them by URL instead of embedding base64.",
    bestPractice:
      "External, hosted images keep HTML small and are far more reliably rendered than data URIs.",
    confidence: 80,
    evaluate: (ctx) => {
      if (/src\s*=\s*["']data:image\//i.test(ctx.html)) {
        return [{ snippet: "src=\"data:image/...\"" }];
      }
      return undefined;
    },
  },
  {
    id: "performance.large-html",
    category: "performance",
    severity: "recommendation",
    title: "Large HTML payload",
    impact:
      "Large HTML is slower to load on mobile and risks Gmail clipping past 102KB.",
    recommendation:
      "Minify markup, remove unused styles and comments to reduce payload size.",
    bestPractice:
      "Lean HTML loads faster and avoids client truncation.",
    confidence: 55,
    evaluate: (ctx) => {
      const bytes = Buffer.byteLength(ctx.html, "utf8");
      if (bytes > 60000) {
        return [{ snippet: `${Math.round(bytes / 1024)}KB` }];
      }
      return undefined;
    },
  },
  {
    id: "performance.missing-image-dimensions",
    category: "performance",
    severity: "recommendation",
    title: "Images without dimensions cause reflow",
    impact:
      "Images lacking width/height reflow the layout as they load, creating a janky experience on slow connections.",
    recommendation: "Specify width and height on all images.",
    bestPractice:
      "Reserving image space with explicit dimensions prevents layout shift while loading.",
    confidence: 50,
    evaluate: (ctx) => {
      const imgs = byTag(ctx, "img");
      const missing = imgs.filter(
        (img) => !getAttr(img, "width") || !getAttr(img, "height"),
      );
      if (missing.length > 0) {
        return [{ snippet: `${missing.length} image(s) without dimensions` }];
      }
      return undefined;
    },
  },
];
