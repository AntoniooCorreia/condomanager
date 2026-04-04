import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { works } from "../client/src/shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pkg;
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { works } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(works);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { title, description, status, startDate, endDate, cost, assignedUserIds } = req.body;
    const [created] = await db.insert(works).values({ title, description, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, cost: cost ? String(cost) : null, assignedUserIds: assignedUserIds || [] }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(works).set(req.body).where(eq(works.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(works).where(eq(works.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
