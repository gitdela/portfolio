import { PageMain } from "@/components/ui/primitives";

/**
 * Skeleton in the shape of a standard page: title, lead paragraph, then body. Announced
 * politely so a screen-reader user knows something is in flight.
 */
export default function Loading() {
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
