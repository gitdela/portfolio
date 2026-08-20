import { siteSettingsQuery } from "@portfolio/sanity/queries";
import type { SiteSettingsQueryResult } from "@portfolio/sanity/types";
import type { Metadata } from "next";

import { siteUrl } from "@/lib/env";
import { hasImage, imageAlt, imageUrl, type SanityImageValue } from "@/lib/sanity/image";
import { loadPublishedQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";

const SETTINGS_TAGS = [documentTypeTag("siteSettings"), documentTypeTag("profile")];

/**
 * Metadata always reads the published perspective with stega disabled. Stega's invisible
 * characters are harmless in visible copy but corrupt titles, descriptions, and URLs.
 */
async function loadSettings(): Promise<SiteSettingsQueryResult> {
  return loadPublishedQuery(siteSettingsQuery, {}, SETTINGS_TAGS);
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function socialImage(image: SanityImageValue | null | undefined) {
  if (!hasImage(image) || !image) return null;
  return {
    url: imageUrl(image, OG_WIDTH, OG_HEIGHT),
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt: imageAlt(image),
  };
}

export async function buildRootMetadata(): Promise<Metadata> {
  const settings = await loadSettings();

  const title = settings?.defaultTitle ?? settings?.siteName ?? "Portfolio";
  const description = settings?.defaultDescription ?? settings?.tagline ?? "";
  const template = settings?.titleTemplate ?? "%s";
  const image = socialImage(settings?.defaultSocialImage);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template },
    description,
    alternates: { canonical: "/", types: { "application/rss+xml": `${siteUrl}/rss.xml` } },
    openGraph: {
      type: "website",
      siteName: settings?.siteName ?? title,
      title,
      description,
      url: siteUrl,
      locale: "en",
      ...(image ? { images: [image] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image.url] } : {}),
    },
    // Preview deployments must never be indexed; only the canonical production origin is.
    robots:
      process.env.VERCEL_ENV === "production"
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export interface PageSeoInput {
  /** The document's own SEO override — the top of the cascade. */
  seo?: {
    title?: string | null;
    description?: string | null;
    noIndex?: boolean | null;
    image?: SanityImageValue | null;
  } | null;
  /** The document's natural title, used when there is no override. */
  title?: string | null;
  /** The document's excerpt or standfirst. */
  description?: string | null;
  /** The document's own cover image. */
  image?: SanityImageValue | null;
  /** Absolute path, for the canonical URL. */
  path: string;
  type?: "website" | "article";
  publishedTime?: string | null;
}

/**
 * Resolves metadata down the cascade the plan specifies:
 * page or document SEO override → document title, excerpt, and cover → siteSettings defaults.
 */
export async function buildPageMetadata(input: PageSeoInput): Promise<Metadata> {
  const settings = await loadSettings();

  const title = input.seo?.title ?? input.title ?? settings?.defaultTitle ?? settings?.siteName;
  const description =
    input.seo?.description ?? input.description ?? settings?.defaultDescription ?? "";

  const image =
    socialImage(input.seo?.image) ??
    socialImage(input.image) ??
    socialImage(settings?.defaultSocialImage);

  const canonical = input.path.startsWith("/") ? input.path : `/${input.path}`;
  const noIndex = input.seo?.noIndex === true || process.env.VERCEL_ENV !== "production";

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical },
    openGraph: {
      type: input.type ?? "website",
      ...(title ? { title } : {}),
      description,
      url: `${siteUrl}${canonical}`,
      ...(image ? { images: [image] } : {}),
      ...(input.type === "article" && input.publishedTime
        ? { publishedTime: input.publishedTime }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      description,
      ...(image ? { images: [image.url] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
