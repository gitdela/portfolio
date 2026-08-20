import { z } from "zod";

/**
 * Environment is parsed in two halves.
 *
 * Public values are read through explicit `process.env.NEXT_PUBLIC_*` property access so
 * Next.js can inline them into the client bundle — destructuring or bracket access would
 * defeat that substitution and ship an undefined value to the browser.
 *
 * Server values are only ever read on the server; `serverEnv()` throws if it is reached
 * from client code.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url({ error: "NEXT_PUBLIC_SITE_URL must be an absolute URL." }),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a dated API version, for example 2026-08-01."),
  NEXT_PUBLIC_SANITY_STUDIO_URL: z.url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  // Development escape hatch: points the Sanity client at a local stand-in so the site can
  // run without a real project. Unset in every real environment.
  NEXT_PUBLIC_SANITY_API_HOST: z.url().optional(),
});

const serverSchema = z.object({
  SANITY_API_READ_TOKEN: z.string().min(1),
  SANITY_REVALIDATE_SECRET: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email(),
  CONTACT_TO_EMAIL: z.email(),
});

function format(error: z.ZodError): string {
  return error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_SANITY_API_HOST: process.env.NEXT_PUBLIC_SANITY_API_HOST,
});

if (!parsedPublic.success) {
  throw new Error(`Invalid public environment configuration:\n${format(parsedPublic.error)}`);
}

export const publicEnv = parsedPublic.data;

/**
 * The canonical origin, always derived from configuration rather than from an incidental
 * deployment URL, and without a trailing slash so callers can concatenate paths safely.
 */
export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

export function serverEnv(): z.infer<typeof serverSchema> {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called from client code. Server secrets stay on the server.");
  }
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverSchema.safeParse({
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  });

  if (!parsed.success) {
    throw new Error(`Invalid server environment configuration:\n${format(parsed.error)}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}
