import { NextRequest } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import {
  buildSystemPrompt,
  buildTagExtractionPrompt,
  detectCrisis,
  type EchoContext,
  type EchoMode,
  type EmotionTag,
  EMOTION_TAGS,
} from "@/lib/echo/prompts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatReq {
  message: string;
  history: { role: "user" | "assistant"; content: string }[];
  mode: EchoMode;
  context: EchoContext;
}

const zaiPromise = ZAI.create();

/** Tenta extrair array JSON de tags emocionais. */
async function extractTags(message: string): Promise<EmotionTag[]> {
  try {
    const zai = await zaiPromise;
    const c = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: "Você é um classificador de emoções. Responde só com JSON." },
        { role: "user", content: buildTagExtractionPrompt(message) },
      ],
      thinking: { type: "disabled" },
    });
    const raw = c.choices[0]?.message?.content?.trim() ?? "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const arr = JSON.parse(match ? match[0] : "[]");
    if (!Array.isArray(arr)) return [];
    return arr.filter((t) => EMOTION_TAGS.includes(t)).slice(0, 4) as EmotionTag[];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  let body: ChatReq;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid json" }), { status: 400 });
  }

  const { message, history, mode, context } = body;
  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "message required" }), { status: 400 });
  }

  const crisis = detectCrisis(message);

  // Build message list for the model
  const systemPrompt = buildSystemPrompt(mode, context);
  const messages: { role: "assistant" | "user"; content: string }[] = [
    { role: "assistant", content: systemPrompt },
    ...history.slice(-12).map((h) => ({
      role: h.role === "user" ? ("user" as const) : ("assistant" as const),
      content: h.content,
    })),
    { role: "user", content: message },
  ];

  const encoder = new TextEncoder();

  // Send a header event with crisis flag first
  const header = `data: ${JSON.stringify({ type: "meta", crisis })}\n\n`;

  // Extract tags in parallel (fire and forget — sent later)
  const tagsPromise = extractTags(message);

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode(header));
      try {
        const zai = await zaiPromise;
        const completion = await zai.chat.completions.create({
          messages,
          thinking: { type: "disabled" },
        });
        const full = completion.choices[0]?.message?.content ?? "";

        // typewriter streaming for the streaming UX
        const tokens = full.match(/\S+\s*/g) ?? [full];
        for (const tk of tokens) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "token", content: tk })}\n\n`)
          );
          // small delay between tokens
          await new Promise((r) => setTimeout(r, 18));
        }

        // crisis handling: if crisis detected, append care message
        let finalText = full;
        if (crisis) {
          const care =
            "\n\n— — —\nMeu bem, o que você está sentindo merece cuidado agora. Você não está sozinho. O CVV atende grátis 24h no número **188**. Se quiser, abre a tela de Emergência aqui do app — tem técnicas de respiração e contatos.";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "token", content: care })}\n\n`)
          );
          finalText += care;
        }

        const tags = await tagsPromise;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", tags, crisis, full: finalText })}\n\n`
          )
        );
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: err?.message ?? "unknown" })}\n\n`
          )
        );
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
