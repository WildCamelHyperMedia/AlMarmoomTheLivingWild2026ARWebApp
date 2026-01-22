import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserProgressSchema, loginSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Sign up a new user
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { name, email, phone, password } = req.body;
      
      if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        phone,
        password: hashedPassword
      });
      
      // Create initial progress for this user (first animal unlocked)
      await storage.createProgress({
        userId: user.id,
        unlockedAnimals: ["eurasian_stone_curlew"]
      });

      // Return user without password
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Return user without password
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user by ID (for session validation)
  app.get("/api/auth/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const adminId = req.headers["x-admin-id"] as string;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      
      // Get progress for each user
      const usersWithProgress = await Promise.all(
        users.map(async (user) => {
          const progress = await storage.getProgress(user.id);
          const { password: _, ...safeUser } = user;
          return {
            ...safeUser,
            videosWatched: progress?.unlockedAnimals?.length || 0,
            unlockedAnimals: progress?.unlockedAnimals || [],
            lastActivity: progress?.lastUpdated || user.createdAt
          };
        })
      );

      res.json({ users: usersWithProgress });
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
