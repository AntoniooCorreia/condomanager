import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { reservations } from "./schema";
import { eq } from "drizzle-orm";

const { Pool } = pkg;
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { reservations } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(reservations);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { userId, area, date, status } = req.body;
    const [created] = await db.insert(reservations).values({ userId: Number(userId), area, date: new Date(date), status: status || "pending" }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(reservations).set(req.body).where(eq(reservations.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(reservations).where(eq(reservations.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
