"use client";

import * as React from "react";
import { BookOpen, ChevronDown, Cpu, Sparkles } from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";
import { CATEGORY_LABELS, type EmailIssue } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SeverityBadge } from "@/components/severity-badge";
import { CodeViewer } from "@/components/code-viewer";

const SEVERITY_ACCENT = {
  critical: "before:bg-critical",
  warning: "before:bg-warning",
  recommendation: "before:bg-recommendation",
} as const;

interface IssueCardProps {
  issue: EmailIssue;
  /** Marker index to display when the issue is annotated. */
  markerLabel?: number;
  defaultOpen?: boolean;
  id?: string;
}

export function IssueCard({
  issue,
  markerLabel,
  defaultOpen = false,
  id,
}: IssueCardProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const contentId = React.useId();

  return (
    <div
      id={id}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card pl-1 shadow-card transition-shadow hover:shadow-card-hover",
        "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:content-['']",
        SEVERITY_ACCENT[issue.severity],
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {markerLabel !== undefined ? (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
            {markerLabel}
          </span>
        ) : null}

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={issue.severity} />
            <Badge variant="outline">{CATEGORY_LABELS[issue.category]}</Badge>
            <Badge variant="secondary" className="gap-1">
              {formatPercent(issue.confidence)} confidence
            </Badge>
            {issue.source === "ai" ? (
              <Badge variant="brand" className="gap-1">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                AI
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Cpu className="h-3 w-3" aria-hidden="true" />
                Rule Engine
              </Badge>
            )}
          </div>
          <p className="text-issue-title font-bold leading-snug">
            {issue.severity === "critical"
              ? "🔴"
              : issue.severity === "warning"
                ? "🟠"
                : "🔵"}{" "}
            {issue.issue}
          </p>
        </div>

        <ChevronDown
          className={cn(
            "mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div id={contentId} className="space-y-4 px-4 pb-5 pl-[52px] sm:pl-4">
          <Section title="Why this is a problem">{issue.impact}</Section>
          <Section title="Recommended solution">{issue.recommendation}</Section>

          {issue.snippet ? (
            <div className="space-y-1.5">
              <h4 className="text-body font-semibold">Problematic code</h4>
              <CodeViewer
                code={issue.snippet}
                toolbar={false}
                maxHeight={180}
              />
            </div>
          ) : null}

          {issue.suggestedFix ? (
            <div className="space-y-1.5">
              <h4 className="text-body font-semibold">Suggested fix</h4>
              <CodeViewer code={issue.suggestedFix} maxHeight={220} />
            </div>
          ) : null}

          {issue.bestPractice ? (
            <div className="flex gap-2 rounded-lg bg-muted/60 p-3">
              <BookOpen
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <h4 className="text-body font-semibold">Best practice</h4>
                <p className="text-body text-muted-foreground">
                  {issue.bestPractice}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <h4 className="text-body font-semibold">{title}</h4>
      <p className="text-body text-muted-foreground">{children}</p>
    </div>
  );
}
