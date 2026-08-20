import { blogPageQuery } from "@portfolio/sanity/queries";
import type { BlogPageQueryResult } from "@portfolio/sanity/types";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { BlogList, type BlogListPost, type BlogListTag } from "@/components/blog/BlogList";
import { InlineText } from "@/components/content/PortableText";
import { PageMain } from "@/components/ui/primitives";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TAGS = [
  documentTypeTag("blogPage"),
  documentTypeTag("post"),
  documentTypeTag("tag"),
  documentTypeTag("category"),
];

async function load(): Promise<BlogPageQueryResult> {
  return loadQuery(blogPageQuery, {}, TAGS);
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  return buildPageMetadata({
    seo: page?.seo ?? null,
    title: page?.heading?.replace(/\.$/, "") ?? "Writing",
    // Every ?tag= variant canonicalizes to /blog — filtered views are UI state, not
    // indexable archives. Dedicated /blog/tag/[slug] routes are the answer if those are
    // ever wanted.
    path: "/blog",
  });
}

export default async function BlogPage() {
  const { page, posts, tags } = await load();

  const featured = page?.featuredPost;

  const listTags: BlogListTag[] = tags
    .filter((tag): tag is typeof tag & { slug: string } => typeof tag.slug === "string")
    .map((tag) => ({ slug: tag.slug, title: tag.title ?? tag.slug }));

  const listPosts: BlogListPost[] = posts
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === "string")
    .map((post) => ({
      id: post._id,
      slug: post.slug,
      title: post.title ?? "Untitled",
      standfirst: post.standfirst ?? null,
      categoryTitle: post.category?.title ?? null,
      tags: (post.tags ?? [])
        .filter((tag): tag is typeof tag & { slug: string } => typeof tag.slug === "string")
        .map((tag) => ({ slug: tag.slug, title: tag.title ?? tag.slug })),
    }));

  return (
    <PageMain>
      <h1 className="text-page-title m-0">{page?.heading}</h1>
      {page?.intro ? <InlineText value={page.intro} className="mt-3 text-lead text-muted" /> : null}

      {featured?.slug ? (
        <Link
          href={`/blog/${featured.slug}` as Route}
          className="mt-9 block rounded-2xl bg-accent p-[clamp(22px,4vw,32px)] text-bg no-underline hover:no-underline"
        >
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-badge font-bold tracking-[0.06em] uppercase">
            <span className="rounded-full bg-bg px-3 py-[3px] text-accent">Featured</span>
            {featured.category?.title ? (
              <span className="opacity-75">{featured.category.title}</span>
            ) : null}
          </div>

          <h2 className="text-feature-title mt-3.5 mb-0">{featured.title}</h2>

          {featured.standfirst ? (
            <p className="mt-2.5 mb-0 max-w-[52ch] text-body opacity-85">{featured.standfirst}</p>
          ) : null}

          <span className="mt-4 inline-block text-nav font-bold">Read the post →</span>
        </Link>
      ) : null}

      {listPosts.length > 0 ? (
        <BlogList
          posts={listPosts}
          tags={listTags}
          emptyMessage={page?.emptyStateMessage ?? "No posts with that tag yet."}
        />
      ) : (
        <p className="mt-10 text-soft italic">No posts published yet.</p>
      )}
    </PageMain>
  );
}
