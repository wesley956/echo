import { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const zaiPromise = ZAI.create();

interface Req {
  userName: string;
  patterns: string[];
  challenges: string[];
  strengths: string[];
}

export async function POST(req: NextRequest) {
  let body: Req;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const prompt = `Você é o ECHO sugerindo metas emocionais curtas e possíveis para ${body.userName}. As metas devem ser pequenas (1 a 2 semanas), concretas, em português brasileiro, ligadas ao perfil emocional da pessoa.

PERFIL:
- Padrões: ${body.patterns.join("; ") || "—"}
- Desafios: ${body.challenges.join("; ") || "—"}
- Fortalezas: ${body.strengths.join("; ") || "—"}

Gere 3 metas. Cada meta com: title (curto), description (1 frase, com tom de cultivador wuxia brasileiro — tipo "O cultivador afia a lâmina todo dia."), target_date (YYYY-MM-DD, entre 5 e 14 dias a partir de hoje ${new Date().toISOString().slice(0, 10)}).

Retorne APENAS um array JSON: [{"title":"","description":"","target_date":""}]. Sem texto extra.`;

  try {
    const zai = await zaiPromise;
    const c = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: "Você é um coach emocional. Responde só com JSON." },
        { role: "user", content: prompt },
      ],
      thinking: { type: "disabled" },
    });
    const raw = c.choices[0]?.message?.content?.trim() ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(match ? match[0] : "[]");
    if (!Array.isArray(arr)) return Response.json({ goals: [] });
    return Response.json({
      goals: arr
        .filter((g: any) => g && typeof g.title === "string")
        .slice(0, 3)
        .map((g: any) => ({
          title: String(g.title).slice(0, 80),
          description: String(g.description || "").slice(0, 180),
          targetDate: typeof g.target_date === "string" ? g.target_date : undefined,
        })),
    });
  } catch (err: any) {
    return Response.json({ goals: [], error: err?.message }, { status: 500 });
  }
}
