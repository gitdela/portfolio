import type { ClientReturn, QueryParams } from "@sanity/client";
import { draftMode } from "next/headers";

import { client } from "./client";
import { liveFetch } from "./live";

/**
 * The single read path for every page.
 *
 * Under Draft Mode it goes through Sanity Live so editors see unpublished changes and get
 * click-to-edit overlays, with stega encoding on. Otherwise it reads the published
 * perspective with stega off and explicit cache tags, which is what the revalidation
 * webhook invalidates.
 *
 * Stega inserts invisible characters into strings. That is harmless in display copy and
 * corrupting everywhere else, so callers that feed metadata, canonical URLs, JSON-LD,
 * slugs, or image URLs must use `loadPublishedQuery` instead — see `stegaClean` usage at
 * those call sites.
 */
export async function loadQuery<const Q extends string>(
  query: Q,
  params: QueryParams,
  tags: string[],
): Promise<ClientReturn<Q, unknown>> {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode) {
    const { data } = await liveFetch({ query, params });
    return data as ClientReturn<Q, unknown>;
  }

  return loadPublishedQuery(query, params, tags);
}

/**
 * Always reads published content with stega disabled, regardless of Draft Mode.
 *
 * Use for anything that is not rendered as visible text: `generateMetadata`, JSON-LD,
 * sitemap and RSS output, and `generateStaticParams`.
 */
export async function loadPublishedQuery<const Q extends string>(
  query: Q,
  params: QueryParams,
  tags: string[],
): Promise<ClientReturn<Q, unknown>> {
  return client.fetch(query, params, {
    perspective: "published",
    stega: false,
    next: { tags },
  });
}
