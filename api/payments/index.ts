import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { payments } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(payments);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { userId, amount, status, dueDate, description } = req.body;
    const [created] = await db.insert(payments).values({ userId: Number(userId), amount: String(amount), status: status || "pending", dueDate: new Date(dueDate), description }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
