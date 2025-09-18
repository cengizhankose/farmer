"use client";
import { useEffect } from "react";

type Options = {
  enabled?: boolean;
  /** 0.5 means 2x slower (half delta) */
  factor?: number;
};

export function useSlowScroll({ enabled = true, factor = 0.5 }: Options = {}) {
  useEffect(() => {
    if (!enabled) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let current = window.scrollY;
    let target = current;
    let raf = 0 as number | 0;

    const clamp = (v: number) => {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      return Math.min(max, Math.max(0, v));
    };

    const step = () => {
      const diff = target - current;
      if (Math.abs(diff) < 0.2) {
        current = target;
        window.scrollTo(0, current);
        raf = 0;
        return;
      }
      // Ease towards target
      current += diff * 0.14; // responsiveness
      window.scrollTo(0, current);
      raf = requestAnimationFrame(step);
    };

    const isScrollableAncestor = (el: Element | null): boolean => {
      let node: Element | null = el as Element | null;
      while (node && node !== document.documentElement) {
        const style = window.getComputedStyle(node);
        const canScrollY =
          (style.overflowY === "auto" || style.overflowY === "scroll") &&
          (node as HTMLElement).scrollHeight > (node as HTMLElement).clientHeight;
        if (canScrollY) return true;
        node = node.parentElement;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      // Allow native scrolling inside scrollable containers
      if (isScrollableAncestor(e.target as Element)) return;
      e.preventDefault();
      target = clamp(target + e.deltaY * (factor ?? 0.5));
      if (!raf) raf = requestAnimationFrame(step);
    };

    // Basic touch handling for mobile
    let lastY = 0;
    let touchActive = false;
    const onTouchStart = (e: TouchEvent) => {
      if (isScrollableAncestor(e.target as Element)) return;
      touchActive = true;
      lastY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchActive) return;
      if (isScrollableAncestor(e.target as Element)) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? lastY;
      const delta = lastY - y; // natural direction
      lastY = y;
      target = clamp(target + delta * (factor ?? 0.5));
      if (!raf) raf = requestAnimationFrame(step);
    };
    const onTouchEnd = () => {
      touchActive = false;
    };

    // Light keyboard handling for page up/down and space
    const onKeyDown = (e: KeyboardEvent) => {
      if (isScrollableAncestor(e.target as Element)) return;
      const h = window.innerHeight;
      let delta = 0;
      if (e.key === "PageDown" || (e.key === " " && !e.shiftKey)) delta = h * 0.9;
      else if (e.key === "PageUp" || (e.key === " " && e.shiftKey)) delta = -h * 0.9;
      else if (e.key === "ArrowDown") delta = 80;
      else if (e.key === "ArrowUp") delta = -80;
      if (delta !== 0) {
        e.preventDefault();
        target = clamp(target + delta * (factor ?? 0.5));
        if (!raf) raf = requestAnimationFrame(step);
      }
    };

    // Attach listeners
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    // Disable CSS smooth scroll which could interfere
    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    return () => {
      window.removeEventListener("wheel", onWheel as any as EventListener);
      window.removeEventListener("touchstart", onTouchStart as any as EventListener);
      window.removeEventListener("touchmove", onTouchMove as any as EventListener);
      window.removeEventListener("touchend", onTouchEnd as any as EventListener);
      window.removeEventListener("keydown", onKeyDown as any as EventListener);
      if (raf) cancelAnimationFrame(raf as number);
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
    };
  }, [enabled, factor]);
}

