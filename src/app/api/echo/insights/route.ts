import { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zaiPromise = ZAI.create();

interface Req {
  userName: string;
  diary: { date: string; mood: number; anxiety: number; energy: number; sleep: number; stress: number; note: string }[];
  recentConversations: { summary?: string; messages: { role: string; content: string }[] }[];
  patterns: string[];
}

export async function POST(req: NextRequest) {
  let body: Req;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const { userName, diary, recentConversations, patterns } = body;

  const diarySummary = diary
    .slice(-14)
    .map(
      (d) =>
        `${d.date}: humor ${d.mood}/5, ansiedade ${d.anxiety}/10, energia ${d.energy}/10, sono ${d.sleep}/10, estresse ${d.stress}/10. nota: "${d.note || "—"}"`
    )
    .join("\n");

  const convSnippets = recentConversations
    .slice(0, 6)
    .map((c, i) => `Conversa ${i + 1}: ${(c.summary || c.messages.map((m) => m.content).join(" ")).slice(0, 280)}`)
    .join("\n");

  const prompt = `Você é o ECHO analisando o histórico emocional de ${userName}. Gere de 2 a 4 insights curtos, sinceros, em português brasileiro. Cada insight deve ser uma frase única, observação real (não genérica), tipo:
- "Você costuma ficar mais pesado aos domingos — vale olhar o que o domingo desperta."
- "Toda vez que você cita sono ruim, a ansiedade do dia seguinte sobe. Causa e efeito?"

Dados:
PADRÕES JÁ CONHECIDOS: ${patterns.join("; ") || "—"}

DIÁRIO (últimos 14 dias):
${diarySummary || "—"}

CONVERSAS RECENTES:
${convSnippets || "—"}

Retorne APENAS um array JSON de strings, cada uma um insight. Sem texto fora do array. Exemplo: ["insight 1", "insight 2"].`;

  try {
    const zai = await zaiPromise;
    const c = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: "Você é um analista emocional que responde só com JSON." },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });
    const raw = c.choices[0]?.message?.content?.trim() ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(match ? match[0] : "[]");
    if (!Array.isArray(arr)) return Response.json({ insights: [] });
    return Response.json({
      insights: arr.filter((s) => typeof s === "string").slice(0, 4).map((content: string, i: number) => ({
        content,
        type: i === 0 ? "pattern" : i === 1 ? "observation" : "win",
      })),
    });
  } catch (err: any) {
    return Response.json({ insights: [], error: err?.message }, { status: 500 });
  }
}
