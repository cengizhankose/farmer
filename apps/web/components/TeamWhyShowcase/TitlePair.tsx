import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

interface TitlePairProps {
  play: boolean
}

export default function TitlePair({ play }: TitlePairProps) {
  const prefersReducedMotion = useReducedMotion()

  const charVariants = {
    hidden: { opacity: 0, y: 8 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.28,
        delay: prefersReducedMotion ? 0 : i * 0.03,
      }
    })
  }

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <motion.span
        key={`${text}-${index}`}
        variants={charVariants}
        initial="hidden"
        animate={play ? 'show' : 'hidden'}
        custom={index}
        className="inline-block"
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))
  }

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={play ? 'show' : 'hidden'}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
    >
      <motion.div
        className="text-5xl md:text-6xl font-display text-white tracking-tight"
        variants={prefersReducedMotion ? {} : charVariants}
      >
        {splitText('Who Are We?')}
      </motion.div>

      <motion.div
        className="text-5xl md:text-6xl font-display text-white tracking-tight"
        variants={prefersReducedMotion ? {} : charVariants}
      >
        {splitText('Why Choose Us?')}
      </motion.div>
    </motion.div>
  )
}
