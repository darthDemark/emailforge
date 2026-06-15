"use client";

import * as React from "react";
import { Layers, Loader2 } from "lucide-react";

import type { VisionResult } from "@/lib/types";
import { usePublishAssistantContext } from "@/lib/assistant-store";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadDropzone } from "@/components/upload-dropzone";
import { AnnotationLayer } from "@/components/annotation-layer";
import { AnalysisSummary } from "@/components/analysis-summary";
import { IssueCard } from "@/components/issue-card";
import { formatPercent } from "@/lib/utils";

export default function VisionPage() {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<VisionResult | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  usePublishAssistantContext({
    page: "vision",
    issues: result?.issues,
    summary: result?.summary,
  });

  const analyze = React.useCallback(async () => {
    if (!dataUrl) {
      setError("Upload a design image first.");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed.");
      } else {
        setResult(data as VisionResult);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [dataUrl]);

  const markerIndexFor = React.useCallback(
    (id: string) =>
      result?.issues.find((i) => i.id === id)?.marker?.index,
    [result],
  );

  return (
    <div className="container max-w-6xl space-y-12 py-16">
      <PageHeader
        eyebrow="Vision"
        title="Analyze email designs before development"
        description="Upload an email design image to identify potential issues before the coding process begins. Vision reviews your design against established HTML email best practices and evaluates accessibility, responsiveness, hierarchy, CTA effectiveness, deliverability and client compatibility."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <UploadDropzone
            previewUrl={result ? null : dataUrl}
            fileName={fileName}
            onFileSelected={(file, url) => {
              setDataUrl(url);
              setFileName(file.name);
              setResult(null);
            }}
            onClear={() => {
              setDataUrl(null);
              setFileName(null);
              setResult(null);
            }}
          />
          {!result ? (
            <Button onClick={analyze} disabled={loading || !dataUrl}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Analyzing design…
                </>
              ) : (
                "Analyze design"
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setActiveId(null);
              }}
            >
              Analyze a different design
            </Button>
          )}
          {error ? (
            <p role="alert" className="text-body text-critical">
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          {result && dataUrl ? (
            <AnnotationLayer
              imageUrl={dataUrl}
              issues={result.issues}
              activeId={activeId}
              onMarkerClick={(issue) => {
                setActiveId(issue.id);
                document
                  .getElementById(`vision-issue-${issue.id}`)
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            />
          ) : (
            <Card className="flex h-full min-h-[280px] items-center justify-center border-dashed">
              <CardContent className="pt-6 text-center text-body text-muted-foreground">
                Your annotated design and detected components will appear here
                after analysis.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {result ? (
        <div className="space-y-10">
          {result.components.length > 0 ? (
            <Card className="border-brand/25 bg-brand-muted/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-brand-foreground">
                    <Layers className="h-4 w-4" aria-hidden="true" />
                  </span>
                  Detected components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.components.map((c, i) => (
                    <Badge key={`${c.type}-${i}`} variant="brand" className="gap-1.5">
                      {c.label}
                      <span className="opacity-70">
                        {formatPercent(c.confidence)}
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <AnalysisSummary
            summary={result.summary}
            provider={result.modelProvider}
            usedAi={result.usedAi}
          />

          <div className="space-y-4">
            <h2 className="text-headline">
              {result.issues.length} design issue
              {result.issues.length === 1 ? "" : "s"}
            </h2>
            {result.issues.map((issue, i) => (
              <IssueCard
                key={issue.id}
                id={`vision-issue-${issue.id}`}
                issue={issue}
                markerLabel={markerIndexFor(issue.id)}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
