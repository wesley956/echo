"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MODE_META, type EchoMode } from "@/lib/echo/prompts";
import { Leaf, Compass, Sword } from "lucide-react";

const ICONS = { leaf: Leaf, compass: Compass, sword: Sword };

export function ModeSelector({
  value,
  onChange,
  className,
  showTagline = false,
}: {
  value: EchoMode;
  onChange: (m: EchoMode) => void;
  className?: string;
  showTagline?: boolean;
}) {
  const modes: EchoMode[] = ["apoio", "equilibrio", "confronto"];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex gap-1.5 rounded-2xl border border-white/8 bg-white/[0.02] p-1">
        {modes.map((m) => {
          const meta = MODE_META[m];
          const Icon = ICONS[meta.icon as keyof typeof ICONS];
          const active = value === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-xl bg-white/8"
                  style={{ boxShadow: `0 0 0 1px ${meta.color}40` }}
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {Icon && <Icon className="h-3.5 w-3.5" style={{ color: active ? meta.color : undefined }} />}
                <span className="echo-brush text-sm" style={{ color: active ? meta.color : undefined }}>
                  {meta.zh}
                </span>
                <span>{meta.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      {showTagline && (
        <p className="px-1 text-center text-[11px] text-muted-foreground">
          {MODE_META[value].tagline}
        </p>
      )}
    </div>
  );
}
