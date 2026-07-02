"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EchoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  filigree?: boolean;
  glow?: "jade" | "copper" | "gold" | "vermillion" | null;
  glass?: boolean;
}

export const EchoCard = React.forwardRef<HTMLDivElement, EchoCardProps>(
  ({ className, filigree = false, glow = null, glass = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-2xl border border-white/8 bg-card p-5",
        glass && "echo-glass",
        filigree && "echo-filigree",
        glow === "jade" && "echo-glow-jade",
        glow === "copper" && "echo-glow-copper",
        glow === "gold" && "echo-glow-gold",
        glow === "vermillion" && "echo-glow-vermillion",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
EchoCard.displayName = "EchoCard";

export function EchoCardHeader({
  title,
  subtitle,
  icon,
  accent,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  accent?: "jade" | "copper" | "gold" | "vermillion";
  right?: React.ReactNode;
}) {
  const accentCls = {
    jade: "text-[var(--jade)]",
    copper: "text-[var(--copper)]",
    gold: "text-[var(--gold)]",
    vermillion: "text-[var(--vermillion)]",
  };
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div
            className={cn(
              "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5",
              accent && accentCls[accent]
            )}
          >
            {icon}
          </div>
        )}
        <div>
          <h3 className="echo-display text-lg font-semibold leading-tight text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}
