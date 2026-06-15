import type { Rule } from "@/lib/rule-engine/types";
import { byTag } from "@/lib/rule-engine/helpers";

export const deliverabilityRules: Rule[] = [
  {
    id: "deliverability.image-text-ratio",
    category: "deliverability",
    severity: "warning",
    title: "Image-heavy design (poor image-to-text ratio)",
    impact:
      "Emails that are mostly images trigger spam filters, fail when images are blocked, and reduce accessibility.",
    recommendation:
      "Aim for a healthy balance of live HTML text to images (roughly 60/40 text to image).",
    bestPractice:
      "Spam filters favour a meaningful amount of live text. Image-only emails are a classic spam signal.",
    confidence: 65,
    evaluate: (ctx) => {
      const imgs = byTag(ctx, "img").length;
      const text = ctx.root.text.replace(/\s+/g, " ").trim().length;
      if (imgs >= 3 && text < 200) {
        return [{ snippet: `${imgs} images, ~${text} chars of text` }];
      }
      return undefined;
    },
  },
  {
    id: "deliverability.no-unsubscribe",
    category: "deliverability",
    severity: "critical",
    title: "Missing unsubscribe link",
    impact:
      "CAN-SPAM and GDPR require a clear opt-out. Missing unsubscribe links cause legal risk and spam complaints that damage sender reputation.",
    recommendation:
      "Include a visible unsubscribe link in the footer.",
    bestPractice:
      "A working unsubscribe mechanism is legally required and improves long-term deliverability.",
    confidence: 70,
    evaluate: (ctx) => {
      if (!/unsubscribe|opt[\s-]?out|manage\s+preferences/i.test(ctx.html)) {
        return [{ suggestedFix: '<a href="{{unsubscribe_url}}">Unsubscribe</a>' }];
      }
      return undefined;
    },
  },
  {
    id: "deliverability.no-physical-address",
    category: "deliverability",
    severity: "warning",
    title: "No physical mailing address detected",
    impact:
      "CAN-SPAM requires a valid physical postal address. Its absence increases spam-filter scrutiny and legal exposure.",
    recommendation:
      "Add your company's physical mailing address to the footer.",
    bestPractice:
      "A postal address in the footer is both a legal requirement and a trust/deliverability signal.",
    confidence: 45,
    evaluate: (ctx) => {
      const text = ctx.root.text;
      const hasZip = /\b\d{5}(?:-\d{4})?\b/.test(text);
      const hasStreet = /\b(street|st\.|ave|avenue|road|rd\.|suite|ste\.|blvd|p\.?o\.? box)\b/i.test(text);
      if (!hasZip && !hasStreet) {
        return [{}];
      }
      return undefined;
    },
  },
  {
    id: "deliverability.spammy-subjectish-text",
    category: "deliverability",
    severity: "recommendation",
    title: "Spam-trigger phrasing detected",
    impact:
      "Phrases like 'FREE!!!', 'act now', or excessive exclamation/caps raise spam scores and can route messages to junk.",
    recommendation:
      "Soften promotional language and avoid ALL CAPS and repeated exclamation marks.",
    bestPractice:
      "Content-based spam filters penalise classic spam phrasing; clear, honest copy performs better.",
    confidence: 45,
    evaluate: (ctx) => {
      const text = ctx.root.text;
      if (/!!!|\b100%\s*free\b|\bact now\b|\brisk[- ]?free\b/i.test(text)) {
        return [{}];
      }
      return undefined;
    },
  },
];
