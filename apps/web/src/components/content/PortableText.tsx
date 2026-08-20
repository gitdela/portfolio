import { internalRoutePath } from "@portfolio/sanity/routes";
import Image from "next/image";
import Link from "next/link";
import {
  PortableText as BasePortableText,
  type PortableTextComponents,
  type PortableTextProps,
} from "next-sanity";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { imageAlt, imageDimensions, imageUrl, type SanityImageValue } from "@/lib/sanity/image";

/*
 * `PortableTextComponents` hands custom types and annotations through as `any`, so every
 * value is narrowed here before use rather than trusted.
 */

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

interface ExternalLinkValue {
  href?: unknown;
  openInNewTab?: unknown;
}
interface InternalLinkValue {
  destination?: unknown;
}
interface CodeBlockValue {
  code?: unknown;
  filename?: unknown;
}
interface CalloutValue {
  tone?: unknown;
  content?: unknown;
}

const CALLOUT_TONE_CLASS: Record<string, string> = {
  note: "border-line",
  tip: "border-accent",
  warning: "border-accent",
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="m-0 mt-[14px] first:mt-0">{children}</p>,
    // Body headings carry the same accent bar as section headings, at the 22px size the
    // handoff uses inside articles.
    h2: ({ children }) => (
      <div className="mt-9">
        <h2 className="m-0 mb-1 text-heading font-bold text-ink">{children}</h2>
        <div className="mb-[14px] h-[3px] w-[30px] bg-accent" />
      </div>
    ),
    h3: ({ children }) => <h3 className="mt-7 mb-2 text-lead-lg font-bold text-ink">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="my-7 border-l-[3px] border-accent pl-[18px] text-lead-lg text-ink italic">
        {children}
      </blockquote>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="mt-[14px] grid list-disc gap-2 pl-[18px]">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mt-[14px] grid list-decimal gap-2 pl-[18px]">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },

  marks: {
    code: ({ children }) => (
      <code className="rounded bg-chip px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
    ),

    externalLink: ({ children, value }) => {
      const link = value as ExternalLinkValue | undefined;
      const href = str(link?.href);
      if (!href) return <>{children}</>;

      // External links open in a new tab unless the editor turned that off.
      const newTab = link?.openInNewTab !== false;
      return (
        <a
          href={href}
          className="text-accent hover:underline"
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },

    internalLink: ({ children, value }) => {
      const link = value as InternalLinkValue | undefined;
      const destination = str(link?.destination);
      if (!destination) return <>{children}</>;
      return (
        <Link href={internalRoutePath(destination)} className="text-accent hover:underline">
          {children}
        </Link>
      );
    },
  },

  types: {
    accessibleImage: ({ value }) => {
      const image = value as SanityImageValue;
      if (!image.asset?._id) return null;

      const dimensions = imageDimensions(image);
      const lqip = str(image.asset.metadata?.lqip);

      return (
        <figure className="my-8">
          <Image
            src={imageUrl(image, 1360)}
            alt={imageAlt(image)}
            width={dimensions?.width ?? 1360}
            height={dimensions?.height ?? 765}
            sizes="(max-width: 720px) 100vw, 680px"
            className="h-auto w-full rounded-[14px]"
            {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
          />
          {image.caption ? (
            <figcaption className="mt-2 text-small text-soft">{image.caption}</figcaption>
          ) : null}
        </figure>
      );
    },

    codeBlock: ({ value }) => {
      const block = value as CodeBlockValue | undefined;
      const code = str(block?.code) ?? "";
      const filename = str(block?.filename);

      return (
        <figure className="my-7">
          {filename ? (
            <figcaption className="mb-1 text-micro font-bold tracking-wide text-soft uppercase">
              {filename}
            </figcaption>
          ) : null}
          <pre className="overflow-x-auto rounded-xl border border-line bg-card p-4 text-small">
            <code>{code}</code>
          </pre>
        </figure>
      );
    },

    callout: ({ value }) => {
      const block = value as CalloutValue | undefined;
      const tone = str(block?.tone) ?? "note";
      const content = str(block?.content) ?? "";

      return (
        <aside
          className={`my-7 rounded-xl border-l-[3px] bg-card px-5 py-4 ${CALLOUT_TONE_CLASS[tone] ?? "border-line"}`}
        >
          <p className="m-0">{content}</p>
        </aside>
      );
    },
  },
};

export function PortableText({ value }: { value: PortableTextProps["value"] }) {
  return <BasePortableText value={value} components={components} />;
}

/**
 * Single-paragraph copy with inline links, used for page introductions. Renders the same
 * marks but without headings, lists, or embedded blocks.
 */
export function InlineText({
  value,
  className = "",
}: {
  value: PortableTextProps["value"];
  className?: string;
}) {
  return (
    <div className={className}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}

export { SectionHeading };
