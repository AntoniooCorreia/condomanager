import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { securityLogs } from "../src/shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pkg;
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { securityLogs } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(securityLogs);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { reportedBy, description, status } = req.body;
    const [created] = await db.insert(securityLogs).values({ reportedBy: reportedBy ? Number(reportedBy) : null, description, status: status || "open" }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(securityLogs).set(req.body).where(eq(securityLogs.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  return res.status(405).end();
}
