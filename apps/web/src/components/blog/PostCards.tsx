import type { Route } from "next";
import Link from "next/link";

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

export const PILL_CLASS =
  "cursor-pointer rounded-full border-[1.5px] px-[14px] py-[5px] text-eyebrow font-bold transition-colors";

export const PILL_ACTIVE = "border-accent bg-accent text-bg";
export const PILL_IDLE = "border-line bg-card text-muted hover:border-accent hover:text-accent";

export const CHIP_CLASS =
  "cursor-pointer rounded-full bg-chip px-[11px] py-[3px] text-micro font-semibold text-muted transition-colors hover:text-accent";

/**
 * The post list itself, with no hooks and no state.
 *
 * Shared by the interactive client list and by the static fallback, so the two cannot drift
 * apart visually. `onSelectTag` is omitted in the fallback, where the chips are inert.
 */
export function PostCards({
  posts,
  onSelectTag,
}: {
  posts: BlogListPost[];
  onSelectTag?: ((slug: string) => void) | undefined;
}) {
  return (
    <div className="mt-10 grid gap-8">
      {posts.map((post) => (
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
                  {...(onSelectTag
                    ? {
                        onClick: () => {
                          onSelectTag(tag.slug);
                        },
                      }
                    : { disabled: true })}
                  className={CHIP_CLASS}
                >
                  {tag.title}
                </button>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/** The filter row, again shared so the static and interactive versions match exactly. */
export function TagPills({
  tags,
  activeSlug,
  onSelectTag,
}: {
  tags: BlogListTag[];
  activeSlug: string;
  onSelectTag?: ((slug: string) => void) | undefined;
}) {
  return (
    <div className="mt-9 flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
      {[{ slug: ALL_TAG, title: "All" }, ...tags].map((tag) => {
        const isActive = tag.slug === activeSlug;
        return (
          <button
            key={tag.slug}
            type="button"
            aria-pressed={isActive}
            {...(onSelectTag
              ? {
                  onClick: () => {
                    onSelectTag(tag.slug);
                  },
                }
              : { disabled: true })}
            className={`${PILL_CLASS} ${isActive ? PILL_ACTIVE : PILL_IDLE}`}
          >
            {tag.title}
          </button>
        );
      })}
    </div>
  );
}

/**
 * What the static HTML contains.
 *
 * `nuqs` reads `useSearchParams`, so the interactive list bails out to client rendering
 * during prerender and only the Suspense fallback is emitted into the static page. Making
 * that fallback the complete, unfiltered list means crawlers and no-JS visitors still get
 * every post — and since every `?tag=` variant canonicalizes to `/blog`, the unfiltered
 * view is exactly what should be indexed.
 */
export function BlogListFallback({ posts, tags }: { posts: BlogListPost[]; tags: BlogListTag[] }) {
  return (
    <>
      <TagPills tags={tags} activeSlug={ALL_TAG} />
      <PostCards posts={posts} />
    </>
  );
}
