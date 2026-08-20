import { describe, expect, test } from "bun:test";

import { resolveCanonicalPath, resolveDescription, resolveNoIndex, resolveTitle } from "./cascade";

const full = {
  overrideTitle: "Override title",
  overrideDescription: "Override description",
  documentTitle: "Document title",
  documentDescription: "Document description",
  defaultTitle: "Default title",
  defaultDescription: "Default description",
  siteName: "Site name",
};

describe("resolveTitle", () => {
  test("prefers the SEO override", () => {
    expect(resolveTitle(full)).toBe("Override title");
  });

  test("falls back through document, default, then site name", () => {
    expect(resolveTitle({ ...full, overrideTitle: null })).toBe("Document title");
    expect(resolveTitle({ ...full, overrideTitle: null, documentTitle: null })).toBe(
      "Default title",
    );
    expect(
      resolveTitle({ ...full, overrideTitle: null, documentTitle: null, defaultTitle: null }),
    ).toBe("Site name");
  });

  test("returns undefined when nothing is available, rather than an empty title", () => {
    expect(resolveTitle({})).toBeUndefined();
  });

  test("treats a blank or whitespace-only override as absent and keeps falling through", () => {
    expect(resolveTitle({ ...full, overrideTitle: "" })).toBe("Document title");
    expect(resolveTitle({ ...full, overrideTitle: "   " })).toBe("Document title");
  });
});

describe("resolveDescription", () => {
  test("prefers the SEO override, then document, then default", () => {
    expect(resolveDescription(full)).toBe("Override description");
    expect(resolveDescription({ ...full, overrideDescription: null })).toBe("Document description");
    expect(
      resolveDescription({ ...full, overrideDescription: null, documentDescription: null }),
    ).toBe("Default description");
  });

  test("returns an empty string when nothing is available", () => {
    expect(resolveDescription({})).toBe("");
  });

  test("never falls back to the site name — that is a title, not a description", () => {
    expect(resolveDescription({ siteName: "Site name" })).toBe("");
  });
});

describe("resolveCanonicalPath", () => {
  test("leaves absolute paths alone", () => {
    expect(resolveCanonicalPath("/blog")).toBe("/blog");
    expect(resolveCanonicalPath("/")).toBe("/");
  });

  test("makes a relative path absolute", () => {
    expect(resolveCanonicalPath("blog")).toBe("/blog");
  });
});

describe("resolveNoIndex", () => {
  test("indexes only the production deployment", () => {
    expect(resolveNoIndex({ vercelEnv: "production" })).toBe(false);
  });

  test("never indexes previews, development, or an unset environment", () => {
    for (const env of ["preview", "development", undefined, ""]) {
      expect(resolveNoIndex({ vercelEnv: env })).toBe(true);
    }
  });

  test("honours a per-document opt-out even in production", () => {
    expect(resolveNoIndex({ documentNoIndex: true, vercelEnv: "production" })).toBe(true);
  });

  test("an explicit false does not force indexing outside production", () => {
    expect(resolveNoIndex({ documentNoIndex: false, vercelEnv: "preview" })).toBe(true);
  });
});
