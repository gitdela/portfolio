import { z } from "zod";

/** The three visible fields, plus the two security fields the visitor never sees. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(100, "That name is longer than 100 characters."),
  email: z.email("Please enter a valid email address.").max(254),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a sentence so I know what you need.")
    .max(5000, "That message is longer than 5000 characters."),
  turnstileToken: z.string().min(1, "Please complete the verification challenge."),
  // Honeypot: a real visitor never sees this field, so any value means a bot filled it.
  company: z.string().max(0).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactResult =
  | { status: "success" }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export const CONTACT_FIELD_NAMES = {
  name: "name",
  email: "email",
  message: "message",
  turnstileToken: "cf-turnstile-response",
  honeypot: "company",
} as const;
