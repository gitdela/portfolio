"use client";

import { useEffect } from "react";

import { PageMain } from "@/components/ui/primitives";

/**
 * Route-level error boundary. The digest is shown because it is the only handle a visitor
 * can quote back; the underlying error message is not, since it can carry internals.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error", error.digest ?? "no digest");
  }, [error]);

  return (
    <PageMain>
      <p className="m-0 text-badge font-bold tracking-[0.06em] text-accent uppercase">Error</p>
      <h1 className="text-page-title mt-3 mb-0">Something went wrong.</h1>
      <p className="mt-3 mb-0 text-lead text-muted">
        This page failed to load. Trying again often clears it.
      </p>

      <div className="mt-8">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-full border-none bg-accent px-5 py-2.5 font-sans text-action font-bold text-bg"
        >
          Try again
        </button>
      </div>

      {error.digest ? (
        <p className="mt-8 mb-0 text-small text-soft">Reference: {error.digest}</p>
      ) : null}
    </PageMain>
  );
}
