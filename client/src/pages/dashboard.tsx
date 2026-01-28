import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Mistake, type Retest, type WeeklyStats, type InsertMistake } from "@shared/schema";
import { ThemeToggle } from "@/components/theme-toggle";
import { MistakeCard } from "@/components/mistake-card";
import { MistakeForm } from "@/components/mistake-form";
import { StatsOverview } from "@/components/stats-overview";
import { RetestSchedule } from "@/components/retest-schedule";
import { QuizMode } from "@/components/quiz-mode";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, LayoutDashboard, ListTodo, Brain, BarChart3, Sparkles } from "lucide-react";

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingMistake, setEditingMistake] = useState<Mistake | undefined>();
  const { toast } = useToast();

  const { data: mistakes = [], isLoading: loadingMistakes } = useQuery<Mistake[]>({
    queryKey: ["/api/mistakes"],
  });

  const { data: retests = [], isLoading: loadingRetests } = useQuery<Retest[]>({
    queryKey: ["/api/retests"],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<WeeklyStats>({
    queryKey: ["/api/stats"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMistake) => apiRequest("POST", "/api/mistakes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/retests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setFormOpen(false);
      toast({
        title: "Mistake logged",
        description: "Retests have been automatically scheduled.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log mistake. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: InsertMistake }) =>
      apiRequest("PUT", `/api/mistakes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setFormOpen(false);
      setEditingMistake(undefined);
      toast({
        title: "Mistake updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update mistake. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/mistakes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/retests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Mistake deleted",
        description: "The mistake and its retests have been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete mistake. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeRetestMutation = useMutation({
    mutationFn: ({ id, result }: { id: string; result: "correct" | "incorrect" }) =>
      apiRequest("PUT", `/api/retests/${id}/complete`, { result }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mistakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Retest completed",
        description: "Your progress has been recorded.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete retest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFormSubmit = (data: InsertMistake) => {
    if (editingMistake) {
      updateMutation.mutate({ id: editingMistake.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (mistake: Mistake) => {
    setEditingMistake(mistake);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleRetestComplete = (retestId: string, result: "correct" | "incorrect") => {
    completeRetestMutation.mutate({ id: retestId, result });
  };

  const retestsWithMistakes = retests.map(retest => ({
    retest,
    mistake: mistakes.find(m => m.id === retest.mistakeId)!,
  })).filter(r => r.mistake);

  const pendingRetestCount = retests.filter(r => !r.completed).length;

  const isLoading = loadingMistakes || loadingRetests || loadingStats;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Error Tracker</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Learn from your mistakes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingMistake(undefined);
                setFormOpen(true);
              }}
              data-testid="button-add-mistake"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Log Mistake</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 mx-auto">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2" data-testid="tab-dashboard">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="mistakes" className="gap-2" data-testid="tab-mistakes">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Mistakes</span>
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2" data-testid="tab-quiz">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Quiz</span>
            </TabsTrigger>
            <TabsTrigger value="retests" className="gap-2 relative" data-testid="tab-retests">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Retests</span>
              {pendingRetestCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-xs rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {pendingRetestCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
                <Skeleton className="h-48" />
              </div>
            ) : stats ? (
              <StatsOverview stats={stats} />
            ) : null}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Recent Mistakes
                </h2>
                {loadingMistakes ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-40" />
                    ))}
                  </div>
                ) : mistakes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No mistakes logged yet</p>
                    <p className="text-sm">Click "Log Mistake" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mistakes.slice(0, 5).map(mistake => {
                      const nextRetest = retests.find(
                        r => r.mistakeId === mistake.id && !r.completed
                      );
                      return (
                        <MistakeCard
                          key={mistake.id}
                          mistake={mistake}
                          nextRetest={nextRetest}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <RetestSchedule
                retests={retestsWithMistakes}
                onComplete={handleRetestComplete}
                isPending={completeRetestMutation.isPending}
              />
            </div>
          </TabsContent>

          <TabsContent value="mistakes" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Mistakes</h2>
              <p className="text-sm text-muted-foreground">
                {mistakes.length} total
              </p>
            </div>
            {loadingMistakes ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : mistakes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <ListTodo className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">No mistakes logged yet</h3>
                <p className="text-sm mb-4">Start tracking your errors to learn from them</p>
                <Button onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Your First Mistake
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mistakes.map(mistake => {
                  const nextRetest = retests.find(
                    r => r.mistakeId === mistake.id && !r.completed
                  );
                  return (
                    <MistakeCard
                      key={mistake.id}
                      mistake={mistake}
                      nextRetest={nextRetest}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="quiz">
            <div className="max-w-2xl mx-auto">
              <QuizMode mistakes={mistakes} />
            </div>
          </TabsContent>

          <TabsContent value="retests">
            <div className="max-w-2xl mx-auto">
              <RetestSchedule
                retests={retestsWithMistakes}
                onComplete={handleRetestComplete}
                isPending={completeRetestMutation.isPending}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <MistakeForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingMistake(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingMistake}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
