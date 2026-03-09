import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  users, type User, type InsertUser,
  payments, type Payment, type InsertPayment,
  works, type Work, type InsertWork,
  reservations, type Reservation, type InsertReservation,
  securityLogs, type SecurityLog, type InsertSecurityLog
} from "@shared/schema";

export interface IStorage {
  // users
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // payments
  getPayments(): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined>;

  // works
  getWorks(): Promise<Work[]>;
  createWork(work: InsertWork): Promise<Work>;
  updateWork(id: number, updates: Partial<InsertWork>): Promise<Work | undefined>;

  // reservations
  getReservations(): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined>;

  // securityLogs
  getSecurityLogs(): Promise<SecurityLog[]>;
  createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog>;
  updateSecurityLog(id: number, updates: Partial<InsertSecurityLog>): Promise<SecurityLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }
  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return updated;
  }

  async getWorks(): Promise<Work[]> {
    return await db.select().from(works);
  }
  async deleteWork(id: number): Promise<void> {
    await db.delete(works).where(eq(works.id, id));
  }
  async createWork(work: InsertWork): Promise<Work> {
    const [created] = await db.insert(works).values(work).returning();
    return created;
  }
  async updateWork(id: number, updates: Partial<InsertWork>): Promise<Work | undefined> {
    const [updated] = await db.update(works).set(updates).where(eq(works.id, id)).returning();
    return updated;
  }

  async getReservations(): Promise<Reservation[]> {
    return await db.select().from(reservations);
  }
  async createReservation(reservation: InsertReservation): Promise<Reservation> {
    const [created] = await db.insert(reservations).values(reservation).returning();
    return created;
  }
  async updateReservation(id: number, updates: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const [updated] = await db.update(reservations).set(updates).where(eq(reservations.id, id)).returning();
    return updated;
  }

  async getSecurityLogs(): Promise<SecurityLog[]> {
    return await db.select().from(securityLogs);
  }
  async createSecurityLog(log: InsertSecurityLog): Promise<SecurityLog> {
    const [created] = await db.insert(securityLogs).values(log).returning();
    return created;
  }
  async updateSecurityLog(id: number, updates: Partial<InsertSecurityLog>): Promise<SecurityLog | undefined> {
    const [updated] = await db.update(securityLogs).set(updates).where(eq(securityLogs.id, id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
