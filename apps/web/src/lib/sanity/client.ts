import { createClient } from "next-sanity";

import { publicEnv } from "@/lib/env";

/**
 * The public client. Always reads the published perspective, so a native Sanity draft can
 * never leak onto the live site.
 *
 * Stega is enabled only under Draft Mode, and even then it is disabled per-call for any
 * value that is not display text — see `sanityFetch`.
 */
export const client = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: true,
  perspective: "published",
  stega: { enabled: false, studioUrl: publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL },
});
