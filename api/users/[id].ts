import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { users } from "../../client/src/shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "ID inválido" });
  if (req.method === "PUT") {
    const [updated] = await db.update(users).set(req.body).where(eq(users.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE") {
    await db.delete(users).where(eq(users.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
