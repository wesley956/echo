"use client";

import { cn } from "@/lib/utils";

/** Três pontos pulsando — indicador de digitação do ECHO. */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label="ECHO está escrevendo">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="echo-dot h-2 w-2 rounded-full bg-[var(--gold)]"
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </div>
  );
}
