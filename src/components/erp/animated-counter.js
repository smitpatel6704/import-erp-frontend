"use client";

import { useEffect, useRef, useState } from "react";

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Smoothly counts up to `value` when it changes (and on mount).
 * Falls back to the final value instantly when the user prefers reduced motion.
 *
 * @param {number} value        target number
 * @param {(n:number)=>string} format  how to render the current number
 * @param {number} duration     animation length in ms
 */
export function AnimatedCounter({ value = 0, format = (n) => Math.round(n).toLocaleString(), duration = 900 }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const from = fromRef.current;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || from === target) {
      fromRef.current = target;
      setDisplay(target);
      return;
    }

    let start = null;
    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = easeOutExpo(progress);
      const current = from + (target - from) * eased;
      setDisplay(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = target;
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
