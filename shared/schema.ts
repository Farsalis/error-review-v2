import { z } from "zod";

// Error categories with their retest intervals (in days)
export const ERROR_CATEGORIES = {
  conceptual: { label: "Conceptual", color: "primary", retestDays: [1, 3, 7] },
  procedural: { label: "Procedural", color: "secondary", retestDays: [1, 3, 7] },
  careless: { label: "Careless", color: "warning", retestDays: [1, 3] },
  knowledge: { label: "Knowledge Gap", color: "accent", retestDays: [1, 3, 7, 14] },
} as const;

export type ErrorCategory = keyof typeof ERROR_CATEGORIES;

// Mistake schema
export const mistakeSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["conceptual", "procedural", "careless", "knowledge"]),
  rootCause: z.string().optional(),
  correctedPrinciple: z.string().optional(),
  createdAt: z.string(),
  retestCount: z.number().default(0),
  lastReviewedAt: z.string().optional(),
  mastered: z.boolean().default(false),
});

export const insertMistakeSchema = mistakeSchema.omit({ id: true, createdAt: true, retestCount: true, mastered: true });

export type Mistake = z.infer<typeof mistakeSchema>;
export type InsertMistake = z.infer<typeof insertMistakeSchema>;

// Retest schedule schema
export const retestSchema = z.object({
  id: z.string(),
  mistakeId: z.string(),
  scheduledDate: z.string(),
  completed: z.boolean().default(false),
  result: z.enum(["correct", "incorrect"]).optional(),
  completedAt: z.string().optional(),
});

export const insertRetestSchema = retestSchema.omit({ id: true, completed: true, result: true, completedAt: true });

export type Retest = z.infer<typeof retestSchema>;
export type InsertRetest = z.infer<typeof insertRetestSchema>;

// Quiz question (derived from mistakes)
export interface QuizQuestion {
  mistakeId: string;
  question: string;
  category: ErrorCategory;
  correctPrinciple: string;
}

// Statistics types
export interface WeeklyStats {
  totalMistakes: number;
  totalRetests: number;
  correctRetests: number;
  topPatterns: Array<{
    category: ErrorCategory;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    mistakes: number;
    retests: number;
  }>;
}

// Legacy user types for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
