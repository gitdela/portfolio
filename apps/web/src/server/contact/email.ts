import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

import { deliverWithRetry, type SendOutcome } from "./delivery";
import { buildBodies, idempotencyKey, type MessageInput } from "./message";

export type { SendOutcome };

/**
 * Sends exactly one transactional email.
 *
 * The retry rules live in `delivery.ts`; this wires Resend, the environment, and the
 * idempotency key into them. Resend reports API failures through `{ data, error }` rather
 * than by throwing, which `deliverWithRetry` inspects explicitly.
 *
 * Nothing about the submission — address, subject, or body — is ever logged.
 */
export async function sendContactEmail(input: MessageInput): Promise<SendOutcome> {
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const { text, html } = buildBodies(input);

  // The same key on every attempt: Resend deduplicates on it for 24 hours, so a retry for
  // a send that actually succeeded cannot produce a second email.
  const key = idempotencyKey(input);

  return deliverWithRetry(() =>
    resend.emails.send(
      {
        from: env.RESEND_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        replyTo: input.email,
        subject: `Portfolio inquiry from ${input.name}`,
        text,
        html,
        // Transactional mail: no open or click tracking, so no pixels or rewritten links.
        tags: [{ name: "source", value: "contact-form" }],
      },
      { idempotencyKey: key },
    ),
  );
}
