import { AlertOctagon, AlertTriangle, Lightbulb } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Severity } from "@/lib/types";
import { SEVERITY_LABELS } from "@/lib/types";

const SEVERITY_META: Record<
  Severity,
  { variant: "critical" | "warning" | "recommendation"; icon: typeof AlertOctagon }
> = {
  critical: { variant: "critical", icon: AlertOctagon },
  warning: { variant: "warning", icon: AlertTriangle },
  recommendation: { variant: "recommendation", icon: Lightbulb },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant} className="gap-1">
      <Icon className="h-3 w-3" aria-hidden="true" />
      {SEVERITY_LABELS[severity]}
    </Badge>
  );
}
