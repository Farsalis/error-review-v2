import { Badge } from "@/components/ui/badge";
import { ERROR_CATEGORIES, type ErrorCategory } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: ErrorCategory;
  className?: string;
}

const categoryStyles: Record<ErrorCategory, string> = {
  conceptual: "bg-primary/10 text-primary border-primary/20",
  procedural: "bg-secondary/10 text-secondary border-secondary/20",
  careless: "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20",
  knowledge: "bg-accent/10 text-accent border-accent/20",
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = ERROR_CATEGORIES[category];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        categoryStyles[category],
        className
      )}
      data-testid={`badge-category-${category}`}
    >
      {config.label}
    </Badge>
  );
}
