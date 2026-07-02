"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOODS = [
  { value: 5, emoji: "😄", label: "Excelente", color: "#4A9D7C" },
  { value: 4, emoji: "🙂", label: "Bem", color: "#D4B062" },
  { value: 3, emoji: "😐", label: "Neutro", color: "#5B7BA6" },
  { value: 2, emoji: "🙁", label: "Mal", color: "#C8895A" },
  { value: 1, emoji: "😢", label: "Muito mal", color: "#C84B3F" },
];

export function MoodPicker({
  value,
  onChange,
  className,
  compact = false,
}: {
  value?: number;
  onChange: (v: number) => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-1.5", className)}>
      {MOODS.map((m) => {
        const active = value === m.value;
        return (
          <motion.button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08, y: -2 }}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-2xl border py-2 transition-all",
              compact ? "px-1" : "px-2",
              active
                ? "border-white/25 bg-white/8"
                : "border-transparent bg-white/[0.02] hover:bg-white/5"
            )}
            style={
              active
                ? { boxShadow: `0 0 0 1px ${m.color}55, 0 0 24px -6px ${m.color}66` }
                : undefined
            }
          >
            <span className={cn(compact ? "text-xl" : "text-2xl")}>{m.emoji}</span>
            {!compact && (
              <span
                className={cn(
                  "text-[10px] leading-none",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {m.label}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { MOODS };
