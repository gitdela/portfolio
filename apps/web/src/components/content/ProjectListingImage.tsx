import Image from "next/image";

import { hasImage, imageAlt, imageUrl, type SanityImageValue } from "@/lib/sanity/image";

const IMAGE_CLASS = {
  card: "aspect-video w-full object-cover",
  standalone: "mb-5 aspect-video w-full rounded-xl object-cover",
} as const;

export function ProjectListingImage({
  image,
  variant,
}: {
  image: SanityImageValue | null | undefined;
  variant: keyof typeof IMAGE_CLASS;
}) {
  if (!hasImage(image) || !image) return null;

  return (
    <Image
      src={imageUrl(image, 1280, 720)}
      alt={imageAlt(image)}
      width={1280}
      height={720}
      sizes="(max-width: 680px) calc(100vw - 36px), 624px"
      className={IMAGE_CLASS[variant]}
      {...(image.asset?.metadata?.lqip
        ? { placeholder: "blur" as const, blurDataURL: image.asset.metadata.lqip }
        : {})}
    />
  );
}
