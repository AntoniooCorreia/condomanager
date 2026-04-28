import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  area: text("area").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { reservations } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "ID inválido" });

  if (req.method === "PUT") {
    const [updated] = await db.update(reservations).set(req.body).where(eq(reservations.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE") {
    await db.delete(reservations).where(eq(reservations.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
