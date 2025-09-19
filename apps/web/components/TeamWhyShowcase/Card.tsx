import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'
import CountUp from './CountUp'

interface CardProps {
  metric?: string | number
  title: string
  subtitle?: string
  children?: ReactNode
  delay?: number
}

export default function Card({ metric, title, subtitle, children, delay = 0 }: CardProps) {
  const prefersReducedMotion = useReducedMotion()

  const fadeVariants = {
    hidden: { opacity: 0, y: 14, filter: 'blur(2px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0)',
      transition: {
        duration: 0.32,
        delay,
      },
    },
  }

  const titleId = `card-title-${title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="show"
      whileHover={{ y: -2, boxShadow: '0 14px 45px rgba(0, 0, 0, 0.35)', transition: { type: 'spring' as const, stiffness: 260, damping: 20 } }}
      className="bg-white/8 ring-1 ring-white/12 backdrop-blur-md rounded-2xl p-5 md:p-6 relative overflow-hidden group"
      style={{
        willChange: 'transform, opacity',
        boxShadow: '0 10px 35px rgba(0, 0, 0, 0.25)',
      }}
      role="article"
      aria-labelledby={titleId}
    >
      {/* Hover highlight sweep */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
          mask: 'linear-gradient(90deg, transparent 0%, black 50%, transparent 100%)',
          WebkitMask: 'linear-gradient(90deg, transparent 0%, black 50%, transparent 100%)',
          animation: prefersReducedMotion ? 'none' : 'sweep 400ms ease-in-out'
        }}
      />

      {metric && (
        <div className="text-4xl md:text-5xl font-display text-white mb-4 tabular-nums flex items-center gap-2">
          <CountUp value={metric} />
          {typeof metric === 'string' && metric.includes('→') && (
            <motion.span
              aria-hidden
              className="inline-block"
              animate={{ scaleX: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          )}
        </div>
      )}

      <h3
        id={titleId}
        className="text-xl md:text-2xl font-semibold text-white mb-2"
      >
        {title}
      </h3>

      {subtitle && (
        <p className="text-gray-300 text-sm md:text-base mb-4">
          {subtitle}
        </p>
      )}

      {children && (
        <div className="text-gray-200 text-sm">
          {children}
        </div>
      )}

      {/* Special effects for specific cards */}
      {typeof metric !== 'undefined' && metric.toString().includes('24/7') && (
        <motion.div
          className="absolute top-4 right-4 w-2 h-2 bg-orange-400 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}

      {title.includes('Transparent metrics') && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-yellow-400 rounded-full"
              animate={{
                x: [0, 4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  )
}
