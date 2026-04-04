import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { paymentSchedules } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(paymentSchedules);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { condominoId, tenantId, dayOfMonth, amount, description, active } = req.body;
    const [created] = await db.insert(paymentSchedules).values({ condominoId: Number(condominoId), tenantId: Number(tenantId), dayOfMonth: Number(dayOfMonth), amount: String(amount), description, active: active ?? true }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
