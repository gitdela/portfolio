"use client";

import { useTheme } from "next-themes";

function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className="icon-when-dark"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="icon-when-light"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Both icons are always rendered; CSS keyed off `data-theme` decides which is visible.
 *
 * That avoids the usual `mounted` state dance: the server cannot know the stored theme, so
 * deciding in JavaScript after hydration means either a mismatch or a visible icon pop. The
 * pre-paint script has already set `data-theme` before first paint, so the correct icon is
 * showing from the very first frame.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }}
      aria-label="Toggle light and dark mode"
      title="Toggle light/dark mode"
      className="inline-flex h-[34px] w-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-card p-0 text-ink transition-colors hover:border-accent hover:text-accent"
    >
      <SunIcon />
      <MoonIcon />
    </button>
  );
}
