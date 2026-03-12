import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin" | "user"
  name: text("name").notNull(),
  unit: text("unit"),
  avatar: text("avatar"),
  userType: text("user_type").notNull().default("condomino"), // "gestor", "condomino", "arrendatario"
  relatedCondominoId: integer("related_condomino_id").references(() => users.id), // Para arrendatarios
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(), // "pending" | "paid" | "overdue"
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // "planning" | "in_progress" | "completed"
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cost: numeric("cost"),
  assignedUserIds: integer("assigned_user_ids").array(),
});

export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  area: text("area").notNull(), // "pool", "gym", "party_room"
  date: timestamp("date").notNull(),
  status: text("status").notNull(), // "pending", "approved", "rejected"
});

export const paymentSchedules = pgTable("payment_schedules", {
  id: serial("id").primaryKey(),
  condominoId: integer("condomino_id").references(() => users.id).notNull(),
  tenantId: integer("tenant_id").references(() => users.id).notNull(),
  dayOfMonth: integer("day_of_month").notNull(), // 1-28
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date").notNull().defaultNow(),
});

export const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  reportedBy: integer("reported_by").references(() => users.id),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status").notNull(), // "open", "resolved"
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  payments: many(payments),
  reservations: many(reservations),
  securityLogs: many(securityLogs),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
}));

export const securityLogsRelations = relations(securityLogs, ({ one }) => ({
  user: one(users, {
    fields: [securityLogs.reportedBy],
    references: [users.id],
  }),
}));

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull().default("Nova Conversa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertWorkSchema = createInsertSchema(works).omit({ id: true });
export const insertReservationSchema = createInsertSchema(reservations).omit({ id: true });
export const insertSecurityLogSchema = createInsertSchema(securityLogs).omit({ id: true, date: true });
export const insertPaymentScheduleSchema = createInsertSchema(paymentSchedules).omit({ id: true, startDate: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Work = typeof works.$inferSelect;
export type InsertWork = z.infer<typeof insertWorkSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type SecurityLog = typeof securityLogs.$inferSelect;
export type InsertSecurityLog = z.infer<typeof insertSecurityLogSchema>;
export type PaymentSchedule = typeof paymentSchedules.$inferSelect;
export type InsertPaymentSchedule = z.infer<typeof insertPaymentScheduleSchema>;
