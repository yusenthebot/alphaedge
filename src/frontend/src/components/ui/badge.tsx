import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1",
    "overflow-hidden rounded-none",
    "px-1.5 py-0.5",
    "font-mono text-[0.5rem] uppercase tracking-widest",
    "border-2 border-transparent",
    "whitespace-nowrap",
    "transition-all duration-100",
    "[&>svg]:pointer-events-none [&>svg]:size-2.5",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-[var(--pixel-border-dim)] bg-[var(--pixel-surface-2)] text-[var(--pixel-text-dim)]",
        ].join(" "),
        primary: [
          "border-[var(--pixel-border)] bg-[rgba(0,255,65,0.08)] text-[var(--pixel-buy)]",
          "shadow-[0_0_4px_rgba(0,255,65,0.3)]",
        ].join(" "),
        buy: [
          "border-[var(--pixel-buy)] bg-[rgba(0,255,65,0.08)] text-[var(--pixel-buy)]",
          "shadow-[0_0_4px_rgba(0,255,65,0.4)]",
        ].join(" "),
        sell: [
          "border-[var(--pixel-sell)] bg-[rgba(255,49,49,0.08)] text-[var(--pixel-sell)]",
          "shadow-[0_0_4px_rgba(255,49,49,0.4)]",
        ].join(" "),
        hold: [
          "border-[var(--pixel-hold)] bg-[rgba(255,184,0,0.08)] text-[var(--pixel-hold)]",
          "shadow-[0_0_4px_rgba(255,184,0,0.4)]",
        ].join(" "),
        cyan: [
          "border-[var(--pixel-accent)] bg-[rgba(0,255,255,0.08)] text-[var(--pixel-accent)]",
          "shadow-[0_0_4px_rgba(0,255,255,0.3)]",
        ].join(" "),
        secondary: [
          "border-[var(--pixel-border-dim)] bg-[var(--pixel-surface-2)] text-[var(--pixel-text-off)]",
        ].join(" "),
        destructive: [
          "border-[var(--pixel-sell)] bg-[rgba(255,49,49,0.1)] text-[var(--pixel-sell)]",
        ].join(" "),
        outline: [
          "border-[var(--pixel-border-dim)] text-[var(--pixel-text-dim)] bg-transparent",
        ].join(" "),
        ghost: [
          "border-transparent text-[var(--pixel-text-muted)] bg-transparent",
        ].join(" "),
        link: "border-transparent text-[var(--pixel-accent)] underline-offset-2 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
