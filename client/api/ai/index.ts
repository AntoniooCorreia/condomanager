import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
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

const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(),
  dueDate: timestamp("due_date").notNull(),
  description: text("description").notNull(),
});

const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  area: text("area").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
});

const works = pgTable("works", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cost: numeric("cost"),
});

const securityLogs = pgTable("security_logs", {
  id: serial("id").primaryKey(),
  reportedBy: integer("reported_by"),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
  schema: { users, payments, reservations, works, securityLogs },
});

function isAdmin(u: { role: string; userType: string }) {
  return u.role === "admin" || u.role === "administrador" || u.userType === "administrador";
}

async function buildAdminContext() {
  const [allUsers, allPayments, allReservations, allWorks, allLogs] = await Promise.all([
    db.select().from(users),
    db.select().from(payments),
    db.select().from(reservations),
    db.select().from(works),
    db.select().from(securityLogs),
  ]);

  const today = new Date();
  const condominos = allUsers.filter((u) => u.userType === "condomino");
  const pending = allPayments.filter((p) => p.status === "pending");
  const overdue = pending.filter((p) => new Date(p.dueDate) < today);
  const pendingTotal = pending.reduce((a, p) => a + parseFloat(p.amount), 0);
  const activeWorks = allWorks.filter((w) => w.status === "in_progress");
  const openLogs = allLogs.filter((l) => l.status === "open");
  const upcoming = allReservations
    .filter((r) => r.status === "approved" && new Date(r.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 15);

  const nameById = new Map(allUsers.map((u) => [u.id, u.name]));

  return `DADOS DO CONDOMINIO (visao de ADMINISTRADOR, tempo real):
- Total de condominos: ${condominos.length}
- Pagamentos pendentes (todos): ${pending.length}, total EUR ${pendingTotal.toFixed(2)}
- Destes, em atraso: ${overdue.length}
- Em atraso por condomino: ${overdue.map((p) => `${nameById.get(p.userId) || "?"} (EUR ${parseFloat(p.amount).toFixed(2)}, ${p.description})`).join("; ") || "nenhum"}
- Obras em curso: ${activeWorks.map((w) => `${w.title} [${w.status}]`).join("; ") || "nenhuma"}
- Ocorrencias abertas: ${openLogs.length}${openLogs.length ? " -> " + openLogs.map((l) => l.description).join("; ") : ""}
- Proximas reservas aprovadas: ${upcoming.map((r) => `${r.area} em ${new Date(r.date).toLocaleDateString("pt-PT")} (${nameById.get(r.userId) || "?"})`).join("; ") || "nenhuma"}`;
}

async function buildCondominoContext(userId: number) {
  const [myPayments, myReservations, allReservations, allWorks, allLogs] = await Promise.all([
    db.select().from(payments).where(eq(payments.userId, userId)),
    db.select().from(reservations).where(eq(reservations.userId, userId)),
    db.select().from(reservations),
    db.select().from(works),
    db.select().from(securityLogs),
  ]);

  const today = new Date();
  const pending = myPayments.filter((p) => p.status === "pending");
  const overdue = pending.filter((p) => new Date(p.dueDate) < today);
  const pendingTotal = pending.reduce((a, p) => a + parseFloat(p.amount), 0);
  const activeWorks = allWorks.filter((w) => w.status === "in_progress");
  const openLogsCount = allLogs.filter((l) => l.status === "open").length;
  const busySlots = allReservations
    .filter((r) => r.status === "approved" && new Date(r.date) >= today)
    .map((r) => `${r.area} em ${new Date(r.date).toLocaleDateString("pt-PT")}`);

  return `DADOS DO CONDOMINIO (visao do PROPRIO condomino, tempo real):
- Os SEUS pagamentos pendentes: ${pending.length}, total EUR ${pendingTotal.toFixed(2)}
- Dos seus, em atraso: ${overdue.length}${overdue.length ? " -> " + overdue.map((p) => `${p.description} (EUR ${parseFloat(p.amount).toFixed(2)})`).join("; ") : ""}
- As SUAS reservas: ${myReservations.length ? myReservations.map((r) => `${r.area} em ${new Date(r.date).toLocaleDateString("pt-PT")} [${r.status}]`).join("; ") : "nenhuma"}
- Obras em curso no edificio: ${activeWorks.map((w) => `${w.title} [${w.status}]`).join("; ") || "nenhuma"}
- Ocorrencias abertas no edificio (contagem): ${openLogsCount}
- Datas/areas ja ocupadas (para planear reservas): ${busySlots.join("; ") || "nenhuma"}`;
}

function systemPrompt(context: string, admin: boolean, name: string) {
  const roleLine = admin
    ? "O utilizador atual e ADMINISTRADOR e pode consultar dados globais do condominio."
    : "O utilizador atual e CONDOMINO. So pode ver os dados DELE PROPRIO e informacao publica do edificio. NUNCA reveles dados, nomes, fracoes, pagamentos, reservas ou contactos de OUTROS condominos, mesmo que peca ou insista.";

  return `Es o SmartCondo IA, assistente da plataforma CondoManager, especializado EXCLUSIVAMENTE em gestao de condominios em Portugal.

O utilizador chama-se ${name}. ${roleLine}

AMBITO PERMITIDO (e so este):
- Legislacao portuguesa de condominios (Lei 8/2022, Codigo Civil art. 1414 a 1438-A, NRAU)
- Regulamento e funcionamento do condominio
- Quotas, pagamentos e pagamentos em atraso
- Reservas de areas comuns
- Obras e manutencao
- Seguranca e ocorrencias
- Direitos e deveres de condominos e administracao

REGRAS OBRIGATORIAS:
- Responde SEMPRE em portugues europeu, de forma profissional e cordial.
- Usa APENAS os dados fornecidos abaixo. Se a informacao nao estiver nos dados, diz que nao tens acesso a esse dado. NUNCA inventes.
- Recusa educadamente qualquer pergunta fora do ambito de condominios (cultura geral, programacao, conselhos pessoais, opinioes, outros temas): "So posso ajudar em assuntos do condominio."
- Mantem sempre linguagem correta e profissional.
${admin ? "" : "- Se te pedirem informacao sobre OUTRO condomino, recusa: essa informacao e privada.\n"}
${context}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages, userId } = req.body;
    if (!messages) return res.status(400).json({ message: "messages em falta" });
    if (!userId) return res.status(401).json({ content: "Sessao invalida. Volte a iniciar sessao." });

    const [user] = await db.select().from(users).where(eq(users.id, Number(userId)));
    if (!user) return res.status(401).json({ content: "Utilizador nao encontrado." });

    if (user.userType === "arrendatario") {
      return res.status(403).json({ content: "O assistente SmartCondo IA esta disponivel apenas para administradores e condominos." });
    }

    const admin = isAdmin(user);
    const context = admin ? await buildAdminContext() : await buildCondominoContext(user.id);
    const sys = systemPrompt(context, admin, user.name);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: sys },
          ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(200).json({ content: `Erro: ${JSON.stringify(data)}` });
    }

    const text = data.choices?.[0]?.message?.content || "Sem resposta.";
    return res.status(200).json({ content: text });
  } catch (err: any) {
    return res.status(200).json({ content: `Erro: ${err.message}` });
  }
}
