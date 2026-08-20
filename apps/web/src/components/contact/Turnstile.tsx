"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          appearance?: "always" | "execute" | "interaction-only";
          theme?: "auto" | "light" | "dark";
        },
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

/**
 * Turnstile without a persistent visual field.
 *
 * `appearance: "interaction-only"` keeps the widget invisible unless Cloudflare decides a
 * challenge is warranted, which preserves the handoff's three-field layout. When a
 * challenge *is* required the widget becomes visible in place — that is the progressive
 * fallback, not an error state.
 */
export function Turnstile({ siteKey, fieldName }: { siteKey: string; fieldName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!scriptReady || !containerRef.current || widgetIdRef.current) return;
    const turnstile = window.turnstile;
    if (!turnstile) return;

    widgetIdRef.current = turnstile.render(containerRef.current, {
      sitekey: siteKey,
      appearance: "interaction-only",
      theme: "auto",
      callback: (value: string) => {
        setToken(value);
      },
      "expired-callback": () => {
        setToken("");
      },
      "error-callback": () => {
        setToken("");
      },
    });
  }, [scriptReady, siteKey]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="lazyOnload"
        onReady={() => {
          setScriptReady(true);
        }}
      />
      <div ref={containerRef} />
      <input type="hidden" name={fieldName} value={token} />
    </>
  );
}
