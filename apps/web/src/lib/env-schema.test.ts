import { describe, expect, test } from "bun:test";

import {
  formatEnvIssues,
  normalizeSiteUrl,
  publicEnvSchema,
  resolveSiteUrl,
  serverEnvSchema,
} from "./env-schema";

const validPublic = {
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  NEXT_PUBLIC_SANITY_PROJECT_ID: "abc12345",
  NEXT_PUBLIC_SANITY_DATASET: "production",
  NEXT_PUBLIC_SANITY_API_VERSION: "2026-08-01",
  NEXT_PUBLIC_SANITY_STUDIO_URL: "https://studio.example.com",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
};

const validServer = {
  SANITY_API_READ_TOKEN: "sk-token",
  SANITY_REVALIDATE_SECRET: "secret",
  TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  RESEND_API_KEY: "re_123",
  RESEND_FROM_EMAIL: "contact@send.example.com",
  CONTACT_TO_EMAIL: "you@example.com",
};

describe("publicEnvSchema", () => {
  test("accepts a complete configuration", () => {
    expect(publicEnvSchema.safeParse(validPublic).success).toBe(true);
  });

  test("requires an absolute site URL — a bare host cannot anchor a canonical", () => {
    expect(
      publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SITE_URL: "example.com" }).success,
    ).toBe(false);
  });

  test("requires a dated Sanity API version", () => {
    for (const bad of ["v1", "2026-8-1", "latest", ""]) {
      expect(
        publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_API_VERSION: bad }).success,
      ).toBe(false);
    }
    expect(
      publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_API_VERSION: "2026-08-01" })
        .success,
    ).toBe(true);
  });

  test("rejects an empty project id or dataset rather than querying nothing", () => {
    expect(
      publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_PROJECT_ID: "" }).success,
    ).toBe(false);
    expect(
      publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_DATASET: "" }).success,
    ).toBe(false);
  });

  test("treats the API host escape hatch as optional", () => {
    expect(publicEnvSchema.safeParse(validPublic).success).toBe(true);
    expect(
      publicEnvSchema.safeParse({
        ...validPublic,
        NEXT_PUBLIC_SANITY_API_HOST: "http://localhost:3999",
      }).success,
    ).toBe(true);
    expect(
      publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_API_HOST: "not-a-url" })
        .success,
    ).toBe(false);
  });

  test("reports every missing required variable at once, not just the first", () => {
    const result = publicEnvSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = formatEnvIssues(result.error);
      // The two URL variables are optional; a first deployment cannot know them yet.
      for (const key of [
        "NEXT_PUBLIC_SANITY_PROJECT_ID",
        "NEXT_PUBLIC_SANITY_DATASET",
        "NEXT_PUBLIC_SANITY_API_VERSION",
        "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      ]) {
        expect(message).toContain(key);
      }
    }
  });

  test("builds without a site or Studio URL — those are resolved, not required", () => {
    const { NEXT_PUBLIC_SITE_URL: _a, NEXT_PUBLIC_SANITY_STUDIO_URL: _b, ...rest } = validPublic;
    expect(publicEnvSchema.safeParse(rest).success).toBe(true);
  });
});

describe("serverEnvSchema", () => {
  test("accepts a complete configuration", () => {
    expect(serverEnvSchema.safeParse(validServer).success).toBe(true);
  });

  test("requires both email addresses to be well formed", () => {
    expect(
      serverEnvSchema.safeParse({ ...validServer, RESEND_FROM_EMAIL: "not-an-email" }).success,
    ).toBe(false);
    expect(
      serverEnvSchema.safeParse({ ...validServer, CONTACT_TO_EMAIL: "also-not" }).success,
    ).toBe(false);
  });

  test("rejects blank secrets rather than starting half-configured", () => {
    for (const key of ["SANITY_API_READ_TOKEN", "SANITY_REVALIDATE_SECRET", "RESEND_API_KEY"]) {
      expect(serverEnvSchema.safeParse({ ...validServer, [key]: "" }).success).toBe(false);
    }
  });

  test("does not accept public variables in place of server ones", () => {
    const { SANITY_API_READ_TOKEN: _omitted, ...missing } = validServer;
    expect(serverEnvSchema.safeParse(missing).success).toBe(false);
  });
});

describe("normalizeSiteUrl", () => {
  test("strips trailing slashes so paths concatenate cleanly", () => {
    expect(normalizeSiteUrl("https://example.com/")).toBe("https://example.com");
    expect(normalizeSiteUrl("https://example.com///")).toBe("https://example.com");
    expect(normalizeSiteUrl("https://example.com")).toBe("https://example.com");
  });

  test("leaves a path prefix intact apart from the trailing slash", () => {
    expect(normalizeSiteUrl("https://example.com/site/")).toBe("https://example.com/site");
  });
});

describe("resolveSiteUrl", () => {
  test("prefers the explicit setting over anything Vercel provides", () => {
    expect(
      resolveSiteUrl({
        explicit: "https://kennartey.com",
        vercelProductionUrl: "portfolio.vercel.app",
      }),
    ).toBe("https://kennartey.com");
  });

  test("falls back to Vercel's production domain, adding the scheme it omits", () => {
    expect(resolveSiteUrl({ vercelProductionUrl: "portfolio.vercel.app" })).toBe(
      "https://portfolio.vercel.app",
    );
  });

  test("tolerates a production domain that already carries a scheme", () => {
    expect(resolveSiteUrl({ vercelProductionUrl: "https://portfolio.vercel.app" })).toBe(
      "https://portfolio.vercel.app",
    );
  });

  test("normalizes the fallback the same way as an explicit value", () => {
    expect(resolveSiteUrl({ vercelProductionUrl: "portfolio.vercel.app/" })).toBe(
      "https://portfolio.vercel.app",
    );
  });

  test("throws with an actionable message when neither source exists", () => {
    expect(() => resolveSiteUrl({})).toThrow(/NEXT_PUBLIC_SITE_URL/);
  });

  test("an empty explicit value falls through rather than yielding an empty origin", () => {
    expect(resolveSiteUrl({ explicit: "", vercelProductionUrl: "portfolio.vercel.app" })).toBe(
      "https://portfolio.vercel.app",
    );
  });
});

describe("empty strings are treated as absent", () => {
  test("an empty optional URL falls through instead of failing format validation", () => {
    // Vercel and similar dashboards hand back "" for a variable created but left blank.
    const result = publicEnvSchema.safeParse({
      ...validPublic,
      NEXT_PUBLIC_SITE_URL: "",
      NEXT_PUBLIC_SANITY_STUDIO_URL: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_SITE_URL).toBeUndefined();
      expect(result.data.NEXT_PUBLIC_SANITY_STUDIO_URL).toBeUndefined();
    }
  });

  test("whitespace-only counts as empty too", () => {
    const result = publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SITE_URL: "   " });
    expect(result.success).toBe(true);
  });

  test("an empty required variable reports as missing, not malformed", () => {
    const result = publicEnvSchema.safeParse({ ...validPublic, NEXT_PUBLIC_SANITY_PROJECT_ID: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(formatEnvIssues(result.error)).toContain("NEXT_PUBLIC_SANITY_PROJECT_ID");
    }
  });

  test("real values are untouched", () => {
    const result = publicEnvSchema.safeParse(validPublic);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  test("the server schema does the same", () => {
    expect(serverEnvSchema.safeParse({ ...validServer, RESEND_API_KEY: "" }).success).toBe(false);
  });
});
