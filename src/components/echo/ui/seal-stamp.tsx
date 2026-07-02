"use client";

import { cn } from "@/lib/utils";

/** Selo vermelho wuxia com caractere de pincel. */
export function SealStamp({
  char,
  size = 44,
  className,
  rotate = -4,
}: {
  char: string;
  size?: number;
  className?: string;
  rotate?: number;
}) {
  return (
    <span
      className={cn("echo-seal inline-flex select-none", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        transform: `rotate(${rotate}deg)`,
      }}
      aria-hidden
    >
      {char}
    </span>
  );
}
