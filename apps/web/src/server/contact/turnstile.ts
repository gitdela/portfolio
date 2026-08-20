import "server-only";

import { serverEnv } from "@/lib/env";

import { verifyTurnstileWith } from "./turnstile-policy";

/**
 * Server-side verification of the Turnstile token. A token that fails, expires, or is
 * replayed is rejected here — the client-side widget is not evidence of anything on its own.
 *
 * The policy lives in `turnstile-policy.ts`; this only supplies the secret and the real
 * `fetch`.
 */
export async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  return verifyTurnstileWith(
    { secret: serverEnv().TURNSTILE_SECRET_KEY, fetchImpl: fetch },
    token,
    remoteIp,
  );
}
