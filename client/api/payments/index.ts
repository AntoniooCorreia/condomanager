import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";

const { Pool } = pkg;

const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  description: text("description").notNull(),
  paymentMethod: text("payment_method"),
  proofUrl: text("proof_url"),
  submittedAt: timestamp("submitted_at"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
});

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userType: text("user_type").notNull().default("condomino"),
  relatedCondominoId: integer("related_condomino_id"),
  role: text("role").notNull().default("user"),
});

const paymentSchedules = pgTable("payment_schedules", {
  id: serial("id").primaryKey(),
  condominoId: integer("condomino_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  dayOfMonth: integer("day_of_month").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description").notNull(),
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date").notNull().defaultNow(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { payments, paymentSchedules, users } });

const PAYMENT_METHODS = ["mbway", "transferencia", "dinheiro", "cheque", "outro"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resource, action } = req.query;
  const id = req.query.id ? Number(req.query.id) : null;

  // Arrendatario/condomino envia o comprovativo (obrigatorio para qualquer pagamento)
  if (req.method === "POST" && action === "submit-proof") {
    const bodyId = Number(req.body?.id);
    const { paymentMethod, proofUrl } = req.body || {};
    if (!bodyId) return res.status(400).json({ message: "Pagamento em falta." });
    if (!proofUrl) return res.status(400).json({ message: "E obrigatorio anexar o comprovativo de pagamento." });
    if (!paymentMethod || !PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Selecione um metodo de pagamento valido." });
    }
    const [updated] = await db.update(payments).set({
      status: "aguarda_aprovacao",
      paymentMethod,
      proofUrl,
      submittedAt: new Date(),
      rejectionReason: null,
      approvedBy: null,
      approvedAt: null,
    }).where(eq(payments.id, bodyId)).returning();
    if (!updated) return res.status(404).json({ message: "Pagamento nao encontrado." });
    return res.status(200).json(updated);
  }

  // Condomino/admin aprova manualmente - so e possivel se ja existir comprovativo
  if (req.method === "POST" && action === "approve") {
    const bodyId = Number(req.body?.id);
    const approverId = req.body?.approvedBy ? Number(req.body.approvedBy) : null;
    if (!bodyId) return res.status(400).json({ message: "Pagamento em falta." });
    const [existing] = await db.select().from(payments).where(eq(payments.id, bodyId));
    if (!existing) return res.status(404).json({ message: "Pagamento nao encontrado." });
    if (!existing.proofUrl) {
      return res.status(400).json({ message: "Este pagamento ainda nao tem comprovativo anexado." });
    }
    const [updated] = await db.update(payments).set({
      status: "paid",
      paidDate: new Date(),
      approvedBy: approverId,
      approvedAt: new Date(),
      rejectionReason: null,
    }).where(eq(payments.id, bodyId)).returning();
    return res.status(200).json(updated);
  }

  // Condomino/admin rejeita o comprovativo - arrendatario/condomino tera de reenviar
  if (req.method === "POST" && action === "reject") {
    const bodyId = Number(req.body?.id);
    const reason = (req.body?.reason || "").trim();
    if (!bodyId) return res.status(400).json({ message: "Pagamento em falta." });
    const [updated] = await db.update(payments).set({
      status: "rejeitado",
      rejectionReason: reason || "Comprovativo rejeitado.",
      approvedBy: null,
      approvedAt: null,
    }).where(eq(payments.id, bodyId)).returning();
    if (!updated) return res.status(404).json({ message: "Pagamento nao encontrado." });
    return res.status(200).json(updated);
  }

  // Payment Schedules
  if (resource === "schedules") {
    if (req.method === "GET") {
      const all = await db.select().from(paymentSchedules);
      return res.status(200).json(all);
    }
    if (req.method === "POST") {
      const { condominoId, tenantId, dayOfMonth, amount, description, active } = req.body;
      const [created] = await db.insert(paymentSchedules).values({ condominoId: Number(condominoId), tenantId: Number(tenantId), dayOfMonth: Number(dayOfMonth), amount: String(amount), description, active: active ?? true }).returning();
      return res.status(201).json(created);
    }
    if (req.method === "DELETE" && id) {
      await db.delete(paymentSchedules).where(eq(paymentSchedules.id, id));
      return res.status(204).end();
    }
    return res.status(405).end();
  }

  // Payments
  if (req.method === "GET") {
    const all = await db.select().from(payments);
    return res.status(200).json(all);
  }
  if (req.method === "POST") {
    const { userId, amount, status, dueDate, description } = req.body;
    const paidDate = (status === "paid") ? new Date() : null;
    const [created] = await db.insert(payments).values({ userId: Number(userId), amount: String(amount), status: status || "pending", dueDate: new Date(dueDate), paidDate, description }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "PUT" && id) {
    const body: any = { ...req.body };
    if (body.status === "paid") {
      const [existing] = await db.select().from(payments).where(eq(payments.id, id));
      if (!existing?.proofUrl && !body.proofUrl) {
        return res.status(400).json({ message: "So e possivel marcar como pago depois de receber o comprovativo (use a acao de aprovacao)." });
      }
    }
    // Carimba a data de pagamento quando passa a "paid" (para historico de pontualidade);
    // limpa se voltar a um estado nao pago.
    if (body.status === "paid" && !body.paidDate) body.paidDate = new Date();
    if (body.status && body.status !== "paid") body.paidDate = null;
    const [updated] = await db.update(payments).set(body).where(eq(payments.id, id)).returning();
    if (!updated) return res.status(404).json({ message: "Nao encontrado" });
    return res.status(200).json(updated);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(payments).where(eq(payments.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}