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

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await storage.createUser({
        name,
        email,
        phone,
        password: hashedPassword
      });
      
      await storage.createProgress({
        userId: user.id,
        unlockedAnimals: ["eurasian_stone_curlew"]
      });

      // Log signup as first login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

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

      // Log login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user by ID
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

  // Admin: Get all users with progress
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
      
      const usersWithProgress = await Promise.all(
        users.map(async (user) => {
          const progress = await storage.getProgress(user.id);
          const logins = await storage.getUserLoginHistory(user.id);
          const { password: _, ...safeUser } = user;
          return {
            ...safeUser,
            videosWatched: progress?.unlockedAnimals?.length || 0,
            unlockedAnimals: progress?.unlockedAnimals || [],
            lastActivity: progress?.lastUpdated || user.createdAt,
            loginCount: logins.length,
            lastLogin: logins[0]?.loginAt || null
          };
        })
      );

      res.json({ users: usersWithProgress });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get analytics dashboard data
  app.get("/api/admin/analytics", async (req, res) => {
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
      const allProgress = await storage.getAllProgress();
      const loginStats = await storage.getLoginStats();
      const recentLogins = await storage.getLoginHistory(50);

      // Calculate stats
      const totalUsers = users.filter(u => !u.isAdmin).length;
      const totalVideosWatched = allProgress.reduce((acc, p) => acc + (p.unlockedAnimals?.length || 0), 0);
      const avgVideosPerUser = totalUsers > 0 ? totalVideosWatched / totalUsers : 0;
      
      // Users signed up today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const signupsToday = users.filter(u => new Date(u.createdAt) >= today).length;
      
      // Users signed up this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const signupsThisWeek = users.filter(u => new Date(u.createdAt) >= weekAgo).length;

      // Leaderboard - top 10 users by videos watched
      const usersWithVideos = await Promise.all(
        users.filter(u => !u.isAdmin).map(async (user) => {
          const progress = await storage.getProgress(user.id);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            videosWatched: progress?.unlockedAnimals?.length || 0
          };
        })
      );
      
      const leaderboard = usersWithVideos
        .sort((a, b) => b.videosWatched - a.videosWatched)
        .slice(0, 10);

      // Get user names for recent logins
      const recentLoginsWithUsers = await Promise.all(
        recentLogins.map(async (login) => {
          const user = await storage.getUser(login.userId);
          return {
            ...login,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "Unknown"
          };
        })
      );

      res.json({
        stats: {
          totalUsers,
          totalVideosWatched,
          avgVideosPerUser: Math.round(avgVideosPerUser * 10) / 10,
          signupsToday,
          signupsThisWeek,
          totalLogins: recentLogins.length
        },
        loginStats,
        leaderboard,
        recentLogins: recentLoginsWithUsers
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get login history
  app.get("/api/admin/login-history", async (req, res) => {
    try {
      const adminId = req.headers["x-admin-id"] as string;
      if (!adminId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const admin = await storage.getUser(adminId);
      if (!admin || !admin.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logins = await storage.getLoginHistory(limit);
      
      const loginsWithUsers = await Promise.all(
        logins.map(async (login) => {
          const user = await storage.getUser(login.userId);
          return {
            ...login,
            userName: user?.name || "Unknown",
            userEmail: user?.email || "Unknown"
          };
        })
      );

      res.json({ logins: loginsWithUsers });
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
