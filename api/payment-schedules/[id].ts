import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { paymentSchedules } from "../../client/src/shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (!id) return res.status(400).json({ message: "ID inválido" });
  if (req.method === "DELETE") {
    await db.delete(paymentSchedules).where(eq(paymentSchedules.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
