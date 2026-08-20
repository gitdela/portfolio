import { PageMain } from "@/components/ui/primitives";

/**
 * Loading placeholder shaped like a standard page: title, lead paragraph, then body.
 *
 * IMPORTANT — where this may be mounted.
 *
 * A `loading.tsx` wraps its segment *and every child segment* in a Suspense boundary. That
 * makes the response stream, which means the HTTP status is sent before the page component
 * runs. Any route beneath it that calls `notFound()` then returns 200 with 404 content — a
 * soft 404 that crawlers will happily index.
 *
 * So this is mounted only on leaf segments with no `notFound()` beneath them: /about,
 * /contact, /privacy. It must NOT be mounted at the app root, at /work, or at /blog, since
 * those are parents of `[slug]` routes that depend on a real 404 status.
 */
export function PageSkeleton() {
  return (
    <PageMain>
      <div role="status" aria-live="polite" className="animate-pulse">
        <span className="sr-only">Loading…</span>
        <div className="h-9 w-2/3 rounded-md bg-chip" />
        <div className="mt-4 h-5 w-full rounded-md bg-chip" />
        <div className="mt-2 h-5 w-4/5 rounded-md bg-chip" />

        <div className="mt-14 grid gap-4">
          <div className="h-24 rounded-xl bg-chip" />
          <div className="h-24 rounded-xl bg-chip" />
          <div className="h-24 rounded-xl bg-chip" />
        </div>
      </div>
    </PageMain>
  );
}
