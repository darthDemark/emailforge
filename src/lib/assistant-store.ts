"use client";

import * as React from "react";

import type { AssistantContext } from "@/lib/types";

/**
 * Minimal external store (no provider needed) that lets any page publish its
 * current analysis context to the global Ask EmailForge assistant.
 */
let context: AssistantContext = {};
const listeners = new Set<() => void>();

export function setAssistantContext(next: AssistantContext): void {
  context = next;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AssistantContext {
  return context;
}

const serverSnapshot: AssistantContext = {};

export function useAssistantContext(): AssistantContext {
  return React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot,
  );
}

/** Convenience hook to publish context for the lifetime of a page. */
export function usePublishAssistantContext(ctx: AssistantContext): void {
  React.useEffect(() => {
    setAssistantContext(ctx);
    return () => setAssistantContext({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({ page: ctx.page, html: ctx.html?.length, n: ctx.issues?.length, h: ctx.summary?.healthScore })]);
}
