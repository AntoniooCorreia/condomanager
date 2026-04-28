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
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { announcements } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(announcements);
    return res.status(200).json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  if (req.method === "POST") {
    const { title, content, category, createdBy } = req.body;
    const [created] = await db.insert(announcements).values({ title, content, category: category || "informativo", createdBy: createdBy ? Number(createdBy) : null }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(announcements).where(eq(announcements.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}