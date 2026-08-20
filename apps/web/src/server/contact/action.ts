"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { sendContactEmail } from "./email";
import { CONTACT_FIELD_NAMES, contactSchema, type ContactResult } from "./schema";
import { verifyTurnstile } from "./turnstile";

const GENERIC_ERROR = "Something went wrong sending that. Please try again.";

function clientIp(headerList: Headers): string | null {
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? null;
}

/**
 * Handles a contact submission.
 *
 * Ordering matters: the honeypot and the payload are checked before Turnstile so obvious
 * junk never costs a verification round trip, and the email is only sent once both the
 * payload and the challenge have passed.
 *
 * Failures are reported to the visitor in general terms. Message bodies, addresses, tokens,
 * and keys are never logged.
 */
export async function submitContactForm(
  _previous: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const honeypot = formData.get(CONTACT_FIELD_NAMES.honeypot);

  // A bot filled the hidden field. Report success so it learns nothing, and send nothing.
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { status: "success" };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get(CONTACT_FIELD_NAMES.name),
    email: formData.get(CONTACT_FIELD_NAMES.email),
    message: formData.get(CONTACT_FIELD_NAMES.message),
    turnstileToken: formData.get(CONTACT_FIELD_NAMES.turnstileToken),
    company: honeypot ?? "",
  });

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const headerList = await headers();
  const verified = await verifyTurnstile(parsed.data.turnstileToken, clientIp(headerList));

  if (!verified) {
    return {
      status: "error",
      message: "That verification did not go through. Please try again.",
    };
  }

  const outcome = await sendContactEmail({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (!outcome.ok) {
    return { status: "error", message: GENERIC_ERROR };
  }

  return { status: "success" };
}
