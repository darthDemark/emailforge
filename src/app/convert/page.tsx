"use client";

import * as React from "react";
import { Check, Loader2, Sparkles, Wand2 } from "lucide-react";

import {
  CONVERT_OUTPUT_MODES,
  type ConvertOutputMode,
  type ConvertResult,
  type ValidateResult,
} from "@/lib/types";
import { usePublishAssistantContext } from "@/lib/assistant-store";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/components/upload-dropzone";
import { CodeViewer } from "@/components/code-viewer";
import { ScoreCard } from "@/components/score-card";
import { AnalysisSummary } from "@/components/analysis-summary";
import { IssueCard } from "@/components/issue-card";
import { CATEGORY_LABELS } from "@/lib/types";

const EXTENSION: Record<ConvertOutputMode, string> = {
  standard: "html",
  sfmc: "html",
  mjml: "mjml",
  foundation: "html",
};

export default function ConvertPage() {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<ConvertOutputMode>("standard");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ConvertResult | null>(null);
  const [validating, setValidating] = React.useState(false);
  const [validation, setValidation] = React.useState<ValidateResult | null>(null);

  usePublishAssistantContext({
    page: "convert",
    html: result?.html,
    issues: validation?.issues,
    summary: validation?.summary,
  });

  const convert = React.useCallback(async () => {
    if (!dataUrl) {
      setError("Upload a design image first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setValidation(null);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Conversion failed.");
      } else {
        setResult(data as ConvertResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dataUrl, mode]);

  const runValidation = React.useCallback(async () => {
    if (!result) return;
    setValidating(true);
    setValidation(null);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: result.html }),
      });
      const data = await res.json();
      if (res.ok) setValidation(data as ValidateResult);
    } catch {
      // ignored - validation is supplementary
    } finally {
      setValidating(false);
    }
  }, [result]);

  return (
    <div className="container max-w-6xl space-y-10 py-12">
      <PageHeader
        eyebrow="Convert"
        title="Transform email designs into production-ready HTML"
        description="Upload an email design and generate responsive HTML email code built according to industry-standard email development practices. The optimization engine improves the design rather than blindly recreating it."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <UploadDropzone
            previewUrl={dataUrl}
            fileName={fileName}
            onFileSelected={(file, url) => {
              setDataUrl(url);
              setFileName(file.name);
              setResult(null);
              setValidation(null);
            }}
            onClear={() => {
              setDataUrl(null);
              setFileName(null);
              setResult(null);
              setValidation(null);
            }}
          />
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-semi-header">Output mode</h2>
            <p className="text-body text-muted-foreground">
              Choose the target format for your generated code.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {CONVERT_OUTPUT_MODES.map((m) => {
              const active = mode === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col gap-1 rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "border-foreground bg-secondary"
                      : "border-border hover:border-foreground/30",
                  )}
                >
                  <span className="flex items-center justify-between text-body font-semibold">
                    {m.label}
                    {active ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : null}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.description}
                  </span>
                </button>
              );
            })}
          </div>
          <Button onClick={convert} disabled={loading || !dataUrl}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Generating HTML…
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" aria-hidden="true" />
                Generate HTML
              </>
            )}
          </Button>
          {error ? (
            <p role="alert" className="text-body text-critical">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {result ? (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
            <Card className="flex items-center justify-center p-6">
              <ScoreCard
                label="Build confidence"
                score={result.buildConfidence}
                hint={result.usedAi ? `Generated by ${result.modelProvider}` : result.modelProvider}
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Optimizations applied
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.optimizations.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-success"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-body font-semibold">
                        {opt.title}
                        <Badge variant="outline" className="ml-2">
                          {CATEGORY_LABELS[opt.category]}
                        </Badge>
                      </p>
                      <p className="text-body text-muted-foreground">
                        {opt.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-headline">Generated code</h2>
              <Button
                variant="outline"
                onClick={runValidation}
                disabled={validating}
              >
                {validating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Validating…
                  </>
                ) : (
                  "Run validation"
                )}
              </Button>
            </div>
            <CodeViewer
              code={result.html}
              language={result.mode}
              filename={`emailforge.${EXTENSION[result.mode]}`}
              maxHeight={600}
            />
          </div>

          {validation ? (
            <div className="space-y-6">
              <AnalysisSummary
                summary={validation.summary}
                provider={validation.modelProvider}
                usedAi={validation.usedAi}
              />
              <div className="space-y-3">
                <h2 className="text-headline">
                  Validation: {validation.issues.length} issue
                  {validation.issues.length === 1 ? "" : "s"}
                </h2>
                {validation.issues.length === 0 ? (
                  <p className="text-body text-muted-foreground">
                    No issues found in the generated code.
                  </p>
                ) : (
                  validation.issues.map((issue) => (
                    <IssueCard key={issue.id} issue={issue} />
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
