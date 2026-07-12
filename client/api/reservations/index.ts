import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq, and, ne } from "drizzle-orm";
const { Pool } = pkg;
const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  area: text("area").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull().default("pending"),
});
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { reservations } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;

  if (req.method === "GET") {
    const all = await db.select().from(reservations);
    return res.status(200).json(all);
  }

  if (req.method === "POST") {
    try {
      const { userId, area, date } = req.body;
      if (!userId || !area || !date) return res.status(400).json({ message: "Campos obrigatorios em falta" });
      const when = new Date(date);

      const clashes = await db.select().from(reservations)
        .where(and(eq(reservations.area, area), eq(reservations.date, when), ne(reservations.status, "rejected")));

      const autoStatus = clashes.length === 0 ? "approved" : "pending";

      const [created] = await db.insert(reservations)
        .values({ userId: Number(userId), area, date: when, status: autoStatus })
        .returning();

      return res.status(201).json({ ...created, autoApproved: autoStatus === "approved", conflicts: clashes.length });
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Erro ao criar reserva" });
    }
  }

  if (req.method === "PUT" && id) {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ message: "Estado em falta" });
      const [updated] = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
      if (!updated) return res.status(404).json({ message: "Reserva nao encontrada" });
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(500).json({ message: err?.message || "Erro ao atualizar reserva" });
    }
  }

  if (req.method === "DELETE" && id) {
    const [deleted] = await db.delete(reservations).where(eq(reservations.id, id)).returning();
    if (!deleted) return res.status(404).json({ message: "Reserva nao encontrada" });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}