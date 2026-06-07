import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("geral"),
  fileUrl: text("file_url"),
  content: text("content"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  visibility: text("visibility").notNull().default("todos"),
  visibleUserIds: integer("visible_user_ids").array(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { documents } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(documents);
    return res.status(200).json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  if (req.method === "POST") {
    const { title, description, category, fileUrl, content, createdBy, visibility, visibleUserIds } = req.body;
    const [created] = await db.insert(documents).values({
      title, description, category: category || "geral", fileUrl, content,
      createdBy: createdBy ? Number(createdBy) : null,
      visibility: visibility || "todos",
      visibleUserIds: visibleUserIds || [],
    }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(documents).where(eq(documents.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}