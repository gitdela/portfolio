import type { CaseStudyQueryResult, PostQueryResult } from "@portfolio/sanity/types";
import { stegaClean } from "next-sanity";

/**
 * Structured data builders.
 *
 * Every value that reaches these builders is passed through `stegaClean` first: under Draft
 * Mode, strings carry invisible stega characters that would end up inside the JSON-LD and
 * make it invalid to a crawler.
 */

function clean(value: string | null | undefined): string | undefined {
  const cleaned = stegaClean(value);
  return typeof cleaned === "string" && cleaned.length > 0 ? cleaned : undefined;
}

export interface PersonInput {
  fullName: string | null | undefined;
  role: string | null | undefined;
  socialUrls: (string | null | undefined)[];
  siteUrl: string;
}

export function personJsonLd({ fullName, role, socialUrls, siteUrl }: PersonInput) {
  const sameAs = socialUrls.map(clean).filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: clean(fullName),
    jobTitle: clean(role),
    url: siteUrl,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function webSiteJsonLd({
  siteName,
  description,
  siteUrl,
}: {
  siteName: string | null | undefined;
  description: string | null | undefined;
  siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: clean(siteName),
    description: clean(description),
    url: siteUrl,
  };
}

export function blogPostingJsonLd({
  post,
  slug,
  siteUrl,
  imageUrl,
}: {
  post: NonNullable<PostQueryResult>;
  slug: string;
  siteUrl: string;
  imageUrl?: string | undefined;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: clean(post.title),
    description: clean(post.standfirst),
    datePublished: clean(post.publishedAt),
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}/blog/${slug}` },
    url: `${siteUrl}/blog/${slug}`,
    ...(post.author?.fullName
      ? { author: { "@type": "Person", name: clean(post.author.fullName) } }
      : {}),
    ...(post.category?.title ? { articleSection: clean(post.category.title) } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
  };
}

export function caseStudyJsonLd({
  project,
  slug,
  siteUrl,
}: {
  project: NonNullable<CaseStudyQueryResult>;
  slug: string;
  siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: clean(project.title),
    headline: clean(project.caseStudy?.headline),
    description: clean(project.summary),
    url: `${siteUrl}/work/${slug}`,
    ...(project.stack?.length
      ? { keywords: project.stack.map(clean).filter(Boolean).join(", ") }
      : {}),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: clean(crumb.name),
      item: `${siteUrl}${crumb.path}`,
    })),
  };
}
