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
// Sanity. Production also bypasses Sanity's CDN because Next caches these queries itself;
// after a webhook invalidation, the first regeneration must read the new origin value
// rather than repopulating Next's cache with a briefly stale CDN response.
const apiHost = publicEnv.NEXT_PUBLIC_SANITY_API_HOST;

export const client = createClient({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: publicEnv.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  perspective: "published",
  // studioUrl only anchors click-to-edit links. With stega off it does nothing, so an
  // unset Studio URL is not a reason to fail a build.
  stega: publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL
    ? { enabled: false, studioUrl: publicEnv.NEXT_PUBLIC_SANITY_STUDIO_URL }
    : { enabled: false },
  ...(apiHost ? { apiHost } : {}),
});
