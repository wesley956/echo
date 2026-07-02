"use client";

import { motion } from "framer-motion";
import { Home, MessageCircle, BookOpenText, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEcho, type ScreenTab } from "@/lib/echo/store";

const TABS: { id: ScreenTab; label: string; zh: string; icon: typeof Home; color: string }[] = [
  { id: "home", label: "Início", zh: "家", icon: Home, color: "var(--jade)" },
  { id: "chat", label: "Conversa", zh: "話", icon: MessageCircle, color: "var(--gold)" },
  { id: "diary", label: "Diário", zh: "記", icon: BookOpenText, color: "var(--copper)" },
  { id: "insights", label: "Insights", zh: "觀", icon: Sparkles, color: "var(--mist)" },
  { id: "profile", label: "Perfil", zh: "我", icon: UserRound, color: "var(--vermillion)" },
];

export function BottomNav() {
  const tab = useEcho((s) => s.tab);
  const setTab = useEcho((s) => s.setTab);

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center echo-safe-bottom">
      <div className="pointer-events-auto mb-3 mx-3 flex w-full max-w-md items-center justify-between gap-1 rounded-2xl border border-white/10 echo-glass px-2 py-1.5 shadow-2xl shadow-black/40">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors"
              aria-label={t.label}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-white/8"
                  style={{ boxShadow: `0 0 0 1px ${t.color}40` }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center">
                <Icon
                  className="h-5 w-5 transition-colors"
                  style={{ color: active ? t.color : "var(--muted-foreground)" }}
                />
                <span
                  className="echo-brush mt-0.5 text-[10px] leading-none"
                  style={{ color: active ? t.color : "transparent" }}
                >
                  {t.zh}
                </span>
                <span
                  className={cn(
                    "mt-0.5 text-[9px] leading-none transition-colors",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {t.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
