import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
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
- Mantem respostas concisas mas completas`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
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