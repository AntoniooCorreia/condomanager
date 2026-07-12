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
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET" && !id) {
    const all = await db.select().from(works);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { title, description, status, startDate, endDate, cost, assignedUserIds } = req.body;
    const [created] = await db.insert(works).values({ title, description, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, cost: cost ? String(cost) : null, assignedUserIds: assignedUserIds || [] }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    try {
      const { title, description, status, startDate, endDate, cost, assignedUserIds } = req.body;
      const fields: any = {};
      if (title !== undefined) fields.title = title;
      if (description !== undefined) fields.description = description;
      if (status !== undefined) fields.status = status;
      if (startDate !== undefined) fields.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) fields.endDate = endDate ? new Date(endDate) : null;
      if (cost !== undefined) fields.cost = cost ? String(cost) : null;
      if (assignedUserIds !== undefined) fields.assignedUserIds = assignedUserIds || [];
      if (Object.keys(fields).length === 0) return res.status(400).json({ message: "Nada para atualizar" });
      const [updated] = await db.update(works).set(fields).where(eq(works.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Obra nao encontrada" });
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Erro ao atualizar obra" });
    }
  }
  if (req.method === "DELETE" && id) {
    await db.delete(works).where(eq(works.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}