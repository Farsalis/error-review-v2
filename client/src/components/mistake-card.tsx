import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./category-badge";
import { type Mistake, type Retest } from "@shared/schema";
import { format, parseISO } from "date-fns";
import { Calendar, CheckCircle2, Edit2, Trash2, Target, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface MistakeCardProps {
  mistake: Mistake;
  nextRetest?: Retest;
  onEdit?: (mistake: Mistake) => void;
  onDelete?: (id: string) => void;
}

export function MistakeCard({ mistake, nextRetest, onEdit, onDelete }: MistakeCardProps) {
  const isOverdue = nextRetest && new Date(nextRetest.scheduledDate) < new Date();
  const isMastered = mistake.mastered;

  return (
    <Card
      className={cn(
        "group transition-all duration-200 hover-elevate",
        isMastered && "opacity-60"
      )}
      data-testid={`card-mistake-${mistake.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <CategoryBadge category={mistake.category} />
            {isMastered && (
              <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--success))] font-medium">
                <CheckCircle2 className="h-3 w-3" />
                Mastered
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-tight line-clamp-2" data-testid="text-mistake-title">
            {mistake.title}
          </h3>
        </div>
        <div className="flex gap-1 invisible group-hover:visible">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(mistake)}
              data-testid="button-edit-mistake"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(mistake.id)}
              className="text-destructive"
              data-testid="button-delete-mistake"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid="text-mistake-description">
          {mistake.description}
        </p>
        
        {(mistake.rootCause || mistake.correctedPrinciple) && (
          <div className="space-y-2 pt-2 border-t">
            {mistake.rootCause && (
              <div className="flex items-start gap-2 text-sm">
                <Target className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-muted-foreground" data-testid="text-root-cause">
                  <span className="font-medium text-foreground">Root cause:</span> {mistake.rootCause}
                </span>
              </div>
            )}
            {mistake.correctedPrinciple && (
              <div className="flex items-start gap-2 text-sm">
                <Lightbulb className="h-4 w-4 text-[hsl(var(--warning))] mt-0.5 shrink-0" />
                <span className="text-muted-foreground" data-testid="text-principle">
                  <span className="font-medium text-foreground">Principle:</span> {mistake.correctedPrinciple}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span data-testid="text-created-date">
            Added {format(parseISO(mistake.createdAt), "MMM d, yyyy")}
          </span>
          {nextRetest && !nextRetest.completed && (
            <span
              className={cn(
                "flex items-center gap-1",
                isOverdue && "text-destructive"
              )}
              data-testid="text-next-retest"
            >
              <Calendar className="h-3 w-3" />
              {isOverdue ? "Overdue" : `Retest ${format(parseISO(nextRetest.scheduledDate), "MMM d")}`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
