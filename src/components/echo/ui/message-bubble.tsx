"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EchoChip } from "./echo-chip";
import type { EchoMessage } from "@/lib/echo/store";

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  showTags,
  onToggleTags,
}: {
  message: EchoMessage;
  showTags?: boolean;
  onToggleTags?: () => void;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        {!isUser && (
          <div className="mb-0.5 flex items-center gap-1.5 pl-1">
            <span className="echo-brush text-sm text-[var(--gold)]">回</span>
            <span className="echo-display text-xs font-medium tracking-wider text-[var(--gold-soft)]">
              ECHO
            </span>
          </div>
        )}
        <div
          onContextMenu={(e) => {
            if (!isUser && onToggleTags) {
              e.preventDefault();
              onToggleTags();
            }
          }}
          className={cn(
            "relative whitespace-pre-wrap break-words px-4 py-2.5 text-[15px] leading-relaxed",
            isUser
              ? "rounded-2xl rounded-br-md bg-gradient-to-br from-[var(--jade)] to-[#2D7A5F] text-[#06140E]"
              : "rounded-2xl rounded-bl-md border border-white/8 bg-card text-foreground"
          )}
        >
          {message.content}
          {message.crisis && (
            <span className="mt-2 block border-t border-white/10 pt-2 text-xs text-[#E88A7E]">
              ⚠ Sinais de crise detectados. Veja a tela de Emergência.
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-muted-foreground">{fmtTime(message.createdAt)}</span>
          {showTags && message.tags && message.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {message.tags.map((t) => (
                <EchoChip key={t} tone="gold">
                  {t}
                </EchoChip>
              ))}
            </div>
          )}
          {!isUser && onToggleTags && (
            <button
              onClick={onToggleTags}
              className="text-[10px] text-muted-foreground/60 hover:text-muted-foreground"
            >
              {showTags ? "ocultar tags" : "ver tags"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
