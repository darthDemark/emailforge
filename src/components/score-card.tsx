import { cn } from "@/lib/utils";

interface ScoreCardProps {
  label: string;
  score: number;
  size?: "sm" | "lg";
  hint?: string;
}

function scoreColor(score: number): string {
  if (score >= 85) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-critical";
}

function ringColor(score: number): string {
  if (score >= 85) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--critical))";
}

export function ScoreCard({ label, score, size = "lg", hint }: ScoreCardProps) {
  const dimension = size === "lg" ? 132 : 88;
  const stroke = size === "lg" ? 10 : 8;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative"
        style={{ width: dimension, height: dimension }}
        role="img"
        aria-label={`${label}: ${Math.round(clamped)} out of 100`}
      >
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90"
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={ringColor(clamped)}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-bold tabular-nums",
              size === "lg" ? "text-[34px]" : "text-[22px]",
              scoreColor(clamped),
            )}
          >
            {Math.round(clamped)}
          </span>
          {size === "lg" ? (
            <span className="text-xs text-muted-foreground">/ 100</span>
          ) : null}
        </div>
      </div>
      <div className="text-center">
        <p className="text-body font-semibold">{label}</p>
        {hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
