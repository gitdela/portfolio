import { rssQuery } from "@portfolio/sanity/queries";

import { siteUrl } from "@/lib/env";
import { loadPublishedQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";

/** XML text nodes and attributes cannot carry raw `&`, `<`, or `>`. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const data = await loadPublishedQuery(rssQuery, {}, [
    documentTypeTag("post"),
    documentTypeTag("siteSettings"),
    documentTypeTag("profile"),
  ]);

  const title = data.settings?.siteName ?? "Portfolio";
  const description = data.settings?.defaultDescription ?? "";
  const author = data.profile?.fullName ?? "";

  const items = data.posts
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === "string")
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return [
        "    <item>",
        `      <title>${escapeXml(post.title ?? "Untitled")}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        post.standfirst ? `      <description>${escapeXml(post.standfirst)}</description>` : null,
        post.category?.title
          ? `      <category>${escapeXml(post.category.title)}</category>`
          : null,
        author ? `      <dc:creator>${escapeXml(author)}</dc:creator>` : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(siteUrl)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    "    <language>en</language>",
    `    <atom:link href="${escapeXml(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
