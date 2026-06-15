"use client";

import * as React from "react";
import { Check, Copy, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CodeViewerProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  /** Show the copy/download toolbar. */
  toolbar?: boolean;
  maxHeight?: number;
}

export function CodeViewer({
  code,
  language = "html",
  filename = "email.html",
  className,
  toolbar = true,
  maxHeight = 520,
}: CodeViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }, [code]);

  const download = React.useCallback(() => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, filename]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-muted/40 shadow-card",
        className,
      )}
    >
      {toolbar ? (
        <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2">
          <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
            {language}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copy}
              aria-label="Copy code"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={download}
              aria-label="Download code"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </Button>
          </div>
        </div>
      ) : null}
      <pre
        className="scrollbar-thin overflow-auto p-4 font-mono text-[12.5px] leading-relaxed"
        style={{ maxHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
