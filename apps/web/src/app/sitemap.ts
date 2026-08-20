import { sitemapQuery } from "@portfolio/sanity/queries";
import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";
import { loadPublishedQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";

/** Fixed routes always present in code. `/blog?tag=` variants are never listed. */
const STATIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/work", priority: 0.9 },
  { path: "/blog", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
  { path: "/privacy", priority: 0.3 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await loadPublishedQuery(sitemapQuery, {}, [
    documentTypeTag("post"),
    documentTypeTag("project"),
  ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: route.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = data.posts
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === "string")
    .map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: "yearly",
      priority: 0.7,
    }));

  const caseStudyEntries: MetadataRoute.Sitemap = data.caseStudies
    .filter((entry): entry is typeof entry & { slug: string } => typeof entry.slug === "string")
    .map((entry) => ({
      url: `${siteUrl}/work/${entry.slug}`,
      lastModified: new Date(entry._updatedAt),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [...staticEntries, ...caseStudyEntries, ...postEntries];
}
