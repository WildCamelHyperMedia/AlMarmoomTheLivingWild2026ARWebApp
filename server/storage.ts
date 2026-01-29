import { users, userProgress, loginHistory, sessions, activityLog, type User, type InsertUser, type UserProgress, type InsertUserProgress, type UpdateUserProgress, type LoginHistory, type InsertLoginHistory, type Session, type InsertSession, type ActivityLog, type InsertActivityLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, gt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Progress operations
  getProgress(userId: string): Promise<UserProgress | undefined>;
  createProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateProgress(userId: string, update: UpdateUserProgress): Promise<UserProgress>;
  getAllProgress(): Promise<UserProgress[]>;
  
  // Login history operations
  createLoginHistory(login: InsertLoginHistory): Promise<LoginHistory>;
  getLoginHistory(limit?: number): Promise<LoginHistory[]>;
  getUserLoginHistory(userId: string): Promise<LoginHistory[]>;
  getLoginStats(): Promise<{ date: string; count: number }[]>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSessionByToken(token: string): Promise<Session | undefined>;
  deleteSession(token: string): Promise<void>;
  deleteUserSessions(userId: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Activity log operations
  createActivityLog(activity: InsertActivityLog): Promise<ActivityLog>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
  getActivityLogsByType(type: string, limit?: number): Promise<ActivityLog[]>;
  getActivityStats(): Promise<{ type: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getProgress(userId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress || undefined;
  }

  async createProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values(insertProgress)
      .returning();
    return progress;
  }

  async updateProgress(userId: string, update: UpdateUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set({ ...update, lastUpdated: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return progress;
  }

  async getAllProgress(): Promise<UserProgress[]> {
    return await db.select().from(userProgress);
  }

  async createLoginHistory(login: InsertLoginHistory): Promise<LoginHistory> {
    const [history] = await db
      .insert(loginHistory)
      .values(login)
      .returning();
    return history;
  }

  async getLoginHistory(limit: number = 100): Promise<LoginHistory[]> {
    return await db.select().from(loginHistory).orderBy(desc(loginHistory.loginAt)).limit(limit);
  }

  async getUserLoginHistory(userId: string): Promise<LoginHistory[]> {
    return await db.select().from(loginHistory).where(eq(loginHistory.userId, userId)).orderBy(desc(loginHistory.loginAt));
  }

  async getLoginStats(): Promise<{ date: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT DATE(login_at) as date, COUNT(*) as count 
      FROM login_history 
      WHERE login_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(login_at) 
      ORDER BY date DESC
    `);
    return result.rows as { date: string; count: number }[];
  }

  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db
      .insert(sessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getSessionByToken(token: string): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())));
    return session || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.userId, userId));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(sql`expires_at < NOW()`);
  }

  async createActivityLog(activity: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db
      .insert(activityLog)
      .values(activity)
      .returning();
    return log;
  }

  async getActivityLogs(limit: number = 200): Promise<ActivityLog[]> {
    return await db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit);
  }

  async getActivityLogsByType(type: string, limit: number = 100): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.activityType, type))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit);
  }

  async getActivityStats(): Promise<{ type: string; count: number }[]> {
    const result = await db.execute(sql`
      SELECT activity_type as type, COUNT(*) as count 
      FROM activity_log 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY activity_type 
      ORDER BY count DESC
    `);
    return result.rows as { type: string; count: number }[];
  }
}

export const storage = new DatabaseStorage();
