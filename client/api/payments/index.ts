import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { payments } from "../src/shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pkg;
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { payments } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(payments);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { userId, amount, status, dueDate, description } = req.body;
    const [created] = await db.insert(payments).values({ userId: Number(userId), amount: String(amount), status: status || "pending", dueDate: new Date(dueDate), description }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(payments).set(req.body).where(eq(payments.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(payments).where(eq(payments.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
