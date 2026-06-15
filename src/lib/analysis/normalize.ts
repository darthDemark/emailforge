import type {
  AnnotationMarker,
  DetectedComponent,
  DetectedComponentType,
  EmailIssue,
  Optimization,
  RuleCategory,
  Severity,
} from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/types";
import { clamp } from "@/lib/utils";

const SEVERITIES: Severity[] = ["critical", "warning", "recommendation"];
const COMPONENT_TYPES: DetectedComponentType[] = [
  "logo",
  "header",
  "hero",
  "headline",
  "body-copy",
  "cta",
  "product-grid",
  "promotional-block",
  "social-icons",
  "footer",
  "legal-copy",
];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asCategory(value: unknown): RuleCategory {
  const v = asString(value).toLowerCase().replace(/\s+/g, "-");
  return (ALL_CATEGORIES as string[]).includes(v)
    ? (v as RuleCategory)
    : "code-quality";
}

function asSeverity(value: unknown): Severity {
  const v = asString(value).toLowerCase();
  return (SEVERITIES as string[]).includes(v) ? (v as Severity) : "recommendation";
}

let aiIssueSeq = 0;

/** Normalise a loosely-typed AI issue object into a strict {@link EmailIssue}. */
export function normalizeAiIssue(raw: unknown): EmailIssue | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const issue = asString(obj.issue ?? obj.title ?? obj.name);
  if (!issue) return null;

  aiIssueSeq += 1;

  const marker = obj.marker as Record<string, unknown> | undefined;
  let annotation: AnnotationMarker | undefined;
  if (
    marker &&
    typeof marker.x === "number" &&
    typeof marker.y === "number"
  ) {
    annotation = {
      index: 0,
      x: clamp(marker.x, 0, 1),
      y: clamp(marker.y, 0, 1),
    };
  }

  return {
    id: `ai-${aiIssueSeq}`,
    severity: asSeverity(obj.severity),
    confidence: clamp(Number(obj.confidence) || 70, 0, 100),
    category: asCategory(obj.category),
    issue,
    impact: asString(obj.impact ?? obj.why ?? obj.reason, "See recommendation."),
    recommendation: asString(
      obj.recommendation ?? obj.solution ?? obj.fix,
      "Review against email best practices.",
    ),
    bestPractice: asString(obj.bestPractice ?? obj.best_practice),
    snippet: asString(obj.snippet) || undefined,
    suggestedFix: asString(obj.suggestedFix ?? obj.suggested_fix) || undefined,
    source: "ai",
    marker: annotation,
  };
}

export function normalizeAiIssues(raw: unknown): EmailIssue[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>)?.issues)
      ? ((raw as Record<string, unknown>).issues as unknown[])
      : [];
  return list
    .map(normalizeAiIssue)
    .filter((x): x is EmailIssue => x !== null);
}

export function normalizeComponents(raw: unknown): DetectedComponent[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>)?.components)
      ? ((raw as Record<string, unknown>).components as unknown[])
      : [];

  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const type = asString(obj.type).toLowerCase().replace(/\s+/g, "-");
      const resolved: DetectedComponentType = (
        COMPONENT_TYPES as string[]
      ).includes(type)
        ? (type as DetectedComponentType)
        : "body-copy";
      return {
        type: resolved,
        label: asString(obj.label ?? obj.name, resolved),
        description: asString(obj.description, ""),
        confidence: clamp(Number(obj.confidence) || 75, 0, 100),
      } satisfies DetectedComponent;
    })
    .filter((x): x is DetectedComponent => x !== null);
}

export function normalizeOptimizations(raw: unknown): Optimization[] {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray((raw as Record<string, unknown>)?.optimizations)
      ? ((raw as Record<string, unknown>).optimizations as unknown[])
      : [];

  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const title = asString(obj.title ?? obj.name);
      if (!title) return null;
      return {
        title,
        detail: asString(obj.detail ?? obj.description, ""),
        category: asCategory(obj.category),
      } satisfies Optimization;
    })
    .filter((x): x is Optimization => x !== null);
}

/**
 * Merge rule-engine issues with AI issues, de-duplicating AI issues that
 * clearly restate a rule-engine finding (same category + similar title).
 */
export function mergeIssues(
  ruleIssues: EmailIssue[],
  aiIssues: EmailIssue[],
): EmailIssue[] {
  const seen = new Set(
    ruleIssues.map((i) => `${i.category}:${i.issue.toLowerCase().slice(0, 24)}`),
  );
  const uniqueAi = aiIssues.filter(
    (i) => !seen.has(`${i.category}:${i.issue.toLowerCase().slice(0, 24)}`),
  );

  const order: Record<Severity, number> = {
    critical: 0,
    warning: 1,
    recommendation: 2,
  };
  return [...ruleIssues, ...uniqueAi].sort((a, b) => {
    const sev = order[a.severity] - order[b.severity];
    if (sev !== 0) return sev;
    return b.confidence - a.confidence;
  });
}
