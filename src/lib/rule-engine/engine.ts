import { parse } from "node-html-parser";

import type {
  AnalysisSummary,
  CategoryScore,
  EmailIssue,
  RuleCategory,
  Severity,
} from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/types";
import { clamp } from "@/lib/utils";
import type { Rule, RuleContext } from "@/lib/rule-engine/types";
import { allRules } from "@/lib/rule-engine/rules";

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 25,
  warning: 10,
  recommendation: 3,
};

function buildContext(html: string): RuleContext {
  const root = parse(html, {
    lowerCaseTagName: false,
    comment: true,
    blockTextElements: { script: true, style: true, pre: true },
  });

  let cachedElements: ReturnType<typeof root.querySelectorAll> | null = null;

  return {
    html,
    lowerHtml: html.toLowerCase(),
    root,
    get elements() {
      if (!cachedElements) {
        cachedElements = root.querySelectorAll("*");
      }
      return cachedElements;
    },
  };
}

let issueCounter = 0;
function nextId(ruleId: string): string {
  issueCounter += 1;
  return `${ruleId}-${issueCounter}`;
}

function ruleToIssues(rule: Rule, ctx: RuleContext): EmailIssue[] {
  let findings;
  try {
    findings = rule.evaluate(ctx);
  } catch {
    return [];
  }
  if (!findings || findings.length === 0) return [];

  return findings.map((finding) => ({
    id: nextId(rule.id),
    ruleId: rule.id,
    severity: rule.severity,
    confidence: clamp(finding.confidence ?? rule.confidence, 0, 100),
    category: rule.category,
    issue: finding.issueOverride ?? rule.title,
    impact: rule.impact,
    recommendation: rule.recommendation,
    bestPractice: rule.bestPractice,
    snippet: finding.snippet,
    suggestedFix: finding.suggestedFix,
    source: "rule-engine" as const,
  }));
}

/**
 * Compute an overall health score and per-category breakdown from a set of
 * issues. Each category starts at 100 and is penalised by the weighted sum of
 * its issues' severities.
 */
export function summarize(issues: EmailIssue[]): AnalysisSummary {
  const penaltyByCategory = new Map<RuleCategory, number>();
  const countByCategory = new Map<RuleCategory, number>();

  for (const issue of issues) {
    penaltyByCategory.set(
      issue.category,
      (penaltyByCategory.get(issue.category) ?? 0) +
        SEVERITY_WEIGHT[issue.severity],
    );
    countByCategory.set(
      issue.category,
      (countByCategory.get(issue.category) ?? 0) + 1,
    );
  }

  const categoryScores: CategoryScore[] = ALL_CATEGORIES.map((category) => ({
    category,
    score: clamp(100 - (penaltyByCategory.get(category) ?? 0), 0, 100),
    issueCount: countByCategory.get(category) ?? 0,
  }));

  const activeCategories = categoryScores.filter((c) => c.issueCount > 0);
  const healthScore =
    activeCategories.length === 0
      ? 100
      : Math.round(
          clamp(
            100 -
              issues.reduce(
                (sum, i) => sum + SEVERITY_WEIGHT[i.severity],
                0,
              ) /
                Math.max(1, ALL_CATEGORIES.length) *
                1.2,
            0,
            100,
          ),
        );

  return {
    healthScore,
    criticalCount: issues.filter((i) => i.severity === "critical").length,
    warningCount: issues.filter((i) => i.severity === "warning").length,
    recommendationCount: issues.filter((i) => i.severity === "recommendation")
      .length,
    categoryScores,
  };
}

export interface RunOptions {
  /** Restrict execution to a subset of categories. */
  categories?: RuleCategory[];
}

/**
 * Run the deterministic rule engine against HTML. This executes BEFORE any AI
 * analysis; the AI layer then explains and expands on these findings.
 */
export function runRuleEngine(
  html: string,
  options: RunOptions = {},
): { issues: EmailIssue[]; summary: AnalysisSummary } {
  const ctx = buildContext(html);
  const active = options.categories
    ? allRules.filter((r) => options.categories!.includes(r.category))
    : allRules;

  const issues = active.flatMap((rule) => ruleToIssues(rule, ctx));

  const order: Record<Severity, number> = {
    critical: 0,
    warning: 1,
    recommendation: 2,
  };
  issues.sort((a, b) => {
    const sev = order[a.severity] - order[b.severity];
    if (sev !== 0) return sev;
    return b.confidence - a.confidence;
  });

  return { issues, summary: summarize(issues) };
}

export function ruleCount(): number {
  return allRules.length;
}
