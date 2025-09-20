"use client";

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

interface BackgroundFxProps {
  play: boolean
}

export default function BackgroundFx({ play }: BackgroundFxProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2

          const moveX = ((mousePosition.x - centerX) / rect.width) * 6
          const moveY = ((mousePosition.y - centerY) / rect.height) * 6

          containerRef.current.style.setProperty('--move-x', `${moveX}px`)
          containerRef.current.style.setProperty('--move-y', `${moveY}px`)
        }
      }
      previousTimeRef.current = time
      // Only continue animating if document is visible
      if (typeof document !== 'undefined' && !document.hidden) {
        requestRef.current = requestAnimationFrame(animate)
      }
    }

    const start = () => {
      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(animate)
      }
    }
    const stop = () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = undefined
      }
    }

    start()
    const onVisibility = () => {
      if (typeof document !== 'undefined') {
        document.hidden ? stop() : start()
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility)
      }
      stop()
    }
  }, [mousePosition, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.08) 0px,
            transparent 1px,
            transparent 19px,
            rgba(255, 255, 255, 0.08) 20px
          ),
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.08) 0px,
            transparent 1px,
            transparent 19px,
            rgba(255, 255, 255, 0.08) 20px
          )`
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Parallax fog blobs */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/10 to-yellow-300/10 rounded-full blur-3xl"
            style={{
              x: 'var(--move-x)',
              y: 'var(--move-y)',
            }}
            animate={{
              x: ['var(--move-x)', `calc(var(--move-x) + 20px)`, 'var(--move-x)'],
              y: ['var(--move-y)', `calc(var(--move-y) + 10px)`, 'var(--move-y)'],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-2/3 right-1/3 w-48 h-48 bg-gradient-to-r from-yellow-400/8 to-orange-300/8 rounded-full blur-3xl"
            style={{
              x: 'calc(var(--move-x) * -0.5)',
              y: 'calc(var(--move-y) * -0.5)',
            }}
            animate={{
              x: ['calc(var(--move-x) * -0.5)', `calc(var(--move-x) * -0.5 - 15px)`, 'calc(var(--move-x) * -0.5)'],
              y: ['calc(var(--move-y) * -0.5)', `calc(var(--move-y) * -0.5 - 8px)`, 'calc(var(--move-y) * -0.5)'],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
        </>
      )}

      {/* Ambient sweep */}
      {!prefersReducedMotion && play && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            transform: 'skewX(-20deg)',
          }}
        />
      )}
    </div>
  )
}
