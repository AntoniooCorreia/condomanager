import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq, and } from "drizzle-orm";

const { Pool } = pkg;

const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  area: text("area").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { reservations } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const all = await db.select().from(reservations);
    return res.status(200).json(all);
  }

  if (req.method === "POST") {
    const { userId, area, date } = req.body;
    const reservationDate = new Date(date);

    // Verificar se já existe reserva aprovada para o mesmo espaço e hora
    const existing = await db.select().from(reservations).where(
      and(
        eq(reservations.area, area),
        eq(reservations.status, "approved")
      )
    );

    // Verificar conflito de hora (dentro de 1 hora)
    const hasConflict = existing.some(r => {
      const diff = Math.abs(new Date(r.date).getTime() - reservationDate.getTime());
      return diff < 60 * 60 * 1000; // 1 hora em milissegundos
    });

    const status = hasConflict ? "pending" : "approved";

    const [created] = await db.insert(reservations).values({
      userId: Number(userId),
      area,
      date: reservationDate,
      status
    }).returning();

    return res.status(201).json(created);
  }

  return res.status(405).end();
}
