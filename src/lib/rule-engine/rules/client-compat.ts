import type { Rule } from "@/lib/rule-engine/types";

/**
 * Yahoo and Apple Mail specific compatibility rules. Grouped together because
 * they share a common set of CSS-support quirks.
 */
export const clientCompatRules: Rule[] = [
  {
    id: "yahoo.style-in-head-stripped",
    category: "yahoo",
    severity: "warning",
    title: "Embedded styles relied upon (Yahoo strips head <style> historically)",
    impact:
      "Some Yahoo Mail surfaces have historically moved or stripped <head> <style>, so layout-critical embedded styles can be lost.",
    recommendation:
      "Inline layout-critical styles; reserve embedded CSS for responsive enhancements.",
    bestPractice:
      "Treat embedded CSS as progressive enhancement and inline anything essential for Yahoo reliability.",
    confidence: 50,
    evaluate: (ctx) => {
      const hasStyle = /<style/i.test(ctx.html);
      const hasInline = /style\s*=\s*["']/i.test(ctx.html);
      if (hasStyle && !hasInline) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "yahoo.media-query-class-prefix",
    category: "yahoo",
    severity: "recommendation",
    title: "Media queries depend on classes",
    impact:
      "Yahoo and some clients rewrite class names, which can disable media-query overrides that target them.",
    recommendation:
      "Use attribute selectors or inline-friendly hybrid techniques as a fallback for class-based responsive rules.",
    bestPractice:
      "Hybrid/fluid coding reduces dependence on class-based media queries that fragile clients may break.",
    confidence: 40,
    evaluate: (ctx) => {
      if (/@media[\s\S]*?\.[a-z]/i.test(ctx.html)) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "apple-mail.viewport-zoom",
    category: "apple-mail",
    severity: "recommendation",
    title: "Phone-number auto-linking not disabled",
    impact:
      "Apple Mail auto-detects phone numbers, dates and addresses and styles them as blue links, which can clash with the design.",
    recommendation:
      'Add <meta name="format-detection" content="telephone=no"> and wrap detected text to control styling.',
    bestPractice:
      "Disabling auto-detection keeps Apple Mail from injecting unwanted link styling into your copy.",
    confidence: 45,
    evaluate: (ctx) => {
      const hasPhone = /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(ctx.root.text);
      if (hasPhone && !/format-detection/i.test(ctx.html)) {
        return [{ suggestedFix: '<meta name="format-detection" content="telephone=no">' }];
      }
      return undefined;
    },
  },
  {
    id: "apple-mail.dark-mode-inversion",
    category: "apple-mail",
    severity: "recommendation",
    title: "Logo/asset may invert in Apple Mail dark mode",
    impact:
      "Apple Mail can invert colours in dark mode, turning dark logos invisible against a dark background.",
    recommendation:
      "Use transparent PNGs with a subtle stroke or provide a dark-mode swap for the logo.",
    bestPractice:
      "Designing assets to survive inversion keeps branding legible in Apple Mail dark mode.",
    confidence: 40,
    evaluate: (ctx) => {
      const hasLogoImg = /logo/i.test(ctx.html) && /<img/i.test(ctx.html);
      if (hasLogoImg && !/prefers-color-scheme/i.test(ctx.html)) {
        return [{}];
      }
      return undefined;
    },
  },
];
