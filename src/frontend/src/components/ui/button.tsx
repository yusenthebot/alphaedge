import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: pixel art button — no radius, uppercase mono font, sharp borders
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "font-mono text-xs uppercase tracking-widest",
    "border-2 border-[var(--pixel-border-dim)]",
    "bg-transparent text-[var(--pixel-text-dim)]",
    "rounded-none",
    "transition-all duration-100",
    "cursor-pointer select-none",
    "outline-none focus-visible:border-[var(--pixel-border)] focus-visible:shadow-[var(--pixel-glow-green)]",
    "disabled:pointer-events-none disabled:opacity-30",
    "active:translate-x-[1px] active:translate-y-[1px]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-[var(--pixel-border-dim)] text-[var(--pixel-text-dim)]",
          "hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)] hover:shadow-[var(--pixel-glow-green)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        primary: [
          "border-[var(--pixel-border)] text-[var(--pixel-text)] bg-transparent",
          "hover:bg-[var(--pixel-border)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-green)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        buy: [
          "border-[var(--pixel-buy)] text-[var(--pixel-buy)]",
          "hover:bg-[var(--pixel-buy)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-green)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        sell: [
          "border-[var(--pixel-sell)] text-[var(--pixel-sell)]",
          "hover:bg-[var(--pixel-sell)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-red)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        hold: [
          "border-[var(--pixel-hold)] text-[var(--pixel-hold)]",
          "hover:bg-[var(--pixel-hold)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-amber)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        cyan: [
          "border-[var(--pixel-accent)] text-[var(--pixel-accent)]",
          "hover:bg-[var(--pixel-accent)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-cyan)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        ghost: [
          "border-transparent text-[var(--pixel-text-muted)]",
          "hover:border-[var(--pixel-border-dim)] hover:text-[var(--pixel-text-off)]",
        ].join(" "),
        destructive: [
          "border-[var(--pixel-sell)] text-[var(--pixel-sell)]",
          "hover:bg-[var(--pixel-sell)] hover:text-[var(--pixel-bg)] hover:shadow-[var(--pixel-glow-red)]",
          "hover:-translate-x-[1px] hover:-translate-y-[1px]",
        ].join(" "),
        outline: [
          "border-[var(--pixel-border-dim)] text-[var(--pixel-text-dim)]",
          "hover:border-[var(--pixel-border)] hover:text-[var(--pixel-text)] hover:shadow-[var(--pixel-glow-green)]",
        ].join(" "),
        secondary: [
          "border-[var(--pixel-border-dim)] text-[var(--pixel-text-dim)] bg-[var(--pixel-surface-2)]",
          "hover:border-[var(--pixel-border-mid)] hover:text-[var(--pixel-text)]",
        ].join(" "),
        link: "border-transparent text-[var(--pixel-accent)] underline-offset-4 hover:underline hover:text-[var(--pixel-border)]",
      },
      size: {
        default: "h-8 px-4 py-1.5 text-[0.55rem]",
        xs:      "h-6 px-2 py-1 text-[0.45rem] gap-1",
        sm:      "h-7 px-3 py-1 text-[0.5rem]",
        lg:      "h-10 px-6 py-2 text-[0.6rem]",
        xl:      "h-12 px-8 py-2.5 text-[0.65rem]",
        icon:    "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
