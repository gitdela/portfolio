import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

import { buildBodies, idempotencyKey, isRetryableStatus, type MessageInput } from "./message";

const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 400;

export type SendOutcome = { ok: true } | { ok: false; retryable: boolean };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends exactly one transactional email.
 *
 * Resend reports API failures through `{ data, error }` rather than by throwing, so the
 * result is inspected explicitly rather than assumed to have succeeded. Retries are bounded
 * at two and only for rate limits and 5xx — a rejected payload is not retried, because it
 * would be rejected again.
 *
 * Nothing about the submission — address, subject, or body — is ever logged.
 */
export async function sendContactEmail(input: MessageInput): Promise<SendOutcome> {
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const { text, html } = buildBodies(input);
  const key = idempotencyKey(input);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    let result;
    try {
      result = await resend.emails.send(
        {
          from: env.RESEND_FROM_EMAIL,
          to: env.CONTACT_TO_EMAIL,
          replyTo: input.email,
          subject: `Portfolio inquiry from ${input.name}`,
          text,
          html,
          tags: [{ name: "source", value: "contact-form" }],
        },
        { idempotencyKey: key },
      );
    } catch {
      // A thrown error is a transport failure rather than an API rejection.
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
        continue;
      }
      return { ok: false, retryable: true };
    }

    if (!result.error) return { ok: true };

    const statusCode = (result.error as { statusCode?: number }).statusCode;
    if (isRetryableStatus(statusCode) && attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
      continue;
    }

    return { ok: false, retryable: isRetryableStatus(statusCode) };
  }

  return { ok: false, retryable: true };
}
