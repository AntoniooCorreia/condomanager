import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, context } = req.body;
  if (!messages) return res.status(400).json({ message: "messages em falta" });

  const systemPrompt = `Es o SmartCondo IA, um assistente especializado em gestao de condominios portugueses.
Es integrado na plataforma CondoManager e tens acesso aos dados reais do condominio.

ESPECIALIDADES:
- Legislacao portuguesa de condominios (Lei 8/2022, Codigo Civil artigos 1414 a 1438-A, NRAU)
- Regulamento interno do condominio
- Gestao de quotas e pagamentos
- Reservas de areas comuns (piscina, ginasio, salao de festas)
- Obras e manutencao
- Seguranca e ocorrencias
- Direitos e obrigacoes de condominios e arrendatarios

${context || ""}

REGRAS:
- Responde sempre em portugues europeu
- Se preciso, util e profissional
- Quando citares legislacao, indica o artigo correto
- Se nao souberes algo, diz claramente
- Mantem respostas concisas mas completas`;

  try {
    const geminiMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
      }),
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Erro ao gerar resposta.";
    return res.status(200).json({ content: text });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}