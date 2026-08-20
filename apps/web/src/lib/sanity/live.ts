import { defineLive } from "next-sanity/live";

import { serverEnv } from "@/lib/env";

import { client } from "./client";

/**
 * Drives the editor preview experience only. Production reads go through `loadQuery`,
 * which uses explicit cache tags so invalidation stays deterministic rather than depending
 * on a live socket.
 *
 * The read token is Viewer-scoped. `browserToken` is what lets the Presentation tool stream
 * draft edits into the iframe in real time; next-sanity only sends it once Draft Mode is
 * enabled, which itself requires a valid preview secret.
 */
export const { sanityFetch: liveFetch, SanityLive } = defineLive({
  client,
  serverToken: serverEnv().SANITY_API_READ_TOKEN,
  browserToken: serverEnv().SANITY_API_READ_TOKEN,
});
