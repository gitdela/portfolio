import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { serverEnv } from "@/lib/env";
import { client } from "@/lib/sanity/client";

/**
 * Presentation sends a single-use preview secret here. `defineEnableDraftMode` validates it
 * against the dataset before setting the Draft Mode cookie, so the endpoint cannot be used
 * to reach draft content by simply visiting the URL.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: serverEnv().SANITY_API_READ_TOKEN }),
});
