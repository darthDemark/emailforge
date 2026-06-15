import type { HTMLElement } from "node-html-parser";

import type { RuleContext } from "@/lib/rule-engine/types";

/** Returns elements matching a tag name (case-insensitive). */
export function byTag(ctx: RuleContext, tag: string): HTMLElement[] {
  const lower = tag.toLowerCase();
  return ctx.elements.filter((el) => el.rawTagName?.toLowerCase() === lower);
}

/** Truncated outer HTML for use as a snippet. */
export function snippet(el: HTMLElement, max = 200): string {
  const html = el.toString();
  return html.length > max ? `${html.slice(0, max)}\u2026` : html;
}

/** Whether the raw HTML contains a regex match. */
export function htmlMatches(ctx: RuleContext, re: RegExp): boolean {
  return re.test(ctx.html);
}

/** Collect all regex matches against the raw HTML. */
export function collectMatches(ctx: RuleContext, re: RegExp): string[] {
  const out: string[] = [];
  const matches = ctx.html.matchAll(re);
  for (const m of matches) out.push(m[0]);
  return out;
}

/** Returns true if an attribute is present (case-insensitive name). */
export function hasAttr(el: HTMLElement, name: string): boolean {
  const attrs = el.attributes;
  return Object.keys(attrs).some((k) => k.toLowerCase() === name.toLowerCase());
}

/** Get an attribute value (case-insensitive name). */
export function getAttr(el: HTMLElement, name: string): string | undefined {
  const attrs = el.attributes;
  const key = Object.keys(attrs).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  return key ? attrs[key] : undefined;
}
