import { postQuery, postSlugsQuery, siteSettingsQuery } from "@portfolio/sanity/queries";
import { internalRoutePath } from "@portfolio/sanity/routes";
import type { PostQueryResult } from "@portfolio/sanity/types";
import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PortableText } from "@/components/content/PortableText";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageMain, PrimaryPill } from "@/components/ui/primitives";
import { siteUrl } from "@/lib/env";
import { formatPostDate, formatReadingTime } from "@/lib/reading-time";
import { hasImage, imageUrl } from "@/lib/sanity/image";
import { loadPublishedQuery, loadQuery } from "@/lib/sanity/loadQuery";
import { documentIdTag, documentTypeTag } from "@/lib/sanity/tags";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function load(slug: string): Promise<PostQueryResult> {
  return loadQuery(postQuery, { slug }, [documentTypeTag("post"), documentIdTag(slug)]);
}

export async function generateStaticParams() {
  const slugs = await loadPublishedQuery(postSlugsQuery, {}, [documentTypeTag("post")]);

  return slugs.filter((slug): slug is string => typeof slug === "string").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) return {};

  return buildPageMetadata({
    seo: post.seo ?? null,
    title: post.title ?? null,
    description: post.standfirst ?? null,
    image: post.socialImage ?? post.coverImage ?? null,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.publishedAt ?? null,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await load(slug);

  if (!post) notFound();

  const settings = await loadPublishedQuery(siteSettingsQuery, {}, [
    documentTypeTag("siteSettings"),
  ]);

  const publishedDate = formatPostDate(post.publishedAt);
  const social = post.socialImage ?? post.coverImage;
  const cta = settings?.footerCta;

  return (
    <PageMain>
      <JsonLd
        data={[
          blogPostingJsonLd({
            post,
            slug,
            siteUrl,
            ...(hasImage(social) && social ? { imageUrl: imageUrl(social, 1200, 630) } : {}),
          }),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: post.title ?? "Post", path: `/blog/${slug}` },
            ],
            siteUrl,
          ),
        ]}
      />

      <Link href="/blog" className="text-small font-bold text-accent hover:underline">
        ← All posts
      </Link>

      <header className="mt-[18px]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-eyebrow font-bold tracking-[0.05em] text-accent uppercase">
          {post.category?.title ? <span>{post.category.title}</span> : null}
          <span className="font-normal tracking-normal text-soft normal-case">
            {[publishedDate, formatReadingTime(post.body)].filter(Boolean).join(" · ")}
          </span>
        </div>

        {post.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((tag) =>
              tag.slug ? (
                <Link
                  key={tag._id}
                  href={`/blog?tag=${tag.slug}` as Route}
                  className="rounded-full bg-chip px-[11px] py-[3px] text-micro font-semibold text-muted hover:text-accent hover:no-underline"
                >
                  {tag.title}
                </Link>
              ) : null,
            )}
          </div>
        ) : null}

        <h1 className="text-page-title mt-2.5 mb-0">{post.title}</h1>

        {post.standfirst ? (
          <p className="mt-3.5 mb-0 text-lead-lg text-muted">{post.standfirst}</p>
        ) : null}
      </header>

      <article className="mt-11 text-lead text-muted">
        <PortableText value={post.body ?? []} />
      </article>

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <Link href="/blog" className="text-body-sm font-bold text-accent hover:underline">
          ← All posts
        </Link>
        {cta?.label ? (
          <PrimaryPill href={internalRoutePath(cta.destination)} className="text-body-sm">
            {cta.label}
          </PrimaryPill>
        ) : null}
      </div>
    </PageMain>
  );
}
