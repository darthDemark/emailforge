"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { EmailIssue } from "@/lib/types";

interface AnnotationLayerProps {
  imageUrl: string;
  issues: EmailIssue[];
  activeId?: string | null;
  onMarkerClick?: (issue: EmailIssue) => void;
}

const SEVERITY_BG = {
  critical: "bg-critical",
  warning: "bg-warning",
  recommendation: "bg-recommendation",
} as const;

export function AnnotationLayer({
  imageUrl,
  issues,
  activeId,
  onMarkerClick,
}: AnnotationLayerProps) {
  const markers = issues.filter((i) => i.marker);

  return (
    <div className="relative inline-block w-full overflow-hidden rounded-xl border border-border bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Analyzed email design with issue markers"
        className="block w-full"
      />
      {markers.map((issue) => {
        const marker = issue.marker!;
        const active = activeId === issue.id;
        return (
          <button
            key={issue.id}
            type="button"
            onClick={() => onMarkerClick?.(issue)}
            aria-label={`Issue ${marker.index}: ${issue.issue}`}
            className={cn(
              "absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ring-2 ring-white transition-transform focus-visible:outline-none focus-visible:ring-4",
              SEVERITY_BG[issue.severity],
              active && "scale-125 ring-4",
            )}
            style={{
              left: `${marker.x * 100}%`,
              top: `${marker.y * 100}%`,
            }}
          >
            {marker.index}
          </button>
        );
      })}
    </div>
  );
}
