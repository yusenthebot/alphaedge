"use client"
import { useEffect, useRef, ReactNode } from "react"

interface Props {
  children: ReactNode
  direction?: "up" | "left" | "right"
  className?: string
  delay?: number
  stagger?: boolean
  style?: React.CSSProperties
}

export function ScrollReveal({ children, direction = "up", className = "", delay = 0, stagger = false, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const dirClass = `scroll-reveal-${direction}`
    el.classList.add(dirClass)
    if (stagger) el.classList.add("stagger-children")

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add("revealed"), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [direction, delay, stagger])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
