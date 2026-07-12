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
    const { username, password, name, unit, role, userType, relatedCondominoId } = req.body;
    if (!username || !password || !name) return res.status(400).json({ message: "Campos obrigatorios em falta" });
    const [created] = await db.insert(users).values({ username, password, name, unit, role: role || "user", userType: userType || "condomino", relatedCondominoId: relatedCondominoId ? Number(relatedCondominoId) : null }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    try {
      const { username, password, name, unit, role, userType, relatedCondominoId, avatar } = req.body;
      const fields: any = {};
      if (username !== undefined) fields.username = username;
      if (password !== undefined) fields.password = password;
      if (name !== undefined) fields.name = name;
      if (unit !== undefined) fields.unit = unit;
      if (role !== undefined) fields.role = role;
      if (userType !== undefined) fields.userType = userType;
      if (avatar !== undefined) fields.avatar = avatar;
      if (relatedCondominoId !== undefined) fields.relatedCondominoId = relatedCondominoId ? Number(relatedCondominoId) : null;
      if (Object.keys(fields).length === 0) return res.status(400).json({ message: "Nada para atualizar" });
      const [updated] = await db.update(users).set(fields).where(eq(users.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Utilizador nao encontrado" });
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Erro ao atualizar utilizador" });
    }
  }
  if (req.method === "DELETE" && id) {
    try {
      const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
      if (!deleted) return res.status(404).json({ message: "Utilizador nao encontrado" });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      if (err?.code === "23503") {
        return res.status(409).json({ message: "Nao e possivel apagar: este utilizador tem registos associados (pagamentos, reservas ou ocorrencias). Apague-os primeiro." });
      }
      return res.status(500).json({ message: err?.message || "Erro ao apagar utilizador" });
    }
  }
  return res.status(405).end();
}