import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserProgressSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create a new user or sign in existing user
  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if phone already exists - if so, sign them in
      const existingUser = await storage.getUserByPhone(validatedData.phone);
      if (existingUser) {
        return res.json({ user: existingUser, isExisting: true });
      }

      const user = await storage.createUser(validatedData);
      
      // Create initial progress for this user (first animal unlocked)
      await storage.createProgress({
        userId: user.id,
        unlockedAnimals: ["eurasian_stone_curlew"]
      });

      res.json({ user, isExisting: false });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get user by phone
  app.get("/api/users/by-phone/:phone", async (req, res) => {
    try {
      const user = await storage.getUserByPhone(req.params.phone);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getProgress(req.params.userId);
      if (!progress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user progress
  app.patch("/api/progress/:userId", async (req, res) => {
    try {
      const existingProgress = await storage.getProgress(req.params.userId);
      if (!existingProgress) {
        return res.status(404).json({ error: "Progress not found" });
      }
      
      const validatedData = updateUserProgressSchema.parse(req.body);
      const progress = await storage.updateProgress(req.params.userId, validatedData);
      res.json({ progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return httpServer;
}
