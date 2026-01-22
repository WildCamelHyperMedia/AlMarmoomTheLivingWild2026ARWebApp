import { users, userProgress, loginHistory, type User, type InsertUser, type UserProgress, type InsertUserProgress, type UpdateUserProgress, type LoginHistory, type InsertLoginHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
