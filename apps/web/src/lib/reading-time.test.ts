import { describe, expect, test } from "bun:test";

import { formatPostDate, formatReadingTime, readingTimeMinutes } from "./reading-time";

function block(text: string) {
  return {
    _type: "block",
    _key: Math.abs(text.length).toString(16),
    style: "normal",
    children: [{ _type: "span", _key: "s", text, marks: [] }],
    markDefs: [],
  };
}

describe("readingTimeMinutes", () => {
  test("never reports zero minutes", () => {
    expect(readingTimeMinutes([block("Short.")])).toBe(1);
  });

  test("falls back to one minute for an empty body", () => {
    expect(readingTimeMinutes([])).toBe(1);
    expect(readingTimeMinutes(null)).toBe(1);
    expect(readingTimeMinutes(undefined)).toBe(1);
  });

  test("scales with word count at roughly 200 words per minute", () => {
    expect(readingTimeMinutes([block("word ".repeat(200).trim())])).toBe(1);
    expect(readingTimeMinutes([block("word ".repeat(1000).trim())])).toBe(5);
  });

  test("counts across multiple blocks", () => {
    const body = Array.from({ length: 4 }, (_, i) =>
      block(`${"word ".repeat(200).trim()} ${String(i)}`),
    );
    expect(readingTimeMinutes(body)).toBe(4);
  });

  test("ignores non-array input rather than throwing", () => {
    expect(readingTimeMinutes("not portable text")).toBe(1);
  });
});

describe("formatReadingTime", () => {
  test("renders the label the design expects", () => {
    expect(formatReadingTime([block("word ".repeat(1000).trim())])).toBe("5 min read");
  });
});

describe("formatPostDate", () => {
  test("formats in a fixed locale and timezone so hydration stays stable", () => {
    expect(formatPostDate("2026-08-20T00:00:00.000Z")).toBe("Aug 20, 2026");
  });

  test("does not drift across a timezone boundary", () => {
    expect(formatPostDate("2026-08-20T23:30:00.000Z")).toBe("Aug 20, 2026");
  });

  test("returns null for missing or unparseable input", () => {
    expect(formatPostDate(null)).toBeNull();
    expect(formatPostDate(undefined)).toBeNull();
    expect(formatPostDate("not a date")).toBeNull();
  });
});
