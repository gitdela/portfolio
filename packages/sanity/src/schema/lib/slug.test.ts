import { describe, expect, test } from "bun:test";

import { isUrlSafeSlug, slugify } from "./slug";

describe("slugify", () => {
  test("lowercases and hyphenates a human label", () => {
    expect(slugify("Company work")).toBe("company-work");
  });

  test("strips diacritics rather than percent-encoding them", () => {
    expect(slugify("Café Résumé")).toBe("cafe-resume");
  });

  test("collapses runs of punctuation into a single hyphen", () => {
    expect(slugify("React  &  Next.js!!")).toBe("react-next-js");
  });

  test("trims leading and trailing hyphens", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  test("produces slugs its own validator accepts", () => {
    for (const label of ["Company work", "Build log", "Café Résumé", "React & Next.js"]) {
      expect(isUrlSafeSlug(slugify(label))).toBe(true);
    }
  });
});

describe("isUrlSafeSlug", () => {
  test("accepts lowercase hyphenated slugs", () => {
    expect(isUrlSafeSlug("company-work")).toBe(true);
    expect(isUrlSafeSlug("seo")).toBe(true);
    expect(isUrlSafeSlug("next-15-notes")).toBe(true);
  });

  test("rejects uppercase and spaces — these become ?tag= values", () => {
    expect(isUrlSafeSlug("Company work")).not.toBe(true);
    expect(isUrlSafeSlug("CompanyWork")).not.toBe(true);
  });

  test("rejects leading, trailing, and doubled hyphens", () => {
    expect(isUrlSafeSlug("-lead")).not.toBe(true);
    expect(isUrlSafeSlug("trail-")).not.toBe(true);
    expect(isUrlSafeSlug("double--hyphen")).not.toBe(true);
  });

  test("rejects an empty or single-character slug", () => {
    expect(isUrlSafeSlug(undefined)).not.toBe(true);
    expect(isUrlSafeSlug("")).not.toBe(true);
    expect(isUrlSafeSlug("a")).not.toBe(true);
  });

  test("returns a message an editor can act on, not just false", () => {
    const result = isUrlSafeSlug("Company work");
    expect(typeof result).toBe("string");
  });
});
