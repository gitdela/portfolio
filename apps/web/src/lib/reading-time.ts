import { toPlainText } from "next-sanity";

const WORDS_PER_MINUTE = 200;

/**
 * Reading time is derived from the body rather than entered by hand, so it can never drift
 * from the content. Always at least one minute — "0 min read" is not a useful thing to show.
 */
export function readingTimeMinutes(body: unknown): number {
  if (!Array.isArray(body) || body.length === 0) return 1;

  const words = toPlainText(body as Parameters<typeof toPlainText>[0])
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(body: unknown): string {
  return `${String(readingTimeMinutes(body))} min read`;
}

/** Dates render in a fixed locale so server and client agree and hydration stays stable. */
export function formatPostDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
