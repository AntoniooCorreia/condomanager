import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { works } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(works);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { title, description, status, startDate, endDate, cost, assignedUserIds } = req.body;
    const [created] = await db.insert(works).values({ title, description, status, startDate: startDate ? new Date(startDate) : null, endDate: endDate ? new Date(endDate) : null, cost: cost ? String(cost) : null, assignedUserIds: assignedUserIds || [] }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
