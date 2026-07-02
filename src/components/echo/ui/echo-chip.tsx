"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EchoChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: "jade" | "copper" | "gold" | "vermillion" | "mist" | "muted";
  active?: boolean;
}

const toneCls: Record<NonNullable<EchoChipProps["tone"]>, string> = {
  jade: "bg-[var(--jade)]/12 text-[var(--jade-soft)] border-[var(--jade)]/25",
  copper:
    "bg-[var(--copper)]/12 text-[var(--copper-soft)] border-[var(--copper)]/25",
  gold: "bg-[var(--gold)]/12 text-[var(--gold-soft)] border-[var(--gold)]/25",
  vermillion:
    "bg-[var(--vermillion)]/14 text-[#E88A7E] border-[var(--vermillion)]/30",
  mist: "bg-[var(--mist)]/12 text-[#9BB3D1] border-[var(--mist)]/25",
  muted: "bg-white/5 text-muted-foreground border-white/10",
};

export function EchoChip({
  className,
  tone = "muted",
  active,
  children,
  ...props
}: EchoChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight transition-colors",
        toneCls[tone],
        active && "ring-1 ring-white/20",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
