import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq, and } from "drizzle-orm";

const { Pool } = pkg;

const assembleias = pgTable("assembleias", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("agendada"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  allowedUsers: integer("allowed_users").array(),
});

const votacoes = pgTable("votacoes", {
  id: serial("id").primaryKey(),
  assembleiaId: integer("assembleia_id").notNull(),
  question: text("question").notNull(),
  status: text("status").notNull().default("aberta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const votos = pgTable("votos", {
  id: serial("id").primaryKey(),
  votacaoId: integer("votacao_id").notNull(),
  userId: integer("user_id").notNull(),
  voto: text("voto").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { assembleias, votacoes, votos } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resource, id } = req.query;

  // VOTOS
  if (resource === "votos") {
    if (req.method === "GET") {
      const votacaoId = req.query.votacaoId ? Number(req.query.votacaoId) : null;
      if (!votacaoId) return res.status(400).json({ message: "votacaoId em falta" });
      const all = await db.select().from(votos).where(eq(votos.votacaoId, votacaoId));
      return res.status(200).json(all);
    }
    if (req.method === "POST") {
      const { votacaoId, userId, voto } = req.body;
      try {
        const [created] = await db.insert(votos).values({ votacaoId: Number(votacaoId), userId: Number(userId), voto }).returning();
        return res.status(201).json(created);
      } catch {
        return res.status(400).json({ message: "Ja votou nesta votacao" });
      }
    }
    return res.status(405).end();
  }

  // VOTACOES
  if (resource === "votacoes") {
    if (req.method === "GET") {
      const assembleiaId = req.query.assembleiaId ? Number(req.query.assembleiaId) : null;
      if (!assembleiaId) return res.status(400).json({ message: "assembleiaId em falta" });
      const all = await db.select().from(votacoes).where(eq(votacoes.assembleiaId, assembleiaId));
      return res.status(200).json(all);
    }
    if (req.method === "POST") {
      const { assembleiaId, question } = req.body;
      const [created] = await db.insert(votacoes).values({ assembleiaId: Number(assembleiaId), question }).returning();
      return res.status(201).json(created);
    }
    if (req.method === "PUT" && id) {
      const [updated] = await db.update(votacoes).set(req.body).where(eq(votacoes.id, Number(id))).returning();
      return res.status(200).json(updated);
    }
    if (req.method === "DELETE" && id) {
      await db.delete(votacoes).where(eq(votacoes.id, Number(id)));
      return res.status(204).end();
    }
    return res.status(405).end();
  }

  // ASSEMBLEIAS
  if (req.method === "GET") {
    const all = await db.select().from(assembleias);
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const isAdmin = req.query.isAdmin === "true";
    const visible = (!userId || isAdmin)
      ? all
      : all.filter(a => !a.allowedUsers || a.allowedUsers.length === 0 || a.allowedUsers.includes(userId));
    return res.status(200).json(visible.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }
  if (req.method === "POST") {
    const { title, description, date, status, createdBy, allowedUsers } = req.body;
    const [created] = await db.insert(assembleias).values({ title, description, date: new Date(date), status: status || "agendada", createdBy: createdBy ? Number(createdBy) : null, allowedUsers: allowedUsers || [] }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const [updated] = await db.update(assembleias).set(req.body).where(eq(assembleias.id, Number(id))).returning();
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(assembleias).where(eq(assembleias.id, Number(id)));
    return res.status(204).end();
  }
  return res.status(405).end();
}