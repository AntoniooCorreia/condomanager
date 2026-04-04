import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { securityLogs } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(securityLogs);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { reportedBy, description, status } = req.body;
    const [created] = await db.insert(securityLogs).values({ reportedBy: reportedBy ? Number(reportedBy) : null, description, status: status || "open" }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
