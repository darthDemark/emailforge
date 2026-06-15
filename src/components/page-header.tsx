import { cn } from "@/lib/utils";

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
    <div className={cn("flex flex-col gap-4", className)}>
      <span className="text-body font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </span>
      <h1 className="max-w-3xl text-balance text-[32px] font-bold leading-tight tracking-tight sm:text-page-title">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
