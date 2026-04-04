import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { securityLogs } from "../../client/src/shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "ID inválido" });
  if (req.method === "PUT") {
    const [updated] = await db.update(securityLogs).set(req.body).where(eq(securityLogs.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  return res.status(405).end();
}
