import { AlertOctagon, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CATEGORY_LABELS,
  type AnalysisSummary as Summary,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreCard } from "@/components/score-card";
import { Progress } from "@/components/ui/progress";

function barColor(score: number): string {
  if (score >= 85) return "bg-success";
  if (score >= 60) return "bg-warning";
  return "bg-critical";
}

export function AnalysisSummary({
  summary,
  provider,
  usedAi,
}: {
  summary: Summary;
  provider?: string;
  usedAi?: boolean;
}) {
  const counts = [
    {
      label: "Critical",
      value: summary.criticalCount,
      icon: AlertOctagon,
      color: "text-critical",
    },
    {
      label: "Warnings",
      value: summary.warningCount,
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      label: "Recommendations",
      value: summary.recommendationCount,
      icon: Lightbulb,
      color: "text-recommendation",
    },
  ];

  const activeCategories = summary.categoryScores
    .filter((c) => c.issueCount > 0)
    .sort((a, b) => a.score - b.score);

  return (
    <Card className="border-brand/25 bg-brand-muted/60">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            Analysis summary
          </CardTitle>
          {usedAi ? <Badge variant="brand">AI-enhanced</Badge> : null}
        </div>
        {provider ? (
          <p className="text-body text-muted-foreground">
            {usedAi
              ? `Rule engine + AI analysis via ${provider}`
              : provider}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreCard label="Overall health" score={summary.healthScore} />
          <div className="grid flex-1 grid-cols-3 gap-3">
            {counts.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="rounded-lg border border-border p-3 text-center"
                >
                  <Icon
                    className={cn("mx-auto mb-1 h-4 w-4", c.color)}
                    aria-hidden="true"
                  />
                  <p className="text-[22px] font-bold tabular-nums">
                    {c.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {activeCategories.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-body font-semibold">Category scores</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {activeCategories.map((c) => (
                <div key={c.category} className="space-y-1">
                  <div className="flex items-center justify-between text-body">
                    <span>{CATEGORY_LABELS[c.category]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.score}
                    </span>
                  </div>
                  <Progress
                    value={c.score}
                    indicatorClassName={barColor(c.score)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-body text-muted-foreground">
            No issues detected. This email passes all active checks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
