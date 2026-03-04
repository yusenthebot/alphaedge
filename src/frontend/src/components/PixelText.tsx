"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PixelTextProps {
  children: React.ReactNode;
  className?: string;
  blink?: boolean;       // blinking cursor at end
  glitch?: boolean;      // glitch on hover
  glow?: boolean;        // green glow
  glowColor?: "green" | "red" | "amber" | "cyan";
  as?: React.ElementType;
  size?: "xs" | "sm" | "md" | "lg";
}

const glowMap = {
  green: "text-shadow-[0_0_6px_rgba(0,255,65,0.8),_0_0_12px_rgba(0,255,65,0.4)]",
  red:   "text-shadow-[0_0_6px_rgba(255,49,49,0.8),_0_0_12px_rgba(255,49,49,0.4)]",
  amber: "text-shadow-[0_0_6px_rgba(255,184,0,0.8),_0_0_12px_rgba(255,184,0,0.4)]",
  cyan:  "text-shadow-[0_0_6px_rgba(0,255,255,0.8),_0_0_12px_rgba(0,255,255,0.4)]",
};

const sizeMap = {
  xs: "text-[0.45rem]",
  sm: "text-[0.55rem]",
  md: "text-[0.65rem]",
  lg: "text-[0.8rem]",
};

export function PixelText({
  children,
  className,
  blink = false,
  glitch = false,
  glow = false,
  glowColor = "green",
  as: Tag = "span",
  size = "sm",
}: PixelTextProps) {
  return (
    <Tag
      className={cn(
        "font-[var(--font-pixel)] uppercase tracking-wide leading-relaxed",
        sizeMap[size],
        glow && "drop-shadow-[0_0_6px_rgba(0,255,65,0.8)]",
        glowMap[glowColor],
        glitch && "glitch",
        blink && "cursor-blink",
        className
      )}
    >
      {children}
    </Tag>
  );
}

/** Terminal-style line with prompt prefix */
export function TerminalLine({
  children,
  prompt = ">",
  className,
  dim = false,
}: {
  children: React.ReactNode;
  prompt?: string;
  className?: string;
  dim?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 font-mono text-[0.65rem] leading-relaxed",
        dim ? "text-[var(--pixel-text-off)]" : "text-[var(--pixel-text)]",
        className
      )}
    >
      <span className="text-[var(--pixel-border)] shrink-0 select-none">{prompt}</span>
      <span>{children}</span>
    </div>
  );
}

/** ASCII section header */
export function PixelSectionHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 mb-4",
        className
      )}
    >
      <span className="text-[var(--pixel-border-mid)] font-mono text-[0.6rem] select-none">
        ══
      </span>
      <h2
        className="font-[var(--font-pixel)] text-[0.5rem] uppercase tracking-widest text-[var(--pixel-text)] drop-shadow-[0_0_4px_rgba(0,255,65,0.5)]"
      >
        {children}
      </h2>
      <div className="flex-1 h-px bg-[var(--pixel-border-dim)]" />
    </div>
  );
}

/** Typing animation text */
export function TypewriterText({
  text,
  className,
  speed = 50,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [displayed, setDisplayed] = React.useState("");

  React.useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span
      className={cn(
        "font-mono text-[var(--pixel-text)] cursor-blink",
        className
      )}
    >
      {displayed}
    </span>
  );
}
