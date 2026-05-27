import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { messages, context } = req.body;
    if (!messages) return res.status(400).json({ message: "messages em falta" });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY nao configurada" });
    }

    const systemPrompt = `Es o SmartCondo IA, especialista em condominios portugueses.
${context || ""}
Responde sempre em portugues europeu. Se preciso e profissional.`;

    const geminiMessages = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: "Entendido! Estou pronto para ajudar." }] },
      ...messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: geminiMessages }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ message: "Gemini error", status: response.status, details: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    return res.status(200).json({ content: text });
  } catch (err: any) {
    return res.status(500).json({ message: err.message, stack: err.stack });
  }
}