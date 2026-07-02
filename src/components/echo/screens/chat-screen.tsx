"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Plus, LifeBuoy, Volume2, VolumeX, Square, X } from "lucide-react";
import { EchoButton } from "../ui/echo-button";
import { SealStamp } from "../ui/seal-stamp";
import { ModeSelector } from "../ui/mode-selector";
import { TypingIndicator } from "../ui/typing-indicator";
import { MessageBubble } from "../ui/message-bubble";
import { VoiceButton } from "../ui/voice-button";
import { useEcho, daysSince } from "@/lib/echo/store";
import { MODE_META, type EchoMode } from "@/lib/echo/prompts";
import { getVoice } from "@/lib/echo/voice";
import { cn } from "@/lib/utils";

interface SseEvent {
  type: "meta" | "token" | "done" | "error";
  [k: string]: any;
}

async function streamChat(
  body: { message: string; history: any[]; mode: EchoMode; context: any },
  onEvent: (e: SseEvent) => void
) {
  const res = await fetch("/api/echo/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) throw new Error("chat request failed");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        onEvent(JSON.parse(payload));
      } catch {
        /* ignore */
      }
    }
  }
}

export function ChatScreen() {
  const conversations = useEcho((s) => s.conversations);
  const activeId = useEcho((s) => s.activeConversationId);
  const startConversation = useEcho((s) => s.startConversation);
  const addMessage = useEcho((s) => s.addMessage);
  const updateMessage = useEcho((s) => s.updateMessage);
  const mode = useEcho((s) => s.currentMode);
  const setMode = useEcho((s) => s.setMode);
  const setOverlay = useEcho((s) => s.setOverlay);
  const profile = useEcho((s) => s.profile);
  const patterns = useEcho((s) => s.patterns);
  const strengths = useEcho((s) => s.strengths);
  const challenges = useEcho((s) => s.challenges);
  const lastVisit = useEcho((s) => s.lastVisit);
  const diary = useEcho((s) => s.diary);
  const touch = useEcho((s) => s.touch);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showMode, setShowMode] = useState(false);
  const [showTagsFor, setShowTagsFor] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const voiceRef = useRef(getVoice());
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find((c) => c.id === activeId);
  const messages = activeConv?.messages ?? [];
  const meta = MODE_META[mode];

  // ensure there's an active conversation
  useEffect(() => {
    if (!activeId) {
      startConversation(mode);
    }
    touch();
  }, []);

  // auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || typing) return;

      let convId = activeId;
      if (!convId) {
        convId = startConversation(mode);
      }

      addMessage(convId, { role: "user", content });
      // placeholder assistant message (store auto-generates id — we read it back)
      addMessage(convId, { role: "assistant", content: "" });
      const freshConv = useEcho.getState().conversations.find((c) => c.id === convId);
      const assistantMsg = [...(freshConv?.messages ?? [])].reverse().find((m) => m.role === "assistant");
      const assistantId = assistantMsg?.id;
      setInput("");
      setTyping(true);

      const history = (activeConv?.messages ?? []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const context = {
        userName: profile.name || "viajante",
        recentMoods: Object.values(diary)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-7)
          .map((d) => d.mood),
        patterns,
        strengths,
        challenges,
        daysSinceLastVisit: daysSince(lastVisit),
      };

      try {
        let acc = "";
        let crisis = false;
        let tags: string[] = [];
        await streamChat(
          { message: content, history, mode, context },
          (e) => {
            if (e.type === "meta" && e.crisis) crisis = true;
            if (e.type === "token") {
              acc += e.content;
              // update last assistant message
              if (assistantId) updateMessage(convId!, assistantId, { content: acc, crisis });
            }
            if (e.type === "done") {
              tags = e.tags || [];
              crisis = e.crisis || crisis;
              if (assistantId) updateMessage(convId!, assistantId, {
                content: e.full || acc,
                tags,
                crisis,
              });
            }
          }
        );
      } catch (err) {
        // find last assistant msg and set error content
        const conv = useEcho.getState().conversations.find((c) => c.id === convId);
        const lastAssistant = [...(conv?.messages ?? [])].reverse().find((m) => m.role === "assistant");
        if (lastAssistant) {
          updateMessage(convId!, lastAssistant.id, {
            content:
              "Tive um problema pra te responder agora. Não é você, sou eu. Tenta de novo em um instante?",
          });
        }
      } finally {
        setTyping(false);
        // voice
        if (profile.voiceEnabled && voiceRef.current.ttsSupported) {
          const conv = useEcho.getState().conversations.find((c) => c.id === convId);
          const lastAssistant = [...(conv?.messages ?? [])].reverse().find((m) => m.role === "assistant");
          if (lastAssistant?.content) {
            setSpeaking(true);
            voiceRef.current.speak(lastAssistant.content, () => setSpeaking(false));
          }
        }
      }
    },
    [activeId, activeConv, addMessage, startConversation, updateMessage, mode, profile, diary, patterns, strengths, challenges, lastVisit, typing]
  );

  const stopVoice = () => {
    voiceRef.current.stop();
    setSpeaking(false);
  };

  return (
    <div className="flex h-[calc(100dvh-4.75rem)] flex-col">
      {/* chat header */}
      <header className="sticky top-0 z-20 border-b border-white/8 echo-glass">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <button
            onClick={() => startConversation(mode)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition hover:text-foreground"
            aria-label="Nova conversa"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <SealStamp char="回" size={26} rotate={-3} />
              <span className="echo-display text-xl font-semibold tracking-wide">ECHO</span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {meta.label} · <span style={{ color: meta.color }}>{meta.zh}</span>
            </span>
          </div>
          <button
            onClick={() => setShowMode((v) => !v)}
            className={cn(
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition",
              showMode ? "border-white/20 bg-white/8" : "border-white/10 bg-white/5"
            )}
            style={showMode ? { boxShadow: `0 0 0 1px ${meta.color}40` } : undefined}
          >
            <span className="echo-brush text-sm" style={{ color: meta.color }}>
              {meta.zh}
            </span>
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        </div>
        <AnimatePresence>
          {showMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/8"
            >
              <div className="mx-auto max-w-md px-4 py-3">
                <ModeSelector value={mode} onChange={(m) => { setMode(m); setShowMode(false); }} showTagline />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* emergency floating button */}
      <button
        onClick={() => setOverlay("emergency")}
        className="fixed right-4 top-[88px] z-30 flex h-10 items-center gap-1.5 rounded-full border border-[var(--vermillion)]/40 bg-[var(--vermillion)]/15 px-3 text-xs font-medium text-[#E88A7E] backdrop-blur transition hover:bg-[var(--vermillion)]/25"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Emergência
      </button>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto echo-no-scrollbar">
        <div className="mx-auto max-w-md space-y-4 px-4 py-5">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex flex-col items-center gap-3 text-center"
            >
              <SealStamp char={meta.zh} size={64} rotate={-3} />
              <p className="echo-display text-lg font-medium">
                {profile.name ? `${profile.name},` : "Olá,"} o ECHO te escuta.
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                {mode === "apoio" && "Hoje eu to mais perto. Fala o que pesa, sem precisar organizar."}
                {mode === "equilibrio" && "Fala como está. Eu ouço com atenção e, quando fizer sentido, pergunto."}
                {mode === "confronto" && "Hoje eu não vou aliviar o que precisa ser visto. Fala."}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {[
                  "Hoje tá difícil colocar em palavras",
                  "Tô ansioso sem motivo claro",
                  "Briguei com alguém que amo",
                  "Não tô conseguindo dormir",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition hover:border-white/20 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              showTags={showTagsFor === m.id}
              onToggleTags={() => setShowTagsFor((v) => (v === m.id ? null : m.id))}
            />
          ))}

          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/8 bg-card px-4 py-3">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* voice speaking banner */}
      <AnimatePresence>
        {speaking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-auto mb-2 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-[var(--jade)]/30 bg-[var(--jade)]/10 px-4 py-2"
          >
            <div className="flex items-center gap-2 text-sm text-[var(--jade-soft)]">
              <Volume2 className="h-4 w-4" />
              ECHO está falando...
            </div>
            <button onClick={stopVoice} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Square className="h-3 w-3" /> parar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* input */}
      <div className="border-t border-white/8 echo-glass echo-safe-bottom">
        <div className="mx-auto flex max-w-md items-end gap-2 px-3 py-3">
          <VoiceButton
            onTranscript={(text) => {
              if (text) {
                setInput(text);
                inputRef.current?.focus();
              }
            }}
          />
          <div className="flex flex-1 items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.03] px-3 py-2 focus-within:border-white/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Escreve o que tá pesando..."
              rows={1}
              className="echo-no-scrollbar max-h-32 flex-1 resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              style={{ scrollbarWidth: "thin" }}
            />
            {profile.voiceEnabled && (
              <button
                onClick={() => {
                  if (speaking) stopVoice();
                }}
                disabled={!speaking}
                className={cn(
                  "mb-0.5 flex h-8 w-8 items-center justify-center rounded-full transition",
                  speaking ? "text-[var(--jade)]" : "text-muted-foreground/40"
                )}
                aria-label="Voz"
              >
                {speaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
          </div>
          <EchoButton
            variant={input.trim() ? "jade" : "ghost"}
            size="icon"
            disabled={!input.trim() || typing}
            onClick={() => send(input)}
            aria-label="Enviar"
            className="rounded-full"
          >
            <Send className="h-4 w-4" />
          </EchoButton>
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
