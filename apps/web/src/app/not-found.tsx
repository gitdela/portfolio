import Link from "next/link";

import { PageMain, PrimaryPill, SecondaryPill } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <PageMain>
      <p className="m-0 text-badge font-bold tracking-[0.06em] text-accent uppercase">404</p>
      <h1 className="text-page-title mt-3 mb-0">That page isn&rsquo;t here.</h1>
      <p className="mt-3 mb-0 text-lead text-muted">
        The link may be out of date, or the page may have moved. The work and writing indexes are
        the best places to pick up from.
      </p>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-3 text-action font-bold">
        <PrimaryPill href="/work">See my work →</PrimaryPill>
        <SecondaryPill href="/blog">Read the blog</SecondaryPill>
      </div>

      <p className="mt-8 mb-0 text-body-sm">
        <Link href="/" className="text-accent hover:underline">
          ← Back home
        </Link>
      </p>
    </PageMain>
  );
}
