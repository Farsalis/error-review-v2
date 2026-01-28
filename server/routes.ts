import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMistakeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all mistakes
  app.get("/api/mistakes", async (req, res) => {
    try {
      const mistakes = await storage.getMistakes();
      res.json(mistakes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mistakes" });
    }
  });

  // Get single mistake
  app.get("/api/mistakes/:id", async (req, res) => {
    try {
      const mistake = await storage.getMistake(req.params.id);
      if (!mistake) {
        return res.status(404).json({ error: "Mistake not found" });
      }
      res.json(mistake);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mistake" });
    }
  });

  // Create mistake
  app.post("/api/mistakes", async (req, res) => {
    try {
      const parsed = insertMistakeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const mistake = await storage.createMistake(parsed.data);
      res.status(201).json(mistake);
    } catch (error) {
      res.status(500).json({ error: "Failed to create mistake" });
    }
  });

  // Update mistake
  app.put("/api/mistakes/:id", async (req, res) => {
    try {
      const parsed = insertMistakeSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      const mistake = await storage.updateMistake(req.params.id, parsed.data);
      if (!mistake) {
        return res.status(404).json({ error: "Mistake not found" });
      }
      res.json(mistake);
    } catch (error) {
      res.status(500).json({ error: "Failed to update mistake" });
    }
  });

  // Delete mistake
  app.delete("/api/mistakes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMistake(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Mistake not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mistake" });
    }
  });

  // Get all retests
  app.get("/api/retests", async (req, res) => {
    try {
      const retests = await storage.getRetests();
      res.json(retests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retests" });
    }
  });

  // Complete a retest
  app.put("/api/retests/:id/complete", async (req, res) => {
    try {
      const schema = z.object({
        result: z.enum(["correct", "incorrect"]),
      });
      
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }
      
      const retest = await storage.completeRetest(req.params.id, parsed.data.result);
      if (!retest) {
        return res.status(404).json({ error: "Retest not found" });
      }
      res.json(retest);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete retest" });
    }
  });

  // Get weekly stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWeeklyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
