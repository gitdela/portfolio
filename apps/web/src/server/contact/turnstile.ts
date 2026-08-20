import "server-only";

import { serverEnv } from "@/lib/env";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 5000;

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

/**
 * Server-side verification of the Turnstile token. A token that fails, expires, or is
 * replayed is rejected here — the client-side widget is not evidence of anything on its own.
 *
 * The token itself is never logged.
 */
export async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  const body = new URLSearchParams({
    secret: serverEnv().TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) return false;

    const result = (await response.json()) as TurnstileResponse;
    return result.success;
  } catch {
    // A network failure or timeout is treated as a failed challenge rather than a pass.
    return false;
  }
}
