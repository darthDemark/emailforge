import { describe, expect, it } from "vitest";

import { runRuleEngine, ruleCount } from "@/lib/rule-engine";

describe("rule engine", () => {
  it("registers a non-trivial number of rules", () => {
    expect(ruleCount()).toBeGreaterThan(20);
  });

  it("flags critical issues for a poor email", () => {
    const badHtml = `<html><body>
      <div style="display:flex"><script>alert(1)</script>
      <img src="x.png" />
      <a href="#">Click here</a>
      </div>
    </body></html>`;

    const { issues, summary } = runRuleEngine(badHtml);
    const ids = issues.map((i) => i.ruleId);

    expect(ids).toContain("code-quality.javascript");
    expect(ids).toContain("outlook.flexbox");
    expect(ids).toContain("a11y.img-missing-alt");
    expect(summary.criticalCount).toBeGreaterThan(0);
    expect(summary.healthScore).toBeLessThan(100);
  });

  it("returns a high score for a clean, table-based email", () => {
    const goodHtml = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light dark" />
      <title>Clean</title>
      <style>@media (max-width:600px){.c{width:100%}} @media (prefers-color-scheme: dark){body{background:#111}}</style>
    </head>
    <body>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px; padding:16px;">
          <img src="https://cdn.test/logo.png" width="160" height="40" alt="Logo" style="display:block" />
          <p>Hello, this is a healthy email with plenty of live text content to satisfy the image to text ratio checks and provide a good reading experience for everyone.</p>
          <a href="https://example.com" style="background:#111; padding:14px 24px; color:#fff;">Start my free trial</a>
          <p>EmailForge Inc, 123 Sender Street, Suite 100, City 94107. <a href="{{unsubscribe_url}}">Unsubscribe</a></p>
        </td></tr>
      </table>
    </body>
    </html>`;

    const { summary } = runRuleEngine(goodHtml);
    expect(summary.criticalCount).toBe(0);
    expect(summary.healthScore).toBeGreaterThan(70);
  });

  it("can restrict execution to specific categories", () => {
    const html = `<html><body><div style="display:flex"></div></body></html>`;
    const { issues } = runRuleEngine(html, { categories: ["accessibility"] });
    expect(issues.every((i) => i.category === "accessibility")).toBe(true);
  });
});
