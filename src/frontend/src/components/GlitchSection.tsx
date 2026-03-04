"use client"
import { useEffect, useRef, ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
  delay?: number  // ms delay before glitch plays
  style?: React.CSSProperties
}

export function GlitchSection({ children, className = "", delay = 0, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("glitch-enter")
            el.style.opacity = "1"
          }, delay)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={className} style={{ opacity: 0, ...style }}>
      {children}
    </div>
  )
}
