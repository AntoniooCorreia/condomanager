import type { VercelRequest, VercelResponse } from "@vercel/node";
import { drizzle } from "drizzle-orm/node-postgres";
import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import pkg from "pg";
import { eq } from "drizzle-orm";
import { extractText, getDocumentProxy } from "unpdf";

const { Pool } = pkg;

const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("geral"),
  fileUrl: text("file_url"),
  content: text("content"),
  summary: text("summary"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  visibility: text("visibility").notNull().default("todos"),
  visibleUserIds: integer("visible_user_ids").array(),
});

const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), { schema: { documents } });

async function extractPdfText(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Nao foi possivel obter o ficheiro.");
  const buffer = new Uint8Array(await resp.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const { text: pdfText } = await extractText(pdf, { mergePages: true });
  return (Array.isArray(pdfText) ? pdfText.join("\n") : pdfText) || "";
}

async function generateSummary(sourceText: string): Promise<string> {
  const prompt = `Resume o seguinte documento de um condominio em portugues europeu, em cerca de 6 paragrafos claros e bem organizados. Cobre, pela ordem adequada: de que trata o documento; os pontos principais; decisoes, regras ou obrigacoes relevantes; prazos, datas ou valores se existirem; e as implicacoes praticas para condominos ou arrendatarios. Escreve em texto corrido e profissional, sem listas e sem inventar nada que nao esteja no documento.\n\nDOCUMENTO:\n${sourceText.slice(0, 12000)}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1200,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error("Falha no servico de IA.");
  return data.choices?.[0]?.message?.content || "";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id ? Number(req.query.id) : null;
  const action = req.query.action;

  // Acao especial: gerar/obter o resumo de um documento (le o PDF ou usa o conteudo escrito)
  if (req.method === "POST" && action === "resumo") {
    try {
      const docId = Number(req.body?.id);
      if (!docId) return res.status(400).json({ message: "id em falta" });
      const [doc] = await db.select().from(documents).where(eq(documents.id, docId));
      if (!doc) return res.status(404).json({ message: "Documento nao encontrado." });
      if (doc.summary) return res.status(200).json({ summary: doc.summary });

      let sourceText = "";
      const original = (doc.content || "").split("---RESUMO AUTOMATICO (IA)---")[0].trim();
      if (original) {
        sourceText = original;
      } else if (doc.fileUrl && /\.pdf(\?|$)/i.test(doc.fileUrl)) {
        sourceText = await extractPdfText(doc.fileUrl);
      }

      if (!sourceText.trim()) {
        return res.status(200).json({ message: "Este documento nao tem texto legivel para resumir (o ficheiro pode estar digitalizado como imagem)." });
      }

      const summary = await generateSummary(sourceText);
      if (!summary.trim()) return res.status(200).json({ message: "Nao foi possivel gerar o resumo." });

      await db.update(documents).set({ summary }).where(eq(documents.id, docId));
      return res.status(200).json({ summary });
    } catch (err: any) {
      return res.status(200).json({ message: "Erro ao gerar o resumo: " + err.message });
    }
  }

  if (req.method === "GET") {
    const all = await db.select().from(documents);
    return res.status(200).json(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
  if (req.method === "POST") {
    const { title, description, category, fileUrl, content, createdBy, visibility, visibleUserIds } = req.body;
    const [created] = await db.insert(documents).values({
      title, description, category: category || "geral", fileUrl, content,
      createdBy: createdBy ? Number(createdBy) : null,
      visibility: visibility || "todos",
      visibleUserIds: visibleUserIds || [],
    }).returning();
    return res.status(201).json(created);
  }
  if (req.method === "DELETE" && id) {
    await db.delete(documents).where(eq(documents.id, id));
    return res.status(204).end();
  }
  return res.status(405).end();
}
