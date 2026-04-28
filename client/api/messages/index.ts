import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq, or, and } from "drizzle-orm";

const { Pool } = pkg;

const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { messages } });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const { userId, otherUserId } = req.query;
    if (!userId || !otherUserId) return res.status(400).json({ message: "userId e otherUserId sao obrigatorios" });

    const msgs = await db.select().from(messages).where(
      or(
        and(eq(messages.senderId, Number(userId)), eq(messages.receiverId, Number(otherUserId))),
        and(eq(messages.senderId, Number(otherUserId)), eq(messages.receiverId, Number(userId)))
      )
    );

    // Marcar como lidas
    await db.update(messages)
      .set({ read: true })
      .where(and(eq(messages.receiverId, Number(userId)), eq(messages.senderId, Number(otherUserId))));

    return res.status(200).json(msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }

  if (req.method === "POST") {
    const { senderId, receiverId, content } = req.body;
    if (!senderId || !receiverId || !content) return res.status(400).json({ message: "Campos obrigatorios em falta" });

    const [created] = await db.insert(messages).values({
      senderId: Number(senderId),
      receiverId: Number(receiverId),
      content,
    }).returning();

    return res.status(201).json(created);
  }

  return res.status(405).end();
}