"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

import { ALL_TAG, type BlogListPost, type BlogListTag, PostCards, TagPills } from "./PostCards";

export { ALL_TAG };
export type { BlogListPost, BlogListTag };

export interface BlogListProps {
  posts: BlogListPost[];
  tags: BlogListTag[];
  emptyMessage: string;
}

/**
 * The interactive list. Must be rendered inside a Suspense boundary: `nuqs` reads
 * `useSearchParams`, which bails out of static prerendering.
 */
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
      <TagPills tags={tags} activeSlug={activeTag} onSelectTag={select} />
      <PostCards posts={visiblePosts} onSelectTag={select} />
      {visiblePosts.length === 0 ? <p className="mt-10 text-soft italic">{emptyMessage}</p> : null}
    </>
  );
}
