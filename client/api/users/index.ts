import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { users } from "../../client/src/shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(users);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { username, password, name, unit, role, userType } = req.body;
    if (!username || !password || !name) return res.status(400).json({ message: "Campos obrigatórios em falta" });
    const [created] = await db.insert(users).values({ username, password, name, unit, role: role || "user", userType: userType || "condomino" }).returning();
    return res.status(201).json(created);
  }
  return res.status(405).end();
}
