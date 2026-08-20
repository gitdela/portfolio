import { describe, expect, test } from "bun:test";

import {
  type FetchLike,
  isVerified,
  TURNSTILE_VERIFY_URL,
  verifyTurnstileWith,
} from "./turnstile-policy";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const deps = (fetchImpl: FetchLike) => ({ secret: "test-secret", fetchImpl });

/** The policy always sends URLSearchParams; read it as such rather than stringifying blind. */
function bodyOf(init: RequestInit | undefined): string {
  const body = init?.body;
  return body instanceof URLSearchParams ? body.toString() : "";
}

function urlOf(url: RequestInfo | URL): string {
  return typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
}

describe("isVerified", () => {
  test("accepts only an explicit success: true", () => {
    expect(isVerified({ success: true })).toBe(true);
    expect(isVerified({ success: false })).toBe(false);
  });

  test("rejects truthy-but-not-true values rather than coercing", () => {
    expect(isVerified({ success: "true" })).toBe(false);
    expect(isVerified({ success: 1 })).toBe(false);
  });

  test("rejects malformed bodies", () => {
    expect(isVerified(null)).toBe(false);
    expect(isVerified(undefined)).toBe(false);
    expect(isVerified("ok")).toBe(false);
    expect(isVerified({})).toBe(false);
  });
});

describe("verifyTurnstileWith", () => {
  test("passes a valid token", async () => {
    const ok = await verifyTurnstileWith(
      deps(() => Promise.resolve(jsonResponse({ success: true }))),
      "token",
      null,
    );
    expect(ok).toBe(true);
  });

  test("fails a rejected token", async () => {
    const ok = await verifyTurnstileWith(
      deps(() =>
        Promise.resolve(
          jsonResponse({ success: false, "error-codes": ["invalid-input-response"] }),
        ),
      ),
      "token",
      null,
    );
    expect(ok).toBe(false);
  });

  test("fails on a non-2xx response instead of assuming success", async () => {
    for (const status of [400, 401, 429, 500, 503]) {
      const ok = await verifyTurnstileWith(
        deps(() => Promise.resolve(jsonResponse({ success: true }, status))),
        "token",
        null,
      );
      expect(ok).toBe(false);
    }
  });

  test("fails closed on a network error", async () => {
    const ok = await verifyTurnstileWith(
      deps(() => Promise.reject(new Error("ECONNREFUSED"))),
      "token",
      null,
    );
    expect(ok).toBe(false);
  });

  test("fails closed on a timeout", async () => {
    // A compliant fetch rejects when the signal aborts; this mirrors that so the timeout
    // is genuinely exercised rather than the test just hanging.
    const hangingFetch: FetchLike = (_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });

    const ok = await verifyTurnstileWith({ ...deps(hangingFetch), timeoutMs: 20 }, "token", null);
    expect(ok).toBe(false);
  });

  test("passes an abort signal so a hung request cannot block a submission forever", async () => {
    let sawSignal = false;
    await verifyTurnstileWith(
      deps((_u, init) => {
        sawSignal = init?.signal instanceof AbortSignal;
        return Promise.resolve(jsonResponse({ success: true }));
      }),
      "token",
      null,
    );
    expect(sawSignal).toBe(true);
  });

  test("fails closed on an unparseable body", async () => {
    const ok = await verifyTurnstileWith(
      deps(() => Promise.resolve(new Response("<html>not json</html>", { status: 200 }))),
      "token",
      null,
    );
    expect(ok).toBe(false);
  });

  test("posts the secret and token to Cloudflare, and never in the URL", async () => {
    let seenUrl = "";
    let seenBody = "";
    let seenMethod = "";

    await verifyTurnstileWith(
      deps((url, init) => {
        seenUrl = urlOf(url);
        seenMethod = init?.method ?? "";
        seenBody = bodyOf(init);
        return Promise.resolve(jsonResponse({ success: true }));
      }),
      "the-token",
      null,
    );

    expect(seenUrl).toBe(TURNSTILE_VERIFY_URL);
    expect(seenMethod).toBe("POST");
    expect(seenBody).toContain("secret=test-secret");
    expect(seenBody).toContain("response=the-token");
    // The token must not leak into a URL, where it could land in logs.
    expect(seenUrl).not.toContain("the-token");
  });

  test("forwards the client IP when known and omits it when not", async () => {
    let withIp = "";
    await verifyTurnstileWith(
      deps((_u, init) => {
        withIp = bodyOf(init);
        return Promise.resolve(jsonResponse({ success: true }));
      }),
      "t",
      "203.0.113.7",
    );
    expect(withIp).toContain("remoteip=203.0.113.7");

    let withoutIp = "";
    await verifyTurnstileWith(
      deps((_u, init) => {
        withoutIp = bodyOf(init);
        return Promise.resolve(jsonResponse({ success: true }));
      }),
      "t",
      null,
    );
    expect(withoutIp).not.toContain("remoteip");
  });
});
