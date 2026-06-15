import { resolveProvider, parseJsonResponse } from "@/lib/ai";
import { runRuleEngine, summarize } from "@/lib/rule-engine";
import type { ValidateResult } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { GLOBAL_AI_DIRECTIVE, ISSUE_SCHEMA_HINT } from "@/lib/analysis/prompts";
import { mergeIssues, normalizeAiIssues } from "@/lib/analysis/normalize";

/**
 * VALIDATE pipeline: deterministic rule engine first, then optional AI review
 * that explains and expands findings. Falls back gracefully to rule-engine-only
 * results when no AI provider is configured.
 */
export async function validateHtml(html: string): Promise<ValidateResult> {
  const { issues: ruleIssues } = runRuleEngine(html);

  const provider = resolveProvider();
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

    const raw = await provider.completeText({
      system: GLOBAL_AI_DIRECTIVE,
      prompt,
      json: true,
    });
    const parsed = parseJsonResponse<{ issues: unknown[] }>(raw);
    const aiIssues = normalizeAiIssues(parsed);
    const merged = mergeIssues(ruleIssues, aiIssues);

    return {
      issues: merged,
      summary: summarize(merged),
      modelProvider: provider.label,
      usedAi: true,
    };
  } catch {
    return {
      issues: ruleIssues,
      summary: summarize(ruleIssues),
      modelProvider: "Deterministic Rule Engine (AI unavailable)",
      usedAi: false,
    };
  }
}
