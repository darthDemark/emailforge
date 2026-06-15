import type { LucideIcon } from "lucide-react";
import { Eye, Code2, ShieldCheck } from "lucide-react";

export interface NavItem {
  step: string;
  href: string;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    step: "01",
    href: "/vision",
    label: "Vision",
    tagline: "Analyze Design",
    description:
      "Analyze email designs before development begins to surface issues early.",
    icon: Eye,
  },
  {
    step: "02",
    href: "/convert",
    label: "Convert",
    tagline: "Generate HTML",
    description:
      "Transform email designs into production-ready, responsive HTML email code.",
    icon: Code2,
  },
  {
    step: "03",
    href: "/validate",
    label: "Validate",
    tagline: "Audit HTML",
    description:
      "Audit HTML email code against the rule engine and AI before deployment.",
    icon: ShieldCheck,
  },
];
