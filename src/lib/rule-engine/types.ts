import type { HTMLElement } from "node-html-parser";

import type { RuleCategory, Severity } from "@/lib/types";

/**
 * Parsed context handed to every rule. Built once per analysis and shared
 * across all rules so parsing happens a single time regardless of how many
 * rules execute. This keeps the engine performant as the rule set grows to
 * hundreds of rules.
 */
export interface RuleContext {
  /** Raw HTML as supplied. */
  html: string;
  /** Lowercased HTML for cheap case-insensitive scanning. */
  lowerHtml: string;
  /** Parsed DOM root. */
  root: HTMLElement;
  /** All elements, flattened, computed lazily and cached. */
  readonly elements: HTMLElement[];
}

/**
 * A single match produced by a rule. One rule may produce several findings
 * (e.g. multiple images missing alt text).
 */
export interface RuleFinding {
  snippet?: string;
  suggestedFix?: string;
  /** Optional per-finding confidence override (0-100). */
  confidence?: number;
  /** Optional issue-name override for nuanced findings. */
  issueOverride?: string;
}

/**
 * Declarative rule definition. New rules only need to implement `evaluate`,
 * which returns the list of findings (empty/undefined means the rule passed).
 */
export interface Rule {
  id: string;
  category: RuleCategory;
  severity: Severity;
  /** Short issue name. */
  title: string;
  /** Why it matters (impact). */
  impact: string;
  /** Prose recommendation. */
  recommendation: string;
  /** Educational best-practice reasoning. */
  bestPractice: string;
  /** Baseline confidence for this rule (0-100). */
  confidence: number;
  /**
   * Evaluate the rule against the context. Return findings for each violation.
   * Returning an empty array (or undefined) means the rule passed.
   */
  evaluate: (ctx: RuleContext) => RuleFinding[] | undefined;
}
