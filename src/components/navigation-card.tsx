import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { NavItem } from "@/lib/navigation";

export function NavigationCard({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-mono text-body text-muted-foreground">
          {item.step}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {item.tagline}
        </p>
        <h3 className="text-headline">{item.label}</h3>
        <p className="text-body text-muted-foreground">{item.description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-body font-medium text-foreground">
        Open {item.label}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
