import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  reportedBy: integer("reported_by"),
  description: text("description").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  status: text("status").notNull(),
  imageUrl: text("image_url"),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { securityLogs } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(securityLogs);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { reportedBy, description, status, imageUrl } = req.body;
    const desc = typeof description === "string" ? description.trim() : "";
    if (desc.length < 5) return res.status(400).json({ message: "A descricao e obrigatoria (minimo 5 caracteres)." });
    const [created] = await db.insert(securityLogs).values({ reportedBy: reportedBy ? Number(reportedBy) : null, description: desc, status: status || "open", imageUrl: imageUrl || null }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(securityLogs).set(req.body).where(eq(securityLogs.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Nao encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    const [deleted] = await db.delete(securityLogs).where(eq(securityLogs.id, id)).returning();
    if (!deleted) return res.status(404).json({ message: "Nao encontrado" });
    return res.status(200).json({ success: true });
  }
  return res.status(405).end();
}