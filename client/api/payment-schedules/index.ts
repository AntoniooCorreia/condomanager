import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const paymentSchedules = pgTable("payment_schedules", {
  id: serial("id").primaryKey(),
  condominoId: integer("condomino_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date").notNull().defaultNow(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { paymentSchedules } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(paymentSchedules);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { condominoId, tenantId, dayOfMonth, amount, description, active } = req.body;
    const [created] = await db.insert(paymentSchedules).values({ condominoId: Number(condominoId), tenantId: Number(tenantId), dayOfMonth: Number(dayOfMonth), amount: String(amount), description, active: active ?? true }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(paymentSchedules).where(eq(paymentSchedules.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
