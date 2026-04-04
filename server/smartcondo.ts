import OpenAI from "openai";
import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  users, payments, reservations, works, securityLogs,
  paymentSchedules, conversations, chatMessages
} from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

  const areas = ["pool", "gym", "party_room"];
  const areaNames: Record<string, string> = { pool: "Piscina", gym: "Ginásio", party_room: "Salão de Festas" };

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
${secLogs.filter(s => s.status === "open").length} ocorrências abertas.

REGRAS DO CONDOMÍNIO:
- Reservas devem ser feitas com antecedência.
- Cada fração pode ter apenas uma reserva por área por dia.
- Piscina: disponível todos os dias.
- Ginásio: disponível todos os dias.
- Salão de Festas: disponível para reserva em datas sem outros eventos.`;
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
  // Save user message
  await db.insert(chatMessages).values({
    conversationId,
    role: "user",
    content: userMessage,
  });

  // Get conversation history (last 10 messages)
  const history = await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt)
    .limit(20);

  const context = await buildContext(userId);

  const systemPrompt = `És o SmartCondo, o assistente inteligente do Condomínio Prestige. 
Respondes sempre em português de Portugal (pt-PT).
Tens acesso aos dados reais do condomínio e ajudas os moradores com questões sobre:
- Reservas de áreas comuns (piscina, ginásio, salão de festas)
- Pagamentos e quotas
- Obras e manutenção
- Segurança e ocorrências
- Informações gerais do edifício

Quando te perguntam sobre disponibilidade de reservas, verifica as reservas existentes e responde com precisão.
Sê simpático, direto e útil. Usa linguagem acessível.

DADOS ATUAIS DO SISTEMA:
${context}`;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  // Stream response
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    stream: true,
    max_tokens: 600,
  });

  let fullResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  // Save assistant response
  await db.insert(chatMessages).values({
    conversationId,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

export async function getChatHistory(conversationId: number) {
  return db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}
