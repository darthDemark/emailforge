import { cn } from "@/lib/utils";

/**
 * Consistent section label / eyebrow used as a visual anchor across the app.
 * Brand terracotta, uppercase, wide tracking, 12px, semibold.
 */
export function SectionLabel({
  children,
  className,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "span" | "p" | "div";
}) {
  return (
    <Tag
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em] text-brand",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
