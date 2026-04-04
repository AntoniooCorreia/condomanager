import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  name: text("name").notNull(),
  unit: text("unit"),
  avatar: text("avatar"),
  userType: text("user_type").notNull().default("condomino"),
  relatedCondominoId: integer("related_condomino_id"),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { users } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

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
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(users).set(req.body).where(eq(users.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Não encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(users).where(eq(users.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
