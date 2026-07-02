"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "gold" | "vermillion" | "jade";
type Size = "sm" | "md" | "lg" | "icon";

const variantCls: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 echo-glow-jade",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  ghost: "hover:bg-white/5 text-foreground",
  outline:
    "border border-white/15 bg-transparent hover:bg-white/5 text-foreground",
  gold: "bg-gradient-to-br from-[#D4B062] to-[#C8895A] text-[#1A1408] hover:brightness-110 echo-glow-gold",
  vermillion:
    "bg-gradient-to-br from-[#C84B3F] to-[#A8362C] text-[#F4F1EA] hover:brightness-110 echo-glow-vermillion",
  jade: "bg-gradient-to-br from-[#4A9D7C] to-[#2D7A5F] text-[#06140E] hover:brightness-110 echo-glow-jade",
};

const sizeCls: Record<Size, string> = {
  sm: "h-9 px-3 text-xs gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-2xl",
  lg: "h-14 px-7 text-base gap-2.5 rounded-2xl",
  icon: "h-11 w-11 rounded-2xl",
};

export interface EchoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const EchoButton = React.forwardRef<HTMLButtonElement, EchoButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        variantCls[variant],
        sizeCls[size],
        className
      )}
      {...props}
    />
  )
);
EchoButton.displayName = "EchoButton";
