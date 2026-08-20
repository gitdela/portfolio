import {
  formatEnvIssues,
  normalizeSiteUrl,
  publicEnvSchema,
  serverEnvSchema,
  type ServerEnv,
} from "./env-schema";

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

const parsedPublic = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  NEXT_PUBLIC_SANITY_API_HOST: process.env.NEXT_PUBLIC_SANITY_API_HOST,
});

if (!parsedPublic.success) {
  throw new Error(
    `Invalid public environment configuration:\n${formatEnvIssues(parsedPublic.error)}`,
  );
}

export const publicEnv = parsedPublic.data;

/**
 * The canonical origin, always derived from configuration rather than from an incidental
 * deployment URL.
 */
export const siteUrl = normalizeSiteUrl(publicEnv.NEXT_PUBLIC_SITE_URL);

let cachedServerEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called from client code. Server secrets stay on the server.");
  }
  if (cachedServerEnv) return cachedServerEnv;

  const parsed = serverEnvSchema.safeParse({
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_REVALIDATE_SECRET: process.env.SANITY_REVALIDATE_SECRET,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  });

  if (!parsed.success) {
    throw new Error(`Invalid server environment configuration:\n${formatEnvIssues(parsed.error)}`);
  }

  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}
