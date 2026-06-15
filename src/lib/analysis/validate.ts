import { resolveProvider, parseJsonResponse } from "@/lib/ai";
import { runRuleEngine, summarize } from "@/lib/rule-engine";
import type { ValidateResult } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { withTimeout } from "@/lib/timeout";
import { GLOBAL_AI_DIRECTIVE, ISSUE_SCHEMA_HINT } from "@/lib/analysis/prompts";
import { mergeIssues, normalizeAiIssues } from "@/lib/analysis/normalize";

/** Hard budget for the AI enhancement step, kept under the function limit. */
const AI_BUDGET_MS = 45_000;

export interface ValidateOptions {
  /**
   * When false, only the deterministic rule engine runs (fast, never hits the
   * network). When true, the AI layer explains and expands the findings.
   */
  enhanceWithAi?: boolean;
}

/**
 * Deterministic-only validation. Always fast and reliable — this is the
 * page's primary result and never depends on the network.
 */
export function validateHtmlRules(html: string): ValidateResult {
  const { issues } = runRuleEngine(html);
  return {
    issues,
    summary: summarize(issues),
    modelProvider: "Deterministic Rule Engine",
    usedAi: false,
  };
}

/**
 * VALIDATE pipeline: deterministic rule engine first, then optional AI review
 * that explains and expands findings. Falls back gracefully to rule-engine-only
 * results when no AI provider is configured, the AI call fails, or it exceeds
 * the time budget.
 */
export async function validateHtml(
  html: string,
  options: ValidateOptions = {},
): Promise<ValidateResult> {
  const { issues: ruleIssues } = runRuleEngine(html);

  const provider = options.enhanceWithAi ? resolveProvider() : null;
  if (!provider) {
    return {
      issues: ruleIssues,
      summary: summarize(ruleIssues),
      modelProvider: "Deterministic Rule Engine",
      usedAi: false,
    };
  }

  try {
    const prompt = `The deterministic EmailForge rule engine already found these issues (do NOT repeat them, expand beyond them):
${JSON.stringify(
  ruleIssues.map((i) => ({ category: i.category, issue: i.issue })),
  null,
  2,
)}

Review the following HTML email and return ADDITIONAL issues the rule engine may have missed, focusing on nuanced cross-client, accessibility, deliverability, dark-mode and conversion problems. For each issue include the offending snippet and a corrected suggestedFix.

${ISSUE_SCHEMA_HINT}

Return JSON: { "issues": [ ... ] }

HTML:
${truncate(html, 16000)}`;

    const raw = await withTimeout(
      provider.completeText({
        system: GLOBAL_AI_DIRECTIVE,
        prompt,
        json: true,
      }),
      AI_BUDGET_MS,
    );
    const parsed = parseJsonResponse<{ issues: unknown[] }>(raw);
    const aiIssues = normalizeAiIssues(parsed);
    const merged = mergeIssues(ruleIssues, aiIssues);

    return {
      issues: merged,
      summary: summarize(merged),
      modelProvider: provider.label,
      usedAi: true,
    };
  } catch (err) {
    console.error("[validate] AI expansion failed, using rule engine only:", err);
    return {
      issues: ruleIssues,
      summary: summarize(ruleIssues),
      modelProvider: "Deterministic Rule Engine (AI unavailable)",
      usedAi: false,
    };
  }
}
