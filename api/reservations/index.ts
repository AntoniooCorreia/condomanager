import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { reservations } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(reservations);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { userId, area, date, status } = req.body;
    const [created] = await db.insert(reservations).values({ userId: Number(userId), area, date: new Date(date), status: status || "pending" }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
