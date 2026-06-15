/**
 * Shared domain types for EmailForge.
 *
 * These types form the contract between the deterministic rule engine,
 * the AI analysis layer, and the UI. Every issue produced anywhere in the
 * platform conforms to {@link EmailIssue} so components can render results
 * uniformly regardless of whether they came from rules or AI.
 */

export type Severity = "critical" | "warning" | "recommendation";

/**
 * Email rule / analysis categories. Designed for expansion to hundreds of
 * rules; new categories can be appended without breaking existing code.
 */
export type RuleCategory =
  | "outlook"
  | "gmail"
  | "yahoo"
  | "apple-mail"
  | "mobile"
  | "accessibility"
  | "dark-mode"
  | "deliverability"
  | "html-structure"
  | "code-quality"
  | "conversion"
  | "performance"
  | "maintainability";

export const CATEGORY_LABELS: Record<RuleCategory, string> = {
  outlook: "Outlook Compatibility",
  gmail: "Gmail Compatibility",
  yahoo: "Yahoo Compatibility",
  "apple-mail": "Apple Mail Compatibility",
  mobile: "Mobile Responsiveness",
  accessibility: "Accessibility",
  "dark-mode": "Dark Mode",
  deliverability: "Deliverability",
  "html-structure": "HTML Structure",
  "code-quality": "Code Quality",
  conversion: "Conversion Optimization",
  performance: "Performance",
  maintainability: "Maintainability",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as RuleCategory[];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  recommendation: "Recommendation",
};

/**
 * Canonical issue representation used throughout the platform.
 */
export interface EmailIssue {
  id: string;
  /** Stable identifier of the rule that produced the issue (when applicable). */
  ruleId?: string;
  severity: Severity;
  /** Confidence score 0-100. */
  confidence: number;
  category: RuleCategory;
  /** Short human-readable issue name. */
  issue: string;
  /** Why this is a problem (impact). */
  impact: string;
  /** Recommended fix in prose. */
  recommendation: string;
  /** Best-practice / educational reasoning behind the recommendation. */
  bestPractice?: string;
  /** Source HTML snippet that triggered the issue, if any. */
  snippet?: string;
  /** Suggested corrected code. */
  suggestedFix?: string;
  /** Origin of the issue. */
  source: "rule-engine" | "ai";
  /** Position metadata for visual annotation (VISION) when provided by AI. */
  marker?: AnnotationMarker;
}

/**
 * Normalised marker coordinates (0-1 relative to the rendered image) used
 * by the visual annotation overlay on the VISION page.
 */
export interface AnnotationMarker {
  /** Sequential number shown in the overlay badge. */
  index: number;
  /** Relative x position (0-1). */
  x: number;
  /** Relative y position (0-1). */
  y: number;
}

export interface CategoryScore {
  category: RuleCategory;
  score: number;
  issueCount: number;
}

export interface AnalysisSummary {
  healthScore: number;
  criticalCount: number;
  warningCount: number;
  recommendationCount: number;
  categoryScores: CategoryScore[];
}

/** Components the VISION model is asked to detect in a design. */
export type DetectedComponentType =
  | "logo"
  | "header"
  | "hero"
  | "headline"
  | "body-copy"
  | "cta"
  | "product-grid"
  | "promotional-block"
  | "social-icons"
  | "footer"
  | "legal-copy";

export interface DetectedComponent {
  type: DetectedComponentType;
  label: string;
  description: string;
  confidence: number;
}

/** Result of the VISION analysis pipeline. */
export interface VisionResult {
  components: DetectedComponent[];
  issues: EmailIssue[];
  summary: AnalysisSummary;
  modelProvider: string;
  usedAi: boolean;
}

export type ConvertOutputMode = "standard" | "sfmc" | "mjml" | "foundation";

export const CONVERT_OUTPUT_MODES: { value: ConvertOutputMode; label: string; description: string }[] = [
  { value: "standard", label: "Standard HTML Email", description: "Table-based, inline CSS, broad client support." },
  { value: "sfmc", label: "Salesforce Marketing Cloud", description: "Standard HTML with AMPscript-ready blocks." },
  { value: "mjml", label: "MJML", description: "MJML markup that compiles to responsive HTML." },
  { value: "foundation", label: "Foundation for Emails", description: "Zurb Foundation Inky-style markup." },
];

export interface Optimization {
  title: string;
  detail: string;
  category: RuleCategory;
}

export interface ConvertResult {
  html: string;
  mode: ConvertOutputMode;
  optimizations: Optimization[];
  components: DetectedComponent[];
  buildConfidence: number;
  modelProvider: string;
  usedAi: boolean;
}

export interface ValidateResult {
  issues: EmailIssue[];
  summary: AnalysisSummary;
  modelProvider: string;
  usedAi: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Context passed to the assistant so it can reason about the current work. */
export interface AssistantContext {
  page?: "vision" | "convert" | "validate";
  html?: string;
  issues?: EmailIssue[];
  summary?: AnalysisSummary;
}
