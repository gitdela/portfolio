import { isRetryableStatus } from "./message";

/**
 * Delivery policy: how many times to retry, and on what.
 *
 * Free of `server-only` and of any Resend import so the rules can be exercised directly.
 * `email.ts` supplies the real send function.
 */

export const MAX_RETRIES = 2;
export const RETRY_BASE_DELAY_MS = 400;

/**
 * Resend reports API failures in the result rather than by throwing. Its error shape is not
 * guaranteed to carry a status code, so it is read defensively rather than asserted.
 */
export interface SendResult {
  error?: unknown;
}

export function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const code = (error as { statusCode?: unknown }).statusCode;
  return typeof code === "number" ? code : undefined;
}

export type SendOutcome =
  { ok: true; attempts: number } | { ok: false; retryable: boolean; attempts: number };

export interface DeliverOptions {
  maxRetries?: number;
  /** Injectable so tests do not actually wait. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Sends once, retrying only for rate limits and transient server faults, and at most
 * `maxRetries` times.
 *
 * A rejected payload — 4xx other than 429 — is never retried, because it would be rejected
 * identically. A thrown error is treated as a transport failure and is retryable.
 *
 * The caller passes the same idempotency key on every attempt, so a retry for a send that
 * actually succeeded server-side cannot produce a second email.
 */
export async function deliverWithRetry(
  send: () => Promise<SendResult>,
  options: DeliverOptions = {},
): Promise<SendOutcome> {
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const sleep = options.sleep ?? defaultSleep;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const attempts = attempt + 1;
    let result: SendResult;

    try {
      result = await send();
    } catch {
      if (attempt < maxRetries) {
        await sleep(RETRY_BASE_DELAY_MS * attempts);
        continue;
      }
      return { ok: false, retryable: true, attempts };
    }

    if (!result.error) return { ok: true, attempts };

    const retryable = isRetryableStatus(statusCodeOf(result.error));
    if (retryable && attempt < maxRetries) {
      await sleep(RETRY_BASE_DELAY_MS * attempts);
      continue;
    }

    return { ok: false, retryable, attempts };
  }

  /* c8 ignore next */
  return { ok: false, retryable: true, attempts: maxRetries + 1 };
}
