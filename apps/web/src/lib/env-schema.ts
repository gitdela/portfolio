import { z } from "zod";

/**
 * Environment schemas, kept free of side effects so they can be exercised directly.
 *
 * `env.ts` is the module that actually validates at startup and throws; importing that one
 * from a test would trip its module-scope parse before the test could set anything up.
 */

export const publicEnvSchema = z.object({
  // Optional here because a first deployment cannot know its own URL yet; `resolveSiteUrl`
  // below decides the canonical origin and throws if it cannot find one.
  NEXT_PUBLIC_SITE_URL: z
    .url({ error: "NEXT_PUBLIC_SITE_URL must be an absolute URL." })
    .optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a dated API version, for example 2026-08-01."),
  // Only used to anchor stega click-to-edit links, which are inert unless Draft Mode is on.
  NEXT_PUBLIC_SANITY_STUDIO_URL: z.url().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  // Development escape hatch: points the Sanity client at a local stand-in so the site can
  // run without a real project. Unset in every real environment.
  NEXT_PUBLIC_SANITY_API_HOST: z.url().optional(),
});

export const serverEnvSchema = z.object({
  SANITY_API_READ_TOKEN: z.string().min(1),
  SANITY_REVALIDATE_SECRET: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.email(),
  CONTACT_TO_EMAIL: z.email(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Renders validation failures as one message per offending variable. */
export function formatEnvIssues(error: z.ZodError): string {
  return error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n");
}

/**
 * Normalizes a configured origin: no trailing slash, so callers can concatenate paths
 * without producing a double slash.
 */
export function normalizeSiteUrl(value: string): string {
  return value.replace(/\/+$/, "");
}

export interface SiteUrlSources {
  /** NEXT_PUBLIC_SITE_URL. Always wins when set. */
  explicit?: string | undefined;
  /**
   * Vercel's VERCEL_PROJECT_PRODUCTION_URL: the project's stable production domain.
   *
   * Deliberately not VERCEL_URL, which changes on every deployment. Plan §4 forbids
   * deriving the canonical origin from an incidental preview URL, and this is not one —
   * it is the same value for every deployment of the project.
   */
  vercelProductionUrl?: string | undefined;
}

/**
 * Decides the canonical origin.
 *
 * The explicit setting always wins, so a custom domain overrides everything. Falling back
 * to Vercel's production domain is what lets a first deployment build before anyone knows
 * its URL; without it there is a deadlock, because the value only exists after a
 * successful deploy.
 */
export function resolveSiteUrl(sources: SiteUrlSources): string {
  if (sources.explicit) return normalizeSiteUrl(sources.explicit);

  if (sources.vercelProductionUrl) {
    const host = sources.vercelProductionUrl.replace(/^https?:\/\//, "");
    return normalizeSiteUrl(`https://${host}`);
  }

  throw new Error(
    "Cannot determine the canonical origin. Set NEXT_PUBLIC_SITE_URL to the site's absolute URL.",
  );
}
