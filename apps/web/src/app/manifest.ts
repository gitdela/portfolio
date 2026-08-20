import { siteSettingsQuery } from "@portfolio/sanity/queries";
import type { MetadataRoute } from "next";

import { loadPublishedQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await loadPublishedQuery(siteSettingsQuery, {}, [
    documentTypeTag("siteSettings"),
  ]);

  const name = settings?.siteName ?? "Portfolio";

  return {
    name,
    short_name: name,
    description: settings?.defaultDescription ?? settings?.tagline ?? "",
    start_url: "/",
    display: "standalone",
    // The accent purple, and the dark background the site defaults to.
    background_color: "#15141a",
    theme_color: "#4a3b8f",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
