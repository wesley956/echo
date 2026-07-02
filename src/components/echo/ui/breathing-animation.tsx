"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Phase = "inhale" | "hold" | "exhale";

const CYCLE: { phase: Phase; duration: number; label: string; scale: number }[] = [
  { phase: "inhale", duration: 4, label: "Inspire", scale: 1.25 },
  { phase: "hold", duration: 7, label: "Segure", scale: 1.25 },
  { phase: "exhale", duration: 8, label: "Solte", scale: 0.7 },
];

export function BreathingAnimation({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const current = CYCLE[step];

  useEffect(() => {
    const t = setTimeout(() => setStep((s) => (s + 1) % CYCLE.length), current.duration * 1000);
    return () => clearTimeout(t);
  }, [step, current.duration]);

  const color =
    current.phase === "inhale"
      ? "var(--jade)"
      : current.phase === "hold"
        ? "var(--gold)"
        : "var(--mist)";

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 py-4", className)}>
      <div className="relative flex h-56 w-56 items-center justify-center">
        {/* ripples */}
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border"
            style={{ borderColor: `${color}40`, width: 180, height: 180 }}
            animate={{ scale: [0.8, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" }}
          />
        ))}
        <motion.div
          className="flex h-40 w-40 items-center justify-center rounded-full"
          animate={{ scale: current.scale }}
          transition={{ duration: current.duration, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(circle at 35% 30%, ${color}55, ${color}22 60%, transparent 75%)`,
            boxShadow: `0 0 60px -10px ${color}88, inset 0 0 40px -10px ${color}55`,
            border: `1px solid ${color}40`,
          }}
        >
          <div className="text-center">
            <div className="echo-display text-2xl font-medium" style={{ color }}>
              {current.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{current.duration}s</div>
          </div>
        </motion.div>
      </div>
      <div className="flex gap-2">
        {CYCLE.map((c, i) => (
          <div
            key={c.phase}
            className={cn(
              "h-1 rounded-full transition-all",
              i === step ? "w-8 bg-[var(--gold)]" : "w-3 bg-white/15"
            )}
          />
        ))}
      </div>
      <p className="max-w-xs text-center text-xs text-muted-foreground">
        Técnica 4-7-8. Inspire pelo narho em 4 tempos. Segure em 7. Solte pela boca em 8.
      </p>
    </div>
  );
}
