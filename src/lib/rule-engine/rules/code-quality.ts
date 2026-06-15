import type { Rule } from "@/lib/rule-engine/types";
import { byTag, snippet } from "@/lib/rule-engine/helpers";

export const codeQualityRules: Rule[] = [
  {
    id: "code-quality.javascript",
    category: "code-quality",
    severity: "critical",
    title: "JavaScript present in email",
    impact:
      "Email clients strip <script> for security. JavaScript never executes and can flag the message as suspicious.",
    recommendation: "Remove all <script> tags and on* event handlers.",
    bestPractice:
      "Email is a no-JavaScript environment. Interactivity must use supported CSS techniques only.",
    confidence: 95,
    evaluate: (ctx) => {
      const scripts = byTag(ctx, "script");
      const handlers = /\son\w+\s*=/i.test(ctx.html);
      const findings = scripts.map((s) => ({ snippet: snippet(s, 120) }));
      if (handlers) findings.push({ snippet: "inline on* event handler" });
      return findings.length ? findings : undefined;
    },
  },
  {
    id: "code-quality.external-stylesheet",
    category: "code-quality",
    severity: "critical",
    title: "External stylesheet link",
    impact:
      "<link rel=\"stylesheet\"> is not loaded by most email clients, so the email renders unstyled.",
    recommendation:
      "Inline styles and move media queries into an embedded <style> tag.",
    bestPractice:
      "Email clients do not fetch external CSS; styles must be inline or embedded.",
    confidence: 90,
    evaluate: (ctx) => {
      if (/<link[^>]+stylesheet/i.test(ctx.html)) {
        return [{ snippet: '<link rel="stylesheet" ...>' }];
      }
      return undefined;
    },
  },
  {
    id: "code-quality.position-absolute",
    category: "code-quality",
    severity: "warning",
    title: "Absolute/fixed positioning used",
    impact:
      "position:absolute and position:fixed are unsupported in most clients and break layouts unpredictably.",
    recommendation:
      "Use table cells and natural document flow instead of positioning.",
    bestPractice:
      "Positioning schemes from web design do not translate to email's fragmented rendering engines.",
    confidence: 80,
    evaluate: (ctx) => {
      if (/position\s*:\s*(absolute|fixed)/i.test(ctx.html)) {
        return [{ snippet: "position: absolute/fixed" }];
      }
      return undefined;
    },
  },
  {
    id: "code-quality.unclosed-tags",
    category: "code-quality",
    severity: "warning",
    title: "Unbalanced table tags",
    impact:
      "Mismatched <table>/<td>/<tr> counts indicate malformed markup that renders inconsistently across clients.",
    recommendation: "Ensure every opening table tag has a matching close tag.",
    bestPractice:
      "Well-formed, balanced markup is essential because email engines are far less forgiving than browsers.",
    confidence: 60,
    evaluate: (ctx) => {
      const open = (ctx.lowerHtml.match(/<table\b/g) || []).length;
      const close = (ctx.lowerHtml.match(/<\/table>/g) || []).length;
      if (open !== close) {
        return [{ snippet: `${open} <table> vs ${close} </table>` }];
      }
      return undefined;
    },
  },
  {
    id: "code-quality.inline-style-missing",
    category: "code-quality",
    severity: "recommendation",
    title: "Styling relies on embedded CSS only",
    impact:
      "Clients that strip <style> (some Gmail surfaces, older clients) will lose all styling if nothing is inlined.",
    recommendation:
      "Inline presentational styles and keep <style> for media queries as progressive enhancement.",
    bestPractice:
      "Inlining is the most resilient styling strategy for cross-client consistency.",
    confidence: 50,
    evaluate: (ctx) => {
      const hasStyleTag = byTag(ctx, "style").length > 0;
      const hasInline = /style\s*=\s*["']/i.test(ctx.html);
      if (hasStyleTag && !hasInline) {
        return [{}];
      }
      return undefined;
    },
  },
];
