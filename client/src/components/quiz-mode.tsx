import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type Mistake } from "@shared/schema";
import { CategoryBadge } from "./category-badge";
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Sparkles, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizModeProps {
  mistakes: Mistake[];
  onQuizComplete?: (results: { correct: number; total: number }) => void;
}

interface QuizState {
  currentIndex: number;
  showAnswer: boolean;
  answers: Array<"correct" | "incorrect" | null>;
  completed: boolean;
}

export function QuizMode({ mistakes, onQuizComplete }: QuizModeProps) {
  const quizMistakes = mistakes.filter(m => !m.mastered).slice(0, 10);
  
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    showAnswer: false,
    answers: new Array(quizMistakes.length).fill(null),
    completed: false,
  });

  const currentMistake = quizMistakes[state.currentIndex];
  const progress = ((state.currentIndex + (state.answers[state.currentIndex] ? 1 : 0)) / quizMistakes.length) * 100;
  const correctCount = state.answers.filter(a => a === "correct").length;
  const incorrectCount = state.answers.filter(a => a === "incorrect").length;

  const handleReveal = () => {
    setState(prev => ({ ...prev, showAnswer: true }));
  };

  const handleAnswer = (result: "correct" | "incorrect") => {
    const newAnswers = [...state.answers];
    newAnswers[state.currentIndex] = result;
    
    const isLast = state.currentIndex === quizMistakes.length - 1;
    
    setState(prev => ({
      ...prev,
      answers: newAnswers,
      showAnswer: false,
      currentIndex: isLast ? prev.currentIndex : prev.currentIndex + 1,
      completed: isLast,
    }));

    if (isLast && onQuizComplete) {
      onQuizComplete({
        correct: newAnswers.filter(a => a === "correct").length,
        total: quizMistakes.length,
      });
    }
  };

  const handleRestart = () => {
    setState({
      currentIndex: 0,
      showAnswer: false,
      answers: new Array(quizMistakes.length).fill(null),
      completed: false,
    });
  };

  if (quizMistakes.length === 0) {
    return (
      <Card className="text-center" data-testid="card-quiz-empty">
        <CardContent className="pt-12 pb-12">
          <Brain className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Questions Available</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Add some mistakes to your log to generate quiz questions. The quiz will help you review and reinforce your learning.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state.completed) {
    const percentage = Math.round((correctCount / quizMistakes.length) * 100);
    
    return (
      <Card className="text-center" data-testid="card-quiz-results">
        <CardContent className="pt-12 pb-8 space-y-6">
          <div className="relative inline-block">
            <Trophy className={cn(
              "h-20 w-20 mx-auto",
              percentage >= 80 ? "text-[hsl(var(--warning))]" : 
              percentage >= 60 ? "text-secondary" : "text-muted-foreground"
            )} />
            {percentage >= 80 && (
              <Sparkles className="h-6 w-6 text-[hsl(var(--warning))] absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-1" data-testid="text-quiz-score">
              {correctCount} / {quizMistakes.length}
            </h3>
            <p className="text-sm text-muted-foreground">
              {percentage >= 80 ? "Excellent work!" : 
               percentage >= 60 ? "Good progress!" : 
               "Keep practicing!"}
            </p>
          </div>

          <div className="flex justify-center gap-8 py-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[hsl(var(--success))]">
                <CheckCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Correct</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="text-2xl font-bold">{incorrectCount}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Incorrect</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <Button onClick={handleRestart} data-testid="button-restart-quiz">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card data-testid="card-quiz">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Quick Quiz
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {state.currentIndex + 1} / {quizMistakes.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <CategoryBadge category={currentMistake.category} />
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--success))]">
              <CheckCircle className="h-3 w-3" />
              {correctCount}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-destructive">
              <XCircle className="h-3 w-3" />
              {incorrectCount}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2" data-testid="text-quiz-question">
              {currentMistake.title}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid="text-quiz-description">
              {currentMistake.description}
            </p>
          </div>

          {currentMistake.rootCause && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
              <p className="text-sm">
                <span className="font-medium text-destructive">Root cause:</span>{" "}
                <span className="text-muted-foreground">{currentMistake.rootCause}</span>
              </p>
            </div>
          )}

          {state.showAnswer ? (
            <div className="p-4 rounded-lg bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/10 animate-in fade-in duration-200">
              <p className="text-sm font-medium text-[hsl(var(--success))] mb-1">Correct Principle:</p>
              <p className="text-sm" data-testid="text-quiz-answer">
                {currentMistake.correctedPrinciple || "No principle recorded for this mistake."}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted border border-dashed text-center">
              <p className="text-sm text-muted-foreground">
                What&apos;s the correct approach?
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between gap-4 pt-4 border-t">
        {!state.showAnswer ? (
          <Button 
            onClick={handleReveal} 
            className="w-full"
            variant="outline"
            data-testid="button-reveal-answer"
          >
            <Eye className="h-4 w-4 mr-2" />
            Reveal Answer
          </Button>
        ) : (
          <>
            <Button
              onClick={() => handleAnswer("incorrect")}
              variant="outline"
              className="flex-1 text-destructive border-destructive/30"
              data-testid="button-answer-incorrect"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Got it Wrong
            </Button>
            <Button
              onClick={() => handleAnswer("correct")}
              className="flex-1"
              data-testid="button-answer-correct"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Got it Right
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
