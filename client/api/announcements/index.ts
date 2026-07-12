import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("informativo"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { announcements } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(announcements);
    return res.status(200).json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  if (req.method === "POST") {
    try {
      const { title, content, category, createdBy, startDate, endDate } = req.body;
      if (!title || !content) return res.status(400).json({ message: "Titulo e mensagem sao obrigatorios" });
      const [created] = await db.insert(announcements).values({
        title,
        content,
        category: category || "informativo",
        createdBy: createdBy ? Number(createdBy) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      }).returning();
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Erro ao publicar aviso" });
    }
  }
  if (req.method === "DELETE" && id) {
    await db.delete(announcements).where(eq(announcements.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}