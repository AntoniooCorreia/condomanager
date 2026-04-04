import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { users } from "../../src/shared/schema";
import { eq } from "drizzle-orm";

const { Pool } = pkg;
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { users } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Dados inválidos" });
  const [user] = await db.select().from(users).where(eq(users.username, username));
  if (!user || user.password !== password) return res.status(401).json({ message: "Credenciais inválidas" });
  return res.status(200).json(user);
}
