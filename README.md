# EmailForge

**AI-powered HTML email development platform.** EmailForge helps email
developers, marketers, designers and SFMC professionals create, analyze,
optimize and validate HTML emails using a deterministic email rule engine
paired with an AI analysis, optimization and education layer.

> **Vision → Convert → Validate**

EmailForge is **not** a generic AI wrapper. A deterministic rule engine runs
first and produces precise, repeatable findings. The AI layer then explains
impact, recommends fixes, classifies severity, scores confidence and teaches
best practices.

## Workflow

| Step | Page | Purpose |
| ---- | ---- | ------- |
| 01 | **Vision** (`/vision`) | Analyze an email design image before development. Detects components and design issues, overlays clickable issue markers on the image. |
| 02 | **Convert** (`/convert`) | Transform a design into production-ready HTML (Standard, SFMC/AMPscript, MJML, Foundation for Emails). Improves the design and reports optimizations. |
| 03 | **Validate** (`/validate`) | Audit pasted or uploaded HTML against the rule engine + AI before deployment. Produces an overall health score, category scores and per-issue fixes. |

A global **Ask EmailForge** assistant is available on every page and has access
to the current project's analysis context.

## Architecture

```
src/
├── app/                     # Next.js App Router pages + API routes
│   ├── api/                 # validate · vision · convert · assistant
│   ├── vision · convert · validate
├── components/              # Reusable UI (PageHeader, IssueCard, ScoreCard,
│   │                        # UploadDropzone, AnnotationLayer, ChatAssistant…)
│   └── ui/                  # shadcn/ui primitives
└── lib/
    ├── ai/                  # Provider-agnostic AI abstraction
    │   ├── provider.ts      # AIProvider interface (app logic depends on this)
    │   ├── providers/       # openai · anthropic · gemini implementations
    │   └── index.ts         # runtime provider resolution + JSON parsing
    ├── rule-engine/         # Deterministic email rule engine
    │   ├── engine.ts        # runs rules, scores categories + health
    │   └── rules/           # rules grouped by category (scales to hundreds)
    └── analysis/            # Orchestration: rule engine + AI per workflow step
```

### Deterministic rule engine

Rules are simple declarative objects grouped by category and registered in
`src/lib/rule-engine/rules/index.ts`. Adding new rules requires no engine
changes — the engine iterates the registry. Categories covered: Outlook,
Gmail, Yahoo, Apple Mail, Mobile, Accessibility, Dark Mode, Deliverability,
HTML Structure, Code Quality, Conversion, Performance and Maintainability.

### Provider-agnostic AI

Application code depends only on the `AIProvider` interface, never on a
concrete SDK. Providers are selected at runtime via the `AI_PROVIDER` env var
(`openai` | `anthropic` | `gemini` | `auto`). When no provider is configured,
the platform **degrades gracefully** to the deterministic rule engine and a
best-practice template generator, so every feature still produces output.

## Getting started

```bash
npm install
cp .env.example .env.local   # add at least one AI provider key (optional)
npm run dev
```

Open <http://localhost:3000>.

### Environment variables

See `.env.example`. At minimum, configure one AI provider to enable the AI
layer (Vision/Convert require a vision-capable model). Supabase variables are
optional and used for persistence/storage.

## Tech stack

- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS** · **shadcn/ui**
- AI: **OpenAI**, **Anthropic**, **Google Gemini** (swappable)
- Storage/DB (optional): **Supabase**

## Scripts

```bash
npm run dev          # start dev server
npm run build        # production build
npm run start        # start production server
npm run lint         # ESLint
npm run type-check   # TypeScript (tsc --noEmit)
npm run test         # Vitest (rule engine tests)
```

## Quality gates

The codebase passes `npm run lint`, `npm run type-check`, `npm run build` and
`npm run test` with no errors, and is ready for Vercel deployment.
