"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSelector() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const transitionTimer = useRef(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));

    return () => {
      cancelAnimationFrame(frame);
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const toggleTheme = (event) => {
    if (!document.startViewTransition) {
      document.documentElement.classList.add("theme-transition");
      setTheme(nextTheme);

      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transition");
      }, 360);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    const root = document.documentElement;

    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-radius", `${radius}px`);
    root.dataset.themeTransition = nextTheme;

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(nextTheme));
    });

    transition.finished.finally(() => {
      root.style.removeProperty("--theme-x");
      root.style.removeProperty("--theme-y");
      root.style.removeProperty("--theme-radius");
      delete root.dataset.themeTransition;
    });
  };
  const Icon = isDark ? Moon : Sun;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="relative h-10 w-10 overflow-hidden rounded-full"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <Icon key={resolvedTheme} className="theme-toggle-icon absolute h-4 w-4" />
      <span className="sr-only">Toggle dark and light mode</span>
    </Button>
  );
}
