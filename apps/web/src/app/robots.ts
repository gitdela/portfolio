import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Preview and development deployments are excluded wholesale, so a Vercel preview URL
  // can never compete with production in the index.
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!isProduction) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes carry no indexable content, and the draft-mode endpoints must never
        // be followed by a crawler.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
