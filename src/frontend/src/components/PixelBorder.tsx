"use client";

import React from "react";
import { cn } from "@/lib/utils";

type PixelBorderVariant = "green" | "red" | "amber" | "cyan" | "dim";

interface PixelBorderProps {
  children: React.ReactNode;
  className?: string;
  variant?: PixelBorderVariant;
  glow?: boolean;
  hover?: boolean;
}

const variantStyles: Record<PixelBorderVariant, { border: string; corner: string; glow: string }> = {
  green: {
    border: "border-[var(--pixel-border)]",
    corner: "before:border-[var(--pixel-border)] after:border-[var(--pixel-border)]",
    glow: "shadow-[var(--pixel-glow-green)]",
  },
  red: {
    border: "border-[var(--pixel-sell)]",
    corner: "before:border-[var(--pixel-sell)] after:border-[var(--pixel-sell)]",
    glow: "shadow-[var(--pixel-glow-red)]",
  },
  amber: {
    border: "border-[var(--pixel-hold)]",
    corner: "before:border-[var(--pixel-hold)] after:border-[var(--pixel-hold)]",
    glow: "shadow-[var(--pixel-glow-amber)]",
  },
  cyan: {
    border: "border-[var(--pixel-accent)]",
    corner: "before:border-[var(--pixel-accent)] after:border-[var(--pixel-accent)]",
    glow: "shadow-[var(--pixel-glow-cyan)]",
  },
  dim: {
    border: "border-[var(--pixel-border-dim)]",
    corner: "before:border-[var(--pixel-border-dim)] after:border-[var(--pixel-border-dim)]",
    glow: "",
  },
};

export function PixelBorder({
  children,
  className,
  variant = "green",
  glow = false,
  hover = false,
}: PixelBorderProps) {
  const v = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative border-2 rounded-none bg-[var(--pixel-surface)]",
        v.border,
        glow && v.glow,
        hover && "transition-all duration-150 hover:shadow-[var(--pixel-glow-green)]",
        // Corner accent marks
        "before:absolute before:top-[-3px] before:left-[-3px] before:w-3 before:h-3 before:border-t-2 before:border-l-2 before:pointer-events-none",
        "after:absolute after:bottom-[-3px] after:right-[-3px] after:w-3 after:h-3 after:border-b-2 after:border-r-2 after:pointer-events-none",
        v.corner,
        className
      )}
    >
      {children}
    </div>
  );
}

/** Inline bracket wrapper: [ children ] */
export function PixelBrackets({
  children,
  className,
  color = "var(--pixel-text-dim)",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span style={{ color, fontFamily: "var(--font-mono)", opacity: 0.7 }}>[</span>
      {children}
      <span style={{ color, fontFamily: "var(--font-mono)", opacity: 0.7 }}>]</span>
    </span>
  );
}
