import { createClient } from "next-sanity";

import { publicEnv } from "@/lib/env";

/**
 * The public client. Always reads the published perspective, so a native Sanity draft can
 * never leak onto the live site.
 *
 * Stega is enabled only under Draft Mode, and even then it is disabled per-call for any
 * value that is not display text — see `loadQuery`.
 */

// When NEXT_PUBLIC_SANITY_API_HOST is set, the client talks to a local stand-in instead of
// Sanity. That also means bypassing the CDN, which only exists in front of the real API.
const apiHost = publicEnv.NEXT_PUBLIC_SANITY_API_HOST;

export const client = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: !apiHost,
  perspective: "published",
  stega: { enabled: false, studioUrl: publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL },
  ...(apiHost ? { apiHost } : {}),
});
