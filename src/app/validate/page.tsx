"use client";

import * as React from "react";
import { FileCode2, Loader2, Upload } from "lucide-react";

import type { ValidateResult } from "@/lib/types";
import { usePublishAssistantContext } from "@/lib/assistant-store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisSummary } from "@/components/analysis-summary";
import { IssueCard } from "@/components/issue-card";
import { SAMPLE_EMAIL } from "@/lib/sample-email";

export default function ValidatePage() {
  const [html, setHtml] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [enhancing, setEnhancing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ValidateResult | null>(null);

  usePublishAssistantContext({
    page: "validate",
    html: html || undefined,
    issues: result?.issues,
    summary: result?.summary,
  });

  const onUpload = React.useCallback((file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setHtml(String(reader.result ?? ""));
    reader.readAsText(file);
  }, []);

  const analyze = React.useCallback(async () => {
    if (!html.trim()) {
      setError("Paste or upload some HTML to analyze.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);

    // Phase 1 — deterministic rule engine. Fast and reliable; this is the
    // primary result and never depends on the AI provider.
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Validation failed.");
        setLoading(false);
        return;
      }
      setResult(data as ValidateResult);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
      return;
    }
    setLoading(false);

    // Phase 2 — AI enhancement. Runs as a separate, non-blocking request that
    // explains and expands the findings. If it is slow or fails, the rule
    // engine report above still stands.
    setEnhancing(true);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, enhance: true }),
      });
      if (res.ok) {
        const data = (await res.json()) as ValidateResult;
        if (data.usedAi) setResult(data);
      }
    } catch {
      // AI enhancement is supplementary; keep the rule-engine results.
    } finally {
      setEnhancing(false);
    }
  }, [html]);

  return (
    <div className="container max-w-5xl space-y-12 py-16">
      <PageHeader
        eyebrow="Validate"
        title="Analyze HTML email code before deployment"
        description="Upload or paste HTML email code and perform a comprehensive quality assurance review before sending. The deterministic rule engine runs first; the AI layer then explains and expands every finding."
      />

      <div className="grid gap-4">
        <Tabs defaultValue="paste">
          <TabsList>
            <TabsTrigger value="paste">
              <FileCode2 className="h-4 w-4" aria-hidden="true" />
              Paste HTML
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload file
            </TabsTrigger>
          </TabsList>

          <TabsContent value="paste">
            <Textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="Paste your HTML email code here…"
              className="min-h-[280px] font-mono text-[13px]"
              aria-label="HTML email code"
            />
          </TabsContent>

          <TabsContent value="upload">
            <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-card p-6 text-center transition-colors hover:border-foreground/30">
              <Upload className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
              <span className="text-semi-header">Upload an HTML file</span>
              <span className="text-body text-muted-foreground">
                Accepts .html and .htm files
              </span>
              <input
                type="file"
                accept=".html,.htm,text/html"
                className="sr-only"
                onChange={(e) => onUpload(e.target.files?.[0])}
              />
              {html ? (
                <span className="text-body text-success">
                  Loaded {html.length.toLocaleString()} characters
                </span>
              ) : null}
            </label>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={analyze} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Analyzing…
              </>
            ) : (
              "Analyze code"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setHtml(SAMPLE_EMAIL)}
            disabled={loading}
          >
            Load sample email
          </Button>
          {html ? (
            <Button
              variant="ghost"
              onClick={() => {
                setHtml("");
                setResult(null);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-body text-critical">
            {error}
          </p>
        ) : null}
      </div>

      {result ? (
        <div className="space-y-8">
          <AnalysisSummary
            summary={result.summary}
            provider={result.modelProvider}
            usedAi={result.usedAi}
          />

          {enhancing ? (
            <div
              role="status"
              className="flex items-center gap-2 rounded-2xl border border-border bg-brand-muted/50 px-4 py-3 text-body text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden="true" />
              Enhancing findings with AI analysis…
            </div>
          ) : null}

          <div className="space-y-4">
            <h2 className="text-headline">
              {result.issues.length} issue
              {result.issues.length === 1 ? "" : "s"} detected
            </h2>
            {result.issues.length === 0 ? (
              <p className="text-body text-muted-foreground">
                No issues found. This email passes all active checks.
              </p>
            ) : (
              result.issues.map((issue, i) => (
                <IssueCard key={issue.id} issue={issue} defaultOpen={i === 0} />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
