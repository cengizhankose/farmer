"use client";

import { RefObject } from 'react'
import { useInView } from 'framer-motion'

export function useScrollStage(ref: RefObject<Element>) {
  const isInView = useInView(ref, {
    amount: 0.3,
    once: true,
  })

  return { play: isInView }
}
