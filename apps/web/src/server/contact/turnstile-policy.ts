/**
 * Turnstile verification policy, deliberately free of `server-only` and of environment
 * access so it can be exercised directly. `turnstile.ts` supplies the secret and the real
 * `fetch`.
 */

export const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
export const TURNSTILE_TIMEOUT_MS = 5000;

export interface TurnstileResponse {
  success?: unknown;
  "error-codes"?: unknown;
}

/**
 * The minimal contract this needs. Narrower than `typeof fetch` on purpose: the global
 * carries runtime-specific extras (Bun adds `preconnect`) that a caller supplying a stub
 * has no reason to implement.
 */
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface VerifyDeps {
  secret: string;
  fetchImpl: FetchLike;
  timeoutMs?: number;
}

/**
 * Cloudflare returns `{ success: boolean }`. Anything else — a non-boolean, a missing
 * field, a malformed body — is treated as a failed challenge rather than a pass.
 */
export function isVerified(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  return (body as TurnstileResponse).success === true;
}

/**
 * Verifies a token against Cloudflare.
 *
 * Every failure mode resolves to `false` rather than throwing: a non-2xx response, a
 * malformed body, a network error, or a timeout. A challenge that cannot be confirmed is
 * not a challenge that passed, and the caller should not have to distinguish "failed" from
 * "could not check" — both mean do not send the email.
 *
 * The token is never logged.
 */
export async function verifyTurnstileWith(
  deps: VerifyDeps,
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({ secret: deps.secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await deps.fetchImpl(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(deps.timeoutMs ?? TURNSTILE_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) return false;
    return isVerified(await response.json());
  } catch {
    return false;
  }
}
