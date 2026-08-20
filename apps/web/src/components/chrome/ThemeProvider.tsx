"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Dark by default and never following the OS, per the handoff. `next-themes` injects a
 * blocking pre-paint script that sets `data-theme` before first paint, which is what stops
 * the light-mode flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      storageKey="kn-theme"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
