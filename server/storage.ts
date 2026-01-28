import { 
  type Mistake, 
  type InsertMistake, 
  type Retest, 
  type InsertRetest,
  type WeeklyStats,
  type ErrorCategory,
  ERROR_CATEGORIES
} from "@shared/schema";
import { randomUUID } from "crypto";
import { addDays, startOfWeek, endOfWeek, parseISO, isWithinInterval, format } from "date-fns";

export interface IStorage {
  getMistakes(): Promise<Mistake[]>;
  getMistake(id: string): Promise<Mistake | undefined>;
  createMistake(mistake: InsertMistake): Promise<Mistake>;
  updateMistake(id: string, mistake: InsertMistake): Promise<Mistake | undefined>;
  deleteMistake(id: string): Promise<boolean>;
  
  getRetests(): Promise<Retest[]>;
  getRetest(id: string): Promise<Retest | undefined>;
  createRetest(retest: InsertRetest): Promise<Retest>;
  completeRetest(id: string, result: "correct" | "incorrect"): Promise<Retest | undefined>;
  deleteRetestsByMistakeId(mistakeId: string): Promise<void>;
  
  getWeeklyStats(): Promise<WeeklyStats>;
}

export class MemStorage implements IStorage {
  private mistakes: Map<string, Mistake>;
  private retests: Map<string, Retest>;

  constructor() {
    this.mistakes = new Map();
    this.retests = new Map();
  }

  async getMistakes(): Promise<Mistake[]> {
    return Array.from(this.mistakes.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getMistake(id: string): Promise<Mistake | undefined> {
    return this.mistakes.get(id);
  }

  async createMistake(insertMistake: InsertMistake): Promise<Mistake> {
    const id = randomUUID();
    const now = new Date().toISOString();
    
    const mistake: Mistake = {
      id,
      title: insertMistake.title,
      description: insertMistake.description,
      category: insertMistake.category,
      rootCause: insertMistake.rootCause,
      correctedPrinciple: insertMistake.correctedPrinciple,
      createdAt: now,
      retestCount: 0,
      lastReviewedAt: undefined,
      mastered: false,
    };
    
    this.mistakes.set(id, mistake);
    
    // Auto-generate retest schedule based on category
    const categoryConfig = ERROR_CATEGORIES[mistake.category];
    for (const days of categoryConfig.retestDays) {
      const scheduledDate = addDays(new Date(), days).toISOString();
      await this.createRetest({
        mistakeId: id,
        scheduledDate,
      });
    }
    
    return mistake;
  }

  async updateMistake(id: string, insertMistake: InsertMistake): Promise<Mistake | undefined> {
    const existing = this.mistakes.get(id);
    if (!existing) return undefined;

    const updated: Mistake = {
      ...existing,
      title: insertMistake.title,
      description: insertMistake.description,
      category: insertMistake.category,
      rootCause: insertMistake.rootCause,
      correctedPrinciple: insertMistake.correctedPrinciple,
    };
    
    this.mistakes.set(id, updated);
    return updated;
  }

  async deleteMistake(id: string): Promise<boolean> {
    const existed = this.mistakes.has(id);
    this.mistakes.delete(id);
    await this.deleteRetestsByMistakeId(id);
    return existed;
  }

  async getRetests(): Promise<Retest[]> {
    return Array.from(this.retests.values()).sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  async getRetest(id: string): Promise<Retest | undefined> {
    return this.retests.get(id);
  }

  async createRetest(insertRetest: InsertRetest): Promise<Retest> {
    const id = randomUUID();
    
    const retest: Retest = {
      id,
      mistakeId: insertRetest.mistakeId,
      scheduledDate: insertRetest.scheduledDate,
      completed: false,
      result: undefined,
      completedAt: undefined,
    };
    
    this.retests.set(id, retest);
    return retest;
  }

  async completeRetest(id: string, result: "correct" | "incorrect"): Promise<Retest | undefined> {
    const retest = this.retests.get(id);
    if (!retest) return undefined;

    const now = new Date().toISOString();
    
    const updated: Retest = {
      ...retest,
      completed: true,
      result,
      completedAt: now,
    };
    
    this.retests.set(id, updated);
    
    // Update the associated mistake
    const mistake = this.mistakes.get(retest.mistakeId);
    if (mistake) {
      const updatedMistake: Mistake = {
        ...mistake,
        retestCount: mistake.retestCount + 1,
        lastReviewedAt: now,
      };
      
      // Check if mastered (3 consecutive correct retests)
      const mistakeRetests = Array.from(this.retests.values())
        .filter(r => r.mistakeId === mistake.id && r.completed)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        .slice(0, 3);
      
      if (mistakeRetests.length >= 3 && mistakeRetests.every(r => r.result === "correct")) {
        updatedMistake.mastered = true;
      }
      
      // If incorrect, schedule a new retest
      if (result === "incorrect" && !updatedMistake.mastered) {
        const nextRetestDate = addDays(new Date(), 1).toISOString();
        await this.createRetest({
          mistakeId: mistake.id,
          scheduledDate: nextRetestDate,
        });
      }
      
      this.mistakes.set(mistake.id, updatedMistake);
    }
    
    return updated;
  }

  async deleteRetestsByMistakeId(mistakeId: string): Promise<void> {
    const entries = Array.from(this.retests.entries());
    for (const [id, retest] of entries) {
      if (retest.mistakeId === mistakeId) {
        this.retests.delete(id);
      }
    }
  }

  async getWeeklyStats(): Promise<WeeklyStats> {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const allMistakes = Array.from(this.mistakes.values());
    const allRetests = Array.from(this.retests.values());
    
    // Filter mistakes created this week
    const weekMistakes = allMistakes.filter(m => 
      isWithinInterval(parseISO(m.createdAt), { start: weekStart, end: weekEnd })
    );
    
    // Count mistakes by category for this week
    const categoryCount: Record<ErrorCategory, number> = {
      conceptual: 0,
      procedural: 0,
      careless: 0,
      knowledge: 0,
    };
    
    for (const mistake of weekMistakes) {
      categoryCount[mistake.category]++;
    }
    
    // Top patterns sorted by count (weekly)
    const topPatterns = Object.entries(categoryCount)
      .map(([category, count]) => ({
        category: category as ErrorCategory,
        count,
      }))
      .filter(p => p.count > 0)
      .sort((a, b) => b.count - a.count);
    
    // Count completed retests this week
    const weekRetests = allRetests.filter(r => 
      r.completed && 
      r.completedAt &&
      isWithinInterval(parseISO(r.completedAt), { start: weekStart, end: weekEnd })
    );
    
    const correctRetests = weekRetests.filter(r => r.result === "correct").length;
    
    // Recent activity (last 7 days)
    const recentActivity: WeeklyStats["recentActivity"] = [];
    for (let i = 6; i >= 0; i--) {
      const date = addDays(now, -i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayMistakes = allMistakes.filter(m => 
        format(parseISO(m.createdAt), "yyyy-MM-dd") === dateStr
      ).length;
      
      const dayRetests = allRetests.filter(r => 
        r.completed && r.completedAt &&
        format(parseISO(r.completedAt), "yyyy-MM-dd") === dateStr
      ).length;
      
      recentActivity.push({
        date: dateStr,
        mistakes: dayMistakes,
        retests: dayRetests,
      });
    }
    
    return {
      totalMistakes: weekMistakes.length,
      totalRetests: weekRetests.length,
      correctRetests,
      topPatterns,
      recentActivity,
    };
  }
}

export const storage = new MemStorage();
