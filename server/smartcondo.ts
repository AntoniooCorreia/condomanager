// smartcondo.ts — versão sem OpenAI

// ❌ Removido: import OpenAI from "openai";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, payments, reservations, works, securityLogs,
  paymentSchedules, conversations, chatMessages
} from "client/shared/schema";

// 🔧 IA DESATIVADA
const AI_ENABLED = false;

async function buildContext(userId: number) {
  const [
    allUsers, userPayments, allReservations, allWorks, secLogs, user
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(payments).where(eq(payments.userId, userId)),
    db.select().from(reservations),
    db.select().from(works),
    db.select().from(securityLogs),
    db.select().from(users).where(eq(users.id, userId)).then(r => r[0]),
  ]);

  const today = new Date();
  const todayStr = today.toLocaleDateString("pt-PT", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const approvedReservations = allReservations.filter(r => r.status === "approved");
  const reservedDates = approvedReservations.map(r => ({
    area: r.area,
    date: new Date(r.date).toLocaleDateString("pt-PT"),
    userId: r.userId,
    isYours: r.userId === userId,
  }));

  const pendingPayments = userPayments.filter(p => p.status === "pending");
  const overduePayments = userPayments.filter(
    p => p.status === "pending" && new Date(p.dueDate) < today
  );

  const areaNames: Record<string, string> = {
    pool: "Piscina",
    gym: "Ginásio",
    party_room: "Salão de Festas"
  };

  return `Hoje é ${todayStr}.

UTILIZADOR ATUAL:
- Nome: ${user?.name}
- Fração: ${user?.unit}
- Tipo: ${user?.userType}

PAGAMENTOS DO UTILIZADOR:
- Total pendentes: ${pendingPayments.length}
- Em atraso: ${overduePayments.length}
${pendingPayments.map(p => `  • ${p.description}: €${p.amount} (vence ${new Date(p.dueDate).toLocaleDateString("pt-PT")})`).join("\n")}

RESERVAS EXISTENTES (todas):
${reservedDates.length === 0 ? "Nenhuma reserva aprovada." : reservedDates.map(r =>
  `  • ${areaNames[r.area] || r.area} - ${r.date}${r.isYours ? " (SUA reserva)" : ""}`
).join("\n")}

ÁREAS DISPONÍVEIS PARA RESERVA: Piscina (pool), Ginásio (gym), Salão de Festas (party_room)

OBRAS EM CURSO:
${allWorks.length === 0 ? "Nenhuma obra." : allWorks.map(w => `  • ${w.title} — Estado: ${w.status}`).join("\n")}

OCORRÊNCIAS DE SEGURANÇA:
${secLogs.filter(s => s.status === "open").length} ocorrências abertas.`;
}

export async function getOrCreateConversation(userId: number) {
  const existing = await db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(conversations.createdAt)
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [conv] = await db.insert(conversations)
    .values({ userId, title: "SmartCondo" })
    .returning();
  return conv;
}

export async function smartCondoChat(
  userId: number,
  conversationId: number,
  userMessage: string,
  res: any
) {
  // Guarda a mensagem do utilizador
  await db.insert(chatMessages).values({
    conversationId,
    role: "user",
    content: userMessage,
  });

  // Carrega histórico
  const history = await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt)
    .limit(20);

  const context = await buildContext(userId);

  // IA DESATIVADA → resposta automática
  if (!AI_ENABLED) {
    const fallbackResponse = `
⚠️ A funcionalidade de assistente inteligente (IA) está temporariamente desativada.

Ainda assim, aqui está um resumo útil da sua situação atual:

${context}

Se precisar de ajuda com reservas, pagamentos ou informações do condomínio, posso guiá-lo com base nos dados reais do sistema.
    `.trim();

    // Guarda resposta
    await db.insert(chatMessages).values({
      conversationId,
      role: "assistant",
      content: fallbackResponse,
    });

    // Envia via SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.write(`data: ${JSON.stringify({ content: fallbackResponse })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // (Se um dia ativares IA, aqui voltamos a colocar o código da OpenAI)
}

export async function getChatHistory(conversationId: number) {
  return db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}
