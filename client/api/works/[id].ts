import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const works = pgTable("works", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cost: numeric("cost"),
  assignedUserIds: integer("assigned_user_ids").array(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { works } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "ID inválido" });

  if (req.method === "PUT") {
    const [updated] = await db.update(works).set(req.body).where(eq(works.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE") {
    await db.delete(works).where(eq(works.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
