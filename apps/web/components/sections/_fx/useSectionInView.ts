"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  threshold?: number; // defaults to 0.3
  once?: boolean;     // defaults to true
  rootMargin?: string;
};

export function useSectionInView<T extends HTMLElement = HTMLElement>(opts: Options = {}) {
  const { threshold = 0.3, once = true, rootMargin } = opts;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView && once) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [inView, once, threshold, rootMargin]);

  return { ref, inView } as const;
}

