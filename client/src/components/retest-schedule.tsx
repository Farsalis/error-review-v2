import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Mistake, type Retest } from "@shared/schema";
import { format, parseISO, isToday, isPast, isTomorrow } from "date-fns";
import { Calendar, Check, X, Clock, ChevronRight } from "lucide-react";
import { CategoryBadge } from "./category-badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RetestScheduleProps {
  retests: Array<{
    retest: Retest;
    mistake: Mistake;
  }>;
  onComplete: (retestId: string, result: "correct" | "incorrect") => void;
  isPending?: boolean;
}

export function RetestSchedule({ retests, onComplete, isPending }: RetestScheduleProps) {
  const sortedRetests = [...retests].sort((a, b) => 
    new Date(a.retest.scheduledDate).getTime() - new Date(b.retest.scheduledDate).getTime()
  );

  const pendingRetests = sortedRetests.filter(r => !r.retest.completed);
  const overdueRetests = pendingRetests.filter(r => isPast(parseISO(r.retest.scheduledDate)) && !isToday(parseISO(r.retest.scheduledDate)));
  const todayRetests = pendingRetests.filter(r => isToday(parseISO(r.retest.scheduledDate)));
  const upcomingRetests = pendingRetests.filter(r => !isPast(parseISO(r.retest.scheduledDate)) && !isToday(parseISO(r.retest.scheduledDate)));

  const getDateLabel = (date: string) => {
    const parsed = parseISO(date);
    if (isToday(parsed)) return "Today";
    if (isTomorrow(parsed)) return "Tomorrow";
    return format(parsed, "EEE, MMM d");
  };

  const RetestItem = ({ retest, mistake }: { retest: Retest; mistake: Mistake }) => {
    const isOverdue = isPast(parseISO(retest.scheduledDate)) && !isToday(parseISO(retest.scheduledDate));
    
    return (
      <div
        className={cn(
          "p-4 rounded-lg border bg-card hover-elevate transition-all",
          isOverdue && "border-destructive/30 bg-destructive/5"
        )}
        data-testid={`retest-item-${retest.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={mistake.category} />
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-sm line-clamp-1">{mistake.title}</h4>
            {mistake.correctedPrinciple && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {mistake.correctedPrinciple}
              </p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getDateLabel(retest.scheduledDate)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onComplete(retest.id, "incorrect")}
              disabled={isPending}
              className="text-destructive border-destructive/30"
              data-testid="button-retest-incorrect"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={() => onComplete(retest.id, "correct")}
              disabled={isPending}
              data-testid="button-retest-correct"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, items, variant }: { 
    title: string; 
    items: typeof retests; 
    variant?: "overdue" | "today" | "upcoming";
  }) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "text-sm font-semibold",
            variant === "overdue" && "text-destructive",
            variant === "today" && "text-primary"
          )}>
            {title}
          </h3>
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
        </div>
        <div className="space-y-2">
          {items.map(({ retest, mistake }) => (
            <RetestItem key={retest.id} retest={retest} mistake={mistake} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Scheduled Retests
          {pendingRetests.length > 0 && (
            <Badge className="ml-auto">{pendingRetests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingRetests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No retests scheduled
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add mistakes to generate retest schedules
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              <Section title="Overdue" items={overdueRetests} variant="overdue" />
              <Section title="Today" items={todayRetests} variant="today" />
              <Section title="Upcoming" items={upcomingRetests} variant="upcoming" />
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
