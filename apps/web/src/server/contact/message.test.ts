import { describe, expect, test } from "bun:test";

import { buildBodies, escapeHtml, idempotencyKey, isRetryableStatus } from "./message";

const base = { name: "Ada Lovelace", email: "ada@example.com", message: "Let's build something." };

describe("idempotencyKey", () => {
  test("is stable for the same submission", () => {
    expect(idempotencyKey(base)).toBe(idempotencyKey({ ...base }));
  });

  test("normalizes case and surrounding whitespace so a double-submit collapses", () => {
    expect(idempotencyKey(base)).toBe(
      idempotencyKey({
        name: "  Ada Lovelace  ",
        email: "Ada@Example.COM",
        message: "  Let's build something.  ",
      }),
    );
  });

  test("changes when the message changes", () => {
    expect(idempotencyKey(base)).not.toBe(
      idempotencyKey({ ...base, message: "Something else entirely." }),
    );
  });

  test("changes when the sender changes", () => {
    expect(idempotencyKey(base)).not.toBe(idempotencyKey({ ...base, email: "grace@example.com" }));
  });

  test("does not leak the submission — the digest is one-way", () => {
    const key = idempotencyKey(base);
    expect(key).not.toContain("ada@example.com");
    expect(key).not.toContain("Ada");
    expect(key).toMatch(/^contact_[0-9a-f]{32}$/);
  });
});

describe("escapeHtml", () => {
  test("neutralizes markup so a message cannot inject into the HTML body", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
    );
  });

  test("escapes ampersands before other entities so they are not double-encoded", () => {
    expect(escapeHtml("Tom & Jerry <friends>")).toBe("Tom &amp; Jerry &lt;friends&gt;");
  });
});

describe("buildBodies", () => {
  test("sends both a plain-text and an HTML body", () => {
    const { text, html } = buildBodies(base);
    expect(text).toContain("Ada Lovelace");
    expect(text).toContain("Let's build something.");
    expect(html).toContain("<div");
  });

  test("escapes the HTML body but leaves the text body verbatim", () => {
    const hostile = { ...base, name: "<b>Ada</b>" };
    const { text, html } = buildBodies(hostile);
    expect(html).toContain("&lt;b&gt;Ada&lt;/b&gt;");
    expect(html).not.toContain("<b>Ada</b>");
    expect(text).toContain("<b>Ada</b>");
  });
});

describe("isRetryableStatus", () => {
  test("retries rate limits and server faults", () => {
    expect(isRetryableStatus(429)).toBe(true);
    expect(isRetryableStatus(500)).toBe(true);
    expect(isRetryableStatus(503)).toBe(true);
  });

  test("does not retry client errors — a rejected payload stays rejected", () => {
    expect(isRetryableStatus(400)).toBe(false);
    expect(isRetryableStatus(401)).toBe(false);
    expect(isRetryableStatus(422)).toBe(false);
  });

  test("treats a missing status as non-retryable", () => {
    expect(isRetryableStatus(undefined)).toBe(false);
  });
});
