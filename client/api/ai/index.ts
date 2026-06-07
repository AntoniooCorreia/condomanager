import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages, context } = req.body;
    if (!messages) return res.status(400).json({ message: "messages em falta" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY nao configurada" });
    }

    const allMessages = [
      {
        role: "user",
        parts: [{ text: `Es o SmartCondo IA, especialista em condominios portugueses. ${context || ""} Responde em portugues europeu.` }]
      },
      { role: "model", parts: [{ text: "Entendido!" }] },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: allMessages }),
    });

    const rawText = await response.text();
    
    if (!response.ok) {
      return res.status(200).json({ content: `Erro Gemini ${response.status}: ${rawText}` });
    }

    const data = JSON.parse(rawText);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    return res.status(200).json({ content: text });
  } catch (err: any) {
    return res.status(200).json({ content: `Erro: ${err.message}` });
  }
}