"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  ThemeToggleButton,
  useThemeTransition,
} from "@/components/ui/shadcn-io/theme-toggle-button";

const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const { startTransition } = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";

    startTransition(() => {
      setTheme(newTheme);
    });
  };

  // Convert next-themes values to our component format
  // Handle system theme properly by using the actual resolved theme
  const currentTheme = (() => {
    if (theme === "system") {
      return (systemTheme as "light" | "dark") || "light";
    }
    return (theme as "light" | "dark") || "light";
  })();

  if (!mounted) {
    // Return loading placeholder with same structure to prevent layout shift
    return (
      <div className="grid grid-cols-3 gap-4 p-8 max-w-md mx-auto animate-pulse">
        {Array.from({ length: 5 }, (_, i) => {
          if (i === 1 || i === 4) return <div key={i}></div>; // Empty spaces
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="w-12 h-3 bg-muted rounded" />
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-4 p-8 max-w-md mx-auto">
      {/* Top row */}
      <div className="flex flex-col items-center gap-2">
        <ThemeToggleButton
          theme={currentTheme}
          onClick={handleThemeToggle}
          variant="circle"
          start="top-left"
        />
        <span className="text-xs text-muted-foreground">Top Left</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggleButton
          theme={currentTheme}
          onClick={handleThemeToggle}
          variant="circle"
          start="center"
        />
        <span className="text-xs text-muted-foreground">Center</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggleButton
          theme={currentTheme}
          onClick={handleThemeToggle}
          variant="circle"
          start="top-right"
        />
        <span className="text-xs text-muted-foreground">Top Right</span>
      </div>
      {/* Middle row - empty spaces for visual balance */}
      <div></div>
      <div></div>
      <div></div>
      {/* Bottom row */}
      <div className="flex flex-col items-center gap-2">
        <ThemeToggleButton
          theme={currentTheme}
          onClick={handleThemeToggle}
          variant="circle"
          start="bottom-left"
        />
        <span className="text-xs text-muted-foreground">Bottom Left</span>
      </div>

      <div></div>

      <div className="flex flex-col items-center gap-2">
        <ThemeToggleButton
          theme={currentTheme}
          onClick={handleThemeToggle}
          variant="circle"
          start="bottom-right"
        />
        <span className="text-xs text-muted-foreground">Bottom Right</span>
      </div>
    </div>
  );
};
export default ThemeToggle;
