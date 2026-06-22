'use client'

import { useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2000,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const start = 0
    const increment = value / (duration / 16)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        current = value
        clearInterval(timer)
      }
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, suffix, prefix, duration])

  return (
    <span ref={ref}>
      {prefix}0{suffix}
    </span>
  )
}
