import Link from "next/link";
import { ArrowRight, Cpu, Sparkles, CheckCircle2 } from "lucide-react";

import { NAV_ITEMS } from "@/lib/navigation";
import { NavigationCard } from "@/components/navigation-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ruleCount } from "@/lib/rule-engine";
import { isAiAvailable, listProviderStatus } from "@/lib/ai";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/types";

// Read AI provider availability at request time so the status badge reflects
// runtime environment variables (e.g. Vercel secrets) rather than build-time.
export const dynamic = "force-dynamic";

export default function HomePage() {
  const rules = ruleCount();
  const aiReady = isAiAvailable();
  const providers = listProviderStatus();
  const configured = providers.filter((p) => p.configured);

  return (
    <div className="container space-y-24 py-16 sm:py-24">
      <section className="flex flex-col items-center gap-8 text-center">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          {aiReady
            ? `AI online · ${configured.map((p) => p.label).join(", ")}`
            : "Deterministic engine online · add an AI key to enable AI layer"}
        </Badge>

        <h1 className="max-w-4xl text-balance text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[64px]">
          AI-powered HTML email development platform
        </h1>
        <p className="max-w-2xl text-balance text-[17px] leading-relaxed text-muted-foreground">
          EmailForge combines a deterministic email rule engine with an AI
          analysis, optimization and education layer. Create, analyze, optimize
          and validate HTML emails with accuracy you can trust.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/vision">
              Start with Vision
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/validate">Validate existing HTML</Link>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-body text-muted-foreground">
          <span className="flex items-center gap-2">
            <Cpu className="h-4 w-4" aria-hidden="true" />
            {rules}+ deterministic rules
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Provider-agnostic AI (OpenAI · Anthropic · Gemini)
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {ALL_CATEGORIES.length} analysis categories
          </span>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-body font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            The workflow
          </span>
          <h2 className="text-headline sm:text-[32px]">
            Vision → Convert → Validate
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <NavigationCard key={item.href} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-body font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Not a generic AI wrapper
          </span>
          <h2 className="text-headline sm:text-[32px]">
            Deterministic accuracy, AI explanation
          </h2>
          <p className="max-w-2xl text-body text-muted-foreground">
            The rule engine runs first and produces precise, repeatable
            findings. The AI layer then explains impact, recommends fixes,
            classifies severity, scores confidence and teaches best practices.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CATEGORIES.map((category) => (
            <div
              key={category}
              className="rounded-xl border border-border bg-card p-5"
            >
              <h3 className="text-issue-title">{CATEGORY_LABELS[category]}</h3>
              <p className="mt-1 text-body text-muted-foreground">
                Evaluated against established HTML email best practices.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
