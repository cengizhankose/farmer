import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number | string
  duration?: number
}

export default function CountUp({ value, duration = 350 }: CountUpProps) {
  const [currentValue, setCurrentValue] = useState(0)
  const requestRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const numericValue = typeof value === 'number' ? value : parseInt(value) || 0

  useEffect(() => {
    if (typeof value !== 'number' && isNaN(numericValue)) {
      setCurrentValue(0)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)

      // EaseOutQuad function
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(progress)

      setCurrentValue(Math.floor(numericValue * easedProgress))

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentValue(numericValue)
      }
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [numericValue, duration, value])

  return (
    <span className="tabular-nums">
      {typeof value === 'number' || !isNaN(numericValue) ? currentValue : value}
    </span>
  )
}
