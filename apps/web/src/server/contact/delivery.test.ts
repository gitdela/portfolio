import { describe, expect, test } from "bun:test";

import { deliverWithRetry, statusCodeOf, type SendResult } from "./delivery";

/** Never actually waits, so retry timing does not slow the suite. */
const noSleep = () => Promise.resolve();

/** Returns each queued result in turn, recording how many times it was called. */
function sender(results: (SendResult | Error)[]) {
  let calls = 0;
  const send = () => {
    const next = results[Math.min(calls, results.length - 1)];
    calls += 1;
    if (next instanceof Error) return Promise.reject(next);
    return Promise.resolve(next ?? {});
  };
  return { send, calls: () => calls };
}

describe("statusCodeOf", () => {
  test("reads a numeric status code", () => {
    expect(statusCodeOf({ statusCode: 429 })).toBe(429);
  });

  test("returns undefined for shapes Resend might hand back instead", () => {
    expect(statusCodeOf(null)).toBeUndefined();
    expect(statusCodeOf(undefined)).toBeUndefined();
    expect(statusCodeOf("rate limited")).toBeUndefined();
    expect(statusCodeOf({ message: "boom" })).toBeUndefined();
    expect(statusCodeOf({ statusCode: "429" })).toBeUndefined();
  });
});

describe("deliverWithRetry", () => {
  test("sends once on success", async () => {
    const s = sender([{}]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: true, attempts: 1 });
    expect(s.calls()).toBe(1);
  });

  test("does not retry a rejected payload — it would be rejected identically", async () => {
    for (const statusCode of [400, 401, 403, 422]) {
      const s = sender([{ error: { statusCode } }]);
      const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
      expect(outcome).toEqual({ ok: false, retryable: false, attempts: 1 });
      expect(s.calls()).toBe(1);
    }
  });

  test("retries a rate limit and succeeds on a later attempt", async () => {
    const s = sender([{ error: { statusCode: 429 } }, {}]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: true, attempts: 2 });
    expect(s.calls()).toBe(2);
  });

  test("retries a server fault", async () => {
    const s = sender([{ error: { statusCode: 503 } }, {}]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome.ok).toBe(true);
  });

  test("stops after two retries — three attempts total, never more", async () => {
    const s = sender([{ error: { statusCode: 500 } }]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: false, retryable: true, attempts: 3 });
    expect(s.calls()).toBe(3);
  });

  test("treats a thrown error as a retryable transport failure", async () => {
    const s = sender([new Error("socket hang up")]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: false, retryable: true, attempts: 3 });
    expect(s.calls()).toBe(3);
  });

  test("recovers when a throw is followed by a success", async () => {
    const s = sender([new Error("transient"), {}]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: true, attempts: 2 });
  });

  test("an error field with no status code is not retried", async () => {
    const s = sender([{ error: { message: "validation_error" } }]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep });
    expect(outcome).toEqual({ ok: false, retryable: false, attempts: 1 });
    expect(s.calls()).toBe(1);
  });

  test("backs off further on each successive retry", async () => {
    const delays: number[] = [];
    const s = sender([{ error: { statusCode: 500 } }]);
    await deliverWithRetry(s.send, {
      sleep: (ms) => {
        delays.push(ms);
        return Promise.resolve();
      },
    });
    expect(delays).toEqual([400, 800]);
  });

  test("honours a lower retry ceiling", async () => {
    const s = sender([{ error: { statusCode: 500 } }]);
    const outcome = await deliverWithRetry(s.send, { sleep: noSleep, maxRetries: 0 });
    expect(outcome.attempts).toBe(1);
    expect(s.calls()).toBe(1);
  });
});
