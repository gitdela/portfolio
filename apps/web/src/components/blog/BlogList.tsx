"use client";

import type { Route } from "next";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

export const ALL_TAG = "all";

export interface BlogListTag {
  slug: string;
  title: string;
}

export interface BlogListPost {
  id: string;
  slug: string;
  title: string;
  standfirst: string | null;
  categoryTitle: string | null;
  tags: BlogListTag[];
}

export interface BlogListProps {
  posts: BlogListPost[];
  tags: BlogListTag[];
  emptyMessage: string;
}

const PILL_BASE =
  "cursor-pointer rounded-full border-[1.5px] px-[14px] py-[5px] text-eyebrow font-bold transition-colors";

export function BlogList({ posts, tags, emptyMessage }: BlogListProps) {
  // The parser only accepts slugs that currently exist, so a stale or hand-edited ?tag=
  // falls back to "All" instead of showing an empty list.
  const allowed = useMemo(() => [ALL_TAG, ...tags.map((tag) => tag.slug)] as const, [tags]);

  const [activeTag, setActiveTag] = useQueryState(
    "tag",
    parseAsStringLiteral(allowed).withDefault(ALL_TAG).withOptions({
      history: "replace",
      clearOnDefault: true,
      scroll: false,
      shallow: true,
    }),
  );

  const visiblePosts = useMemo(
    () =>
      activeTag === ALL_TAG
        ? posts
        : posts.filter((post) => post.tags.some((tag) => tag.slug === activeTag)),
    [posts, activeTag],
  );

  const select = (slug: string) => {
    void setActiveTag(slug === ALL_TAG ? null : slug);
  };

  return (
    <>
      <div className="mt-9 flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
        {[{ slug: ALL_TAG, title: "All" }, ...tags].map((tag) => {
          const isActive = tag.slug === activeTag;
          return (
            <button
              key={tag.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                select(tag.slug);
              }}
              className={`${PILL_BASE} ${
                isActive
                  ? "border-accent bg-accent text-bg"
                  : "border-line bg-card text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {tag.title}
            </button>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8">
        {visiblePosts.map((post) => (
          <article key={post.id} className="border-b border-line pb-7">
            {post.categoryTitle ? (
              <span className="text-eyebrow font-bold tracking-[0.05em] text-accent uppercase">
                {post.categoryTitle}
              </span>
            ) : null}

            <h2 className="mt-1.5 mb-0 text-heading font-bold">
              <Link href={`/blog/${post.slug}` as Route} className="text-ink hover:underline">
                {post.title}
              </Link>
            </h2>

            {post.standfirst ? (
              <p className="mt-2 mb-0 text-body-sm text-muted">{post.standfirst}</p>
            ) : null}

            {post.tags.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => {
                      select(tag.slug);
                    }}
                    className="cursor-pointer rounded-full bg-chip px-[11px] py-[3px] text-micro font-semibold text-muted transition-colors hover:text-accent"
                  >
                    {tag.title}
                  </button>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {visiblePosts.length === 0 ? <p className="mt-10 text-soft italic">{emptyMessage}</p> : null}
    </>
  );
}
