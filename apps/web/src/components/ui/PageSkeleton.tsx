import { PageMain } from "@/components/ui/primitives";

/**
 * Loading placeholder shaped like a standard page: title, lead paragraph, then body.
 *
 * DO NOT mount this as a route-level `loading.tsx`. It was, and it broke two things:
 *
 *  1. A `loading.tsx` wraps its segment *and every child segment* in a Suspense boundary,
 *     so the response streams and the HTTP status is sent before the page component runs.
 *     Any route beneath it calling `notFound()` then returned 200 with 404 content — a soft
 *     404 that crawlers index as a valid page.
 *
 *  2. Worse, on `/about` and `/privacy` the RSC flight payload serialized this fallback as
 *     the resolved content and never emitted a resolve chunk. The server HTML painted the
 *     real page, then hydration reconciled against the payload and replaced it with these
 *     pulsing blocks — permanently. `/privacy` is fully static and still did it, so it was
 *     the boundary itself, not slow data.
 *
 * Use it only inside an explicit `<Suspense fallback={<PageSkeleton />}>` around a subtree
 * that genuinely suspends, and verify the payload resolves before shipping it.
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
