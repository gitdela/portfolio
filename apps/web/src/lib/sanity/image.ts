import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { stegaClean } from "next-sanity";

import { publicEnv } from "@/lib/env";

const builder = createImageUrlBuilder({
  projectId: publicEnv.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publicEnv.NEXT_PUBLIC_SANITY_DATASET,
});

/**
 * The shape every image projection returns. Alt text is required by the schema unless the
 * image is explicitly decorative.
 */
export interface SanityImageValue {
  asset?: {
    _id: string;
    url: string | null;
    metadata?: {
      dimensions?: { width: number | null; height: number | null } | null;
      lqip?: string | null;
    } | null;
  } | null;
  hotspot?: { x?: number | null; y?: number | null } | null;
  crop?: unknown;
  alt?: string | null;
  decorative?: boolean | null;
  caption?: string | null;
}

/**
 * Builds a CDN URL, preserving the crop and hotspot the editor set.
 *
 * `stegaClean` runs first: under Draft Mode the asset reference carries invisible stega
 * characters, which would produce a broken URL.
 */
export function imageUrl(source: SanityImageSource, width: number, height?: number): string {
  const b = builder.image(stegaClean(source)).width(width).auto("format").fit("crop");
  return (height ? b.height(height) : b).url();
}

/** Intrinsic dimensions from asset metadata, for the explicit width/height `next/image` wants. */
export function imageDimensions(
  image: SanityImageValue | null | undefined,
): { width: number; height: number } | null {
  const width = image?.asset?.metadata?.dimensions?.width;
  const height = image?.asset?.metadata?.dimensions?.height;
  if (typeof width !== "number" || typeof height !== "number") return null;
  return { width, height };
}

/**
 * Alt text for rendering. A decorative image gets an empty string, which is what removes
 * it from the accessibility tree — not a missing attribute.
 */
export function imageAlt(image: SanityImageValue | null | undefined): string {
  if (image?.decorative) return "";
  return stegaClean(image?.alt) ?? "";
}

export function hasImage(image: SanityImageValue | null | undefined): boolean {
  return Boolean(image?.asset?._id);
}
