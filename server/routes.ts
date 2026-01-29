import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, updateUserProgressSchema, loginSchema, animalGuideRequestSchema } from "@shared/schema";
import { animalQRCodes, validateQRCode } from "@shared/qrCodes";
import { validateQRSignature } from "@shared/qrSignature";
import bcrypt from "bcrypt";
import crypto from "crypto";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SESSION_DURATION_HOURS = 6;

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function getExpiryDate(): Date {
  return new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);
}

interface AuthenticatedRequest extends Request {
  user?: { id: string; isAdmin: boolean };
}

async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No valid authorization token" });
  }

  const token = authHeader.slice(7);
  const session = await storage.getSessionByToken(token);
  
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  const user = await storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = { id: user.id, isAdmin: user.isAdmin };
  next();
}

async function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Clean expired sessions periodically
  setInterval(() => {
    storage.cleanExpiredSessions().catch(console.error);
  }, 60 * 60 * 1000);
  
  // Sign up a new user
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors || "Invalid request data" });
      }

      const { name, email, phone, password } = result.data;
      
      if (password.length < 4) {
        return res.status(400).json({ error: "Password must be at least 4 characters" });
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
        unlockedAnimals: [],
        watchedVideos: [],
        points: 0
      });

      // Log signup as first login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

      // Create session token
      const token = generateToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getExpiryDate()
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token, expiresAt: getExpiryDate().toISOString() });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Valid animal IDs for server-side validation
  const VALID_ANIMAL_IDS = [
    "little_grebe", "frog_headed_lizard", "western_great_egret", "desert_hare",
    "hoopoe", "ruppells_fox", "iraqi_sandgrouse", "water_rail", "green_bee_eater",
    "desert_monitor", "purple_sunbird", "blue_throated_wagtail", "gerbillus_cheesmani",
    "yellow_wagtail", "sandfish_lizard", "spiny_tailed_lizard", "little_owl",
    "arabian_oryx", "houbara_bustard", "dorcas_gazelle", "eurasian_stone_curlew",
    "white_tailed_lapwing", "desert_eagle_owl", "hedgehog"
  ];

  // Guest signup - simplified registration with name and email only
  app.post("/api/auth/guest-signup", async (req, res) => {
    try {
      const { name, email, watchedVideos, unlockedAnimals, points } = req.body;
      
      if (!name || typeof name !== "string" || name.trim().length < 1) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Generate a random password for the guest account
      const randomPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      const user = await storage.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: "",
        password: hashedPassword
      });
      
      // Validate and sanitize watchedVideos, unlockedAnimals and points from client
      let validWatchedVideos: string[] = [];
      let validUnlockedAnimals: string[] = [];
      let validPoints = 0;
      
      if (Array.isArray(watchedVideos) && watchedVideos.length > 0) {
        validWatchedVideos = watchedVideos
          .filter((id): id is string => typeof id === "string" && VALID_ANIMAL_IDS.includes(id))
          .slice(0, VALID_ANIMAL_IDS.length);
        // Calculate points based on valid watched videos (1 point each)
        validPoints = validWatchedVideos.length * 1;
      }

      if (Array.isArray(unlockedAnimals) && unlockedAnimals.length > 0) {
        validUnlockedAnimals = unlockedAnimals
          .filter((id): id is string => typeof id === "string" && VALID_ANIMAL_IDS.includes(id))
          .slice(0, VALID_ANIMAL_IDS.length);
      }
      
      // Override points if provided and valid, but cap at max possible
      if (typeof points === "number" && points >= 0) {
        const maxPoints = VALID_ANIMAL_IDS.length * 1;
        validPoints = Math.min(points, maxPoints);
      }
      
      await storage.createProgress({
        userId: user.id,
        unlockedAnimals: validUnlockedAnimals,
        watchedVideos: validWatchedVideos,
        points: validPoints
      });

      // Log signup as first login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

      // Create session token
      const token = generateToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getExpiryDate()
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token, expiresAt: getExpiryDate().toISOString() });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // User login by name + email (no password needed for regular users)
  app.post("/api/auth/user-login", async (req, res) => {
    try {
      const { name, email } = req.body;
      
      if (!name || typeof name !== "string" || name.trim().length < 1) {
        return res.status(400).json({ error: "Name is required" });
      }
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ error: "Email is required" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const user = await storage.getUserByEmail(email.trim().toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "No account found with this email" });
      }

      // Verify name matches (case insensitive)
      if (user.name.toLowerCase() !== name.trim().toLowerCase()) {
        return res.status(401).json({ error: "Name does not match our records" });
      }

      // Don't allow admin login through this endpoint
      if (user.isAdmin) {
        return res.status(401).json({ error: "Admin users must use admin login" });
      }

      // Log login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

      // Create session token
      const token = generateToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getExpiryDate()
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token, expiresAt: getExpiryDate().toISOString() });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Admin login (requires email + password)
  app.post("/api/auth/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || !user.isAdmin) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      // Log login
      await storage.createLoginHistory({
        userId: user.id,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.socket.remoteAddress || null
      });

      // Create session token
      const token = generateToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getExpiryDate()
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token, expiresAt: getExpiryDate().toISOString() });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login user (legacy - keep for compatibility)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors || "Email and password are required" });
      }

      const { email, password } = result.data;

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

      // Create session token
      const token = generateToken();
      await storage.createSession({
        userId: user.id,
        token,
        expiresAt: getExpiryDate()
      });

      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token, expiresAt: getExpiryDate().toISOString() });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Logout - invalidate session
  app.post("/api/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        await storage.deleteSession(token);
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Validate session
  app.get("/api/auth/validate", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ valid: false });
      }

      const token = authHeader.slice(7);
      const session = await storage.getSessionByToken(token);
      
      if (!session) {
        return res.status(401).json({ valid: false });
      }

      const user = await storage.getUser(session.userId);
      if (!user) {
        return res.status(401).json({ valid: false });
      }

      const { password: _, ...safeUser } = user;
      res.json({ valid: true, user: safeUser, expiresAt: session.expiresAt.toISOString() });
    } catch (error: any) {
      res.status(500).json({ valid: false, error: error.message });
    }
  });

  // Get current user by ID (authenticated - users can only access their own data)
  app.get("/api/auth/user/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.id as string;
      if (req.user?.id !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const user = await storage.getUser(userId);
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
  app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      
      const usersWithProgress = await Promise.all(
        users.map(async (user) => {
          const progress = await storage.getProgress(user.id);
          const logins = await storage.getUserLoginHistory(user.id);
          const { password: _, ...safeUser } = user;
          return {
            ...safeUser,
            videosWatched: progress?.watchedVideos?.length || 0,
            watchedVideos: progress?.watchedVideos || [],
            points: progress?.points || 0,
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
  app.get("/api/admin/analytics", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const allProgress = await storage.getAllProgress();
      const loginStats = await storage.getLoginStats();
      const recentLogins = await storage.getLoginHistory(50);

      // Calculate stats
      const totalUsers = users.filter(u => !u.isAdmin).length;
      const totalVideosWatched = allProgress.reduce((acc, p) => acc + (p.watchedVideos?.length || 0), 0);
      const totalPoints = allProgress.reduce((acc, p) => acc + (p.points || 0), 0);
      const avgVideosPerUser = totalUsers > 0 ? totalVideosWatched / totalUsers : 0;
      
      // Users signed up today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const signupsToday = users.filter(u => new Date(u.createdAt) >= today).length;
      
      // Users signed up this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const signupsThisWeek = users.filter(u => new Date(u.createdAt) >= weekAgo).length;

      // Leaderboard - top 10 users by points
      const usersWithVideos = await Promise.all(
        users.filter(u => !u.isAdmin).map(async (user) => {
          const progress = await storage.getProgress(user.id);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            videosWatched: progress?.watchedVideos?.length || 0,
            points: progress?.points || 0
          };
        })
      );
      
      const leaderboard = usersWithVideos
        .sort((a, b) => b.points - a.points)
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
          totalPoints,
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
  app.get("/api/admin/login-history", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
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

  // Get user progress (authenticated, auto-create if not found)
  app.get("/api/progress/:userId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId as string;
      if (req.user?.id !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      let progress = await storage.getProgress(userId);
      if (!progress) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        progress = await storage.createProgress({
          userId,
          unlockedAnimals: [],
          watchedVideos: [],
          points: 0
        });
      }
      res.json({ progress });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update user progress (authenticated, auto-create if not found)
  app.patch("/api/progress/:userId", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.params.userId as string;
      if (req.user?.id !== userId && !req.user?.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      let existingProgress = await storage.getProgress(userId);
      if (!existingProgress) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        existingProgress = await storage.createProgress({
          userId,
          unlockedAnimals: [],
          watchedVideos: [],
          points: 0
        });
      }
      
      const validatedData = updateUserProgressSchema.parse(req.body);
      
      // Server-side points validation: derive points from watchedVideos
      // Ignore client-provided points to prevent tampering
      let serverDerivedPoints = existingProgress.points;
      if (validatedData.watchedVideos) {
        // Filter to only valid animal IDs
        const validWatchedVideos = validatedData.watchedVideos.filter(
          (id): id is string => typeof id === "string" && VALID_ANIMAL_IDS.includes(id)
        );
        validatedData.watchedVideos = validWatchedVideos;
        // Derive points: 1 point per watched video
        serverDerivedPoints = validWatchedVideos.length * 1;
      }
      
      // Override client points with server-derived points
      validatedData.points = serverDerivedPoints;
      
      const progress = await storage.updateProgress(userId, validatedData);
      res.json({ progress });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Public QR validation endpoint for guests (BETA)
  app.post("/api/validate-qr", async (req, res) => {
    try {
      const { animalId, signature, qrCode } = req.body;
      
      // Support both URL-based (animalId + signature) and legacy (qrCode) formats
      if (animalId && signature) {
        if (!validateQRSignature(animalId, signature)) {
          return res.json({ valid: false, message: "Invalid QR signature" });
        }
        if (!VALID_ANIMAL_IDS.includes(animalId)) {
          return res.json({ valid: false, message: "Unknown animal" });
        }
        return res.json({ valid: true, animalId });
      } else if (qrCode) {
        const validation = validateQRCode(qrCode);
        if (!validation.valid || !validation.animalId) {
          return res.json({ valid: false, message: "Invalid QR code" });
        }
        return res.json({ valid: true, animalId: validation.animalId });
      }
      
      return res.json({ valid: false, message: "Invalid request" });
    } catch (error: any) {
      console.error("QR validation error:", error);
      res.status(500).json({ valid: false, message: "Validation failed" });
    }
  });

  // QR Code unlock animal endpoint (BETA)
  app.post("/api/unlock-animal", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { qrCode, animalId: directAnimalId, signature } = req.body;
      
      let animalId: string | undefined;
      
      // Support both direct animalId with signature and legacy qrCode formats
      if (directAnimalId && typeof directAnimalId === "string" && signature && typeof signature === "string") {
        // Direct animal ID with signature (from URL-based QR codes)
        // Validate the signature to ensure this came from a valid QR code
        if (!validateQRSignature(directAnimalId, signature)) {
          return res.status(400).json({ success: false, message: "Invalid QR signature" });
        }
        animalId = directAnimalId;
      } else if (qrCode && typeof qrCode === "string") {
        // Legacy QR code format - validate against whitelist
        const validation = validateQRCode(qrCode);
        if (!validation.valid || !validation.animalId) {
          return res.status(400).json({ success: false, message: "Invalid or unrecognized QR code" });
        }
        animalId = validation.animalId;
      } else {
        return res.status(400).json({ success: false, message: "Valid QR code or signed animal ID required" });
      }
      
      // Validate animal exists in VALID_ANIMAL_IDS
      if (!VALID_ANIMAL_IDS.includes(animalId)) {
        return res.status(400).json({ success: false, message: "Unknown animal" });
      }

      const userId = req.user!.id;
      let progress = await storage.getProgress(userId);
      
      if (!progress) {
        progress = await storage.createProgress({
          userId,
          unlockedAnimals: [],
          watchedVideos: [],
          points: 0
        });
      }

      const currentUnlocked = progress.unlockedAnimals || [];
      const alreadyUnlocked = currentUnlocked.includes(animalId);

      if (!alreadyUnlocked) {
        const updatedAnimals = [...currentUnlocked, animalId];
        await storage.updateProgress(userId, {
          unlockedAnimals: updatedAnimals,
          watchedVideos: progress.watchedVideos,
          points: progress.points
        });
      }

      res.json({ 
        success: true, 
        animalId, 
        alreadyUnlocked,
        message: alreadyUnlocked ? "Animal already unlocked" : "Animal unlocked successfully"
      });
    } catch (error: any) {
      console.error("Unlock animal error:", error);
      res.status(500).json({ success: false, message: "Failed to unlock animal" });
    }
  });

  // AI Wildlife Guide - answer questions about animals
  app.post("/api/animal-guide", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const parseResult = animalGuideRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        const errors = parseResult.error.errors.map(e => e.message).join(", ");
        return res.status(400).json({ error: errors });
      }
      
      const { animalId, animalName, scientificName, question, language } = parseResult.data;

      const systemPrompt = language === 'ar' 
        ? `أنت مرشد الحياة البرية في محمية المرموم الصحراوية. أنت خبير في الحياة البرية الصحراوية وتجيب عن الأسئلة المتعلقة بالحيوانات في المحمية. 

الحيوان الحالي: ${animalName} (${scientificName})

قدم إجابات موجزة ومفيدة (2-3 جمل) باللغة العربية. ركز على الحقائق المثيرة حول هذا الحيوان وموئله وسلوكه وجهود الحفاظ عليه في دولة الإمارات العربية المتحدة والمنطقة العربية.`
        : `You are a wildlife guide at Al Marmoom Desert Conservation Reserve. You are an expert on desert wildlife and answer questions about the animals in the reserve.

Current animal: ${animalName} (${scientificName})

Provide concise, informative answers (2-3 sentences). Focus on fascinating facts about this animal, its habitat, behavior, and conservation efforts in UAE and the Arabian region.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const answer = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
      
      res.json({ answer });
    } catch (error: any) {
      console.error("AI Guide error:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Activity logging endpoint - works for both guests and logged-in users
  app.post("/api/activity", async (req, res) => {
    try {
      const { activityType, animalId, metadata, sessionId } = req.body;
      
      if (!activityType) {
        return res.status(400).json({ error: "Activity type is required" });
      }

      // Check if user is authenticated
      let userId: string | undefined = undefined;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const session = await storage.getSessionByToken(token);
        if (session) {
          userId = session.userId;
        }
      }

      await storage.createActivityLog({
        sessionId: sessionId || null,
        userId: userId || null,
        activityType,
        animalId: animalId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userAgent: req.headers["user-agent"] || null,
        ipAddress: req.ip || req.headers["x-forwarded-for"]?.toString() || null,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Activity log error:", error);
      res.status(500).json({ error: "Failed to log activity" });
    }
  });

  // Admin endpoint to get all activity logs
  app.get("/api/admin/activities", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 200;
      const type = req.query.type as string;
      
      let activities;
      if (type) {
        activities = await storage.getActivityLogsByType(type, limit);
      } else {
        activities = await storage.getActivityLogs(limit);
      }
      
      res.json({ activities });
    } catch (error: any) {
      console.error("Get activities error:", error);
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  // Admin endpoint to get activity statistics
  app.get("/api/admin/activity-stats", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const stats = await storage.getActivityStats();
      res.json({ stats });
    } catch (error: any) {
      console.error("Get activity stats error:", error);
      res.status(500).json({ error: "Failed to get activity stats" });
    }
  });

  // Admin endpoint for comprehensive user activity report
  app.get("/api/admin/user-activity-report", authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      const allActivities = await storage.getActivityLogs(10000);
      
      const userActivityReports = await Promise.all(
        users.filter(u => !u.isAdmin).map(async (user) => {
          const progress = await storage.getProgress(user.id);
          const loginHistory = await storage.getUserLoginHistory(user.id);
          
          // Filter activities for this user
          const userActivities = allActivities.filter(a => a.userId === user.id);
          
          // Count video_watch events per animal
          const videoWatchActivities = userActivities.filter(a => a.activityType === 'video_watch');
          const videoWatchCounts: Record<string, number> = {};
          videoWatchActivities.forEach(a => {
            if (a.animalId) {
              videoWatchCounts[a.animalId] = (videoWatchCounts[a.animalId] || 0) + 1;
            }
          });
          
          // Count qr_scan events
          const qrScanActivities = userActivities.filter(a => a.activityType === 'qr_scan');
          const qrCodesScanned: string[] = [];
          qrScanActivities.forEach(a => {
            if (a.animalId && !qrCodesScanned.includes(a.animalId)) {
              qrCodesScanned.push(a.animalId);
            }
            // Also check metadata for qr code info
            if (a.metadata) {
              try {
                const meta = typeof a.metadata === 'string' ? JSON.parse(a.metadata) : a.metadata;
                if (meta.animalId && !qrCodesScanned.includes(meta.animalId)) {
                  qrCodesScanned.push(meta.animalId);
                }
                if (meta.qrCode && !qrCodesScanned.includes(meta.qrCode)) {
                  qrCodesScanned.push(meta.qrCode);
                }
              } catch (e) {
                // ignore parse errors
              }
            }
          });
          
          // Count ar_view events
          const arViewCount = userActivities.filter(a => a.activityType === 'ar_view').length;
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            createdAt: user.createdAt,
            watchedVideos: progress?.watchedVideos || [],
            points: progress?.points || 0,
            loginCount: loginHistory.length,
            lastLogin: loginHistory[0]?.loginAt || null,
            videoWatchCounts,
            qrScanCount: qrScanActivities.length,
            qrCodesScanned,
            arViewCount
          };
        })
      );
      
      res.json({ users: userActivityReports });
    } catch (error: any) {
      console.error("Get user activity report error:", error);
      res.status(500).json({ error: "Failed to get user activity report" });
    }
  });

  return httpServer;
}
