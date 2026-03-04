"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ProgressColor = "green" | "red" | "amber" | "cyan";

interface PixelProgressProps {
  value: number;       // 0-100
  color?: ProgressColor;
  label?: string;
  blocks?: number;     // number of blocks (default 20)
  className?: string;
  showValue?: boolean;
  animate?: boolean;
}

const colorMap: Record<ProgressColor, { fill: string; empty: string; glow: string; text: string }> = {
  green: {
    fill: "#00FF41",
    empty: "rgba(0,255,65,0.08)",
    glow: "0 0 4px rgba(0,255,65,0.6), 0 0 8px rgba(0,255,65,0.2)",
    text: "#00FF41",
  },
  red: {
    fill: "#FF3131",
    empty: "rgba(255,49,49,0.08)",
    glow: "0 0 4px rgba(255,49,49,0.6), 0 0 8px rgba(255,49,49,0.2)",
    text: "#FF3131",
  },
  amber: {
    fill: "#FFB800",
    empty: "rgba(255,184,0,0.08)",
    glow: "0 0 4px rgba(255,184,0,0.6), 0 0 8px rgba(255,184,0,0.2)",
    text: "#FFB800",
  },
  cyan: {
    fill: "#00FFFF",
    empty: "rgba(0,255,255,0.08)",
    glow: "0 0 4px rgba(0,255,255,0.6), 0 0 8px rgba(0,255,255,0.2)",
    text: "#00FFFF",
  },
};

export function PixelProgress({
  value,
  color = "green",
  label,
  blocks = 20,
  className,
  showValue = true,
  animate = false,
}: PixelProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const filledCount = Math.round((clamped / 100) * blocks);
  const c = colorMap[color];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span
              className="pixel-label"
              style={{ fontSize: "0.5rem", color: "var(--pixel-text-off)" }}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              className="pixel-data tabular-nums"
              style={{ fontSize: "0.6rem", color: c.text, marginLeft: "auto" }}
            >
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      {/* Block bar */}
      <div
        className="flex gap-px"
        style={{ border: `1px solid ${c.fill}20`, padding: "2px", background: "rgba(0,0,0,0.4)" }}
      >
        {Array.from({ length: blocks }).map((_, i) => {
          const filled = i < filledCount;
          return (
            <div
              key={i}
              className={cn(
                "flex-1 h-2 transition-all duration-100",
                animate && filled && "animate-pulse"
              )}
              style={{
                background: filled ? c.fill : c.empty,
                boxShadow: filled ? c.glow : "none",
                minWidth: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/** Signal strength bar specifically styled for BUY/HOLD/SELL */
export function SignalStrengthBar({
  value,
  signal,
  className,
}: {
  value: number;
  signal: "BUY" | "HOLD" | "SELL";
  className?: string;
}) {
  const colorMap2: Record<"BUY" | "HOLD" | "SELL", ProgressColor> = {
    BUY: "green",
    HOLD: "amber",
    SELL: "red",
  };

  return (
    <PixelProgress
      value={value}
      color={colorMap2[signal]}
      blocks={16}
      showValue
      className={className}
    />
  );
}
