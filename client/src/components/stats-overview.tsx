import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type WeeklyStats, ERROR_CATEGORIES, type ErrorCategory } from "@shared/schema";
import { TrendingUp, CheckCircle, AlertCircle, BarChart3, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  stats: WeeklyStats;
}

const categoryColors: Record<ErrorCategory, string> = {
  conceptual: "bg-primary",
  procedural: "bg-secondary",
  careless: "bg-[hsl(var(--warning))]",
  knowledge: "bg-accent",
};

export function StatsOverview({ stats }: StatsOverviewProps) {
  const successRate = stats.totalRetests > 0 
    ? Math.round((stats.correctRetests / stats.totalRetests) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-stat-total-mistakes">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-mistakes">{stats.totalMistakes}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-retests">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-retests">{stats.totalRetests}</p>
                <p className="text-sm text-muted-foreground">Retests This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-success-rate">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-[hsl(var(--success))]/10">
                <CheckCircle className="h-5 w-5 text-[hsl(var(--success))]" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-success-rate">{successRate}%</p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-patterns">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <BarChart3 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pattern-count">{stats.topPatterns.length}</p>
                <p className="text-sm text-muted-foreground">Error Patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Top Error Patterns This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topPatterns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No patterns detected yet. Start logging mistakes to see insights.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.topPatterns.slice(0, 3).map((pattern, index) => {
                const config = ERROR_CATEGORIES[pattern.category];
                const maxCount = Math.max(...stats.topPatterns.map(p => p.count));
                const percentage = maxCount > 0 ? (pattern.count / maxCount) * 100 : 0;
                
                return (
                  <div key={pattern.category} className="space-y-2" data-testid={`pattern-${pattern.category}`}>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-muted-foreground">#{index + 1}</span>
                        <span
                          className={cn(
                            "w-2.5 h-2.5 rounded-full",
                            categoryColors[pattern.category]
                          )}
                        />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <span className="text-muted-foreground">{pattern.count} mistakes</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
