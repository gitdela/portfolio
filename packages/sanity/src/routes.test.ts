import { describe, expect, test } from "bun:test";

import { INTERNAL_ROUTES, internalRoutePath } from "./routes";

describe("internalRoutePath", () => {
  test("resolves every declared route to its public path", () => {
    for (const route of INTERNAL_ROUTES) {
      expect(internalRoutePath(route.value)).toBe(route.path);
    }
  });

  test("falls back to home for an unknown, missing, or empty destination", () => {
    expect(internalRoutePath("does-not-exist")).toBe("/");
    expect(internalRoutePath(null)).toBe("/");
    expect(internalRoutePath(undefined)).toBe("/");
    expect(internalRoutePath("")).toBe("/");
  });

  test("every path is absolute, so a CTA can never produce a relative link", () => {
    for (const route of INTERNAL_ROUTES) {
      expect(route.path.startsWith("/")).toBe(true);
    }
  });

  test("route keys are unique", () => {
    const values = INTERNAL_ROUTES.map((route) => route.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
