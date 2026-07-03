"use client";

import { useEffect, useRef, useState } from "react";
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
  const toggleTheme = () => {
    document.documentElement.classList.add("theme-transition");
    setTheme(nextTheme);

    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }
    transitionTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 360);
  };

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
      <Sun
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "translate-y-6 rotate-90 opacity-0" : "translate-y-0 rotate-0 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-4 w-4 transition-all duration-300 ${
          isDark ? "translate-y-0 rotate-0 opacity-100" : "-translate-y-6 -rotate-90 opacity-0"
        }`}
      />
      <span className="sr-only">Toggle dark and light mode</span>
    </Button>
  );
}
