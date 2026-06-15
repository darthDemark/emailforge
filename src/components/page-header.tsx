import { cn } from "@/lib/utils";
import { SectionLabel } from "@/components/section-label";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h1 className="max-w-3xl text-balance text-[34px] font-bold leading-[1.08] tracking-tight sm:text-page-title">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
