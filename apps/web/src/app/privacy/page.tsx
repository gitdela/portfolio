import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageMain } from "@/components/ui/primitives";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Privacy",
    description:
      "What this site collects, what it does not, and how contact submissions are handled.",
    path: "/privacy",
  });
}

/**
 * Not part of the handoff. Written in the same design language, per plan §1.
 *
 * The content describes what the implementation actually does — no inquiry database, no
 * Resend webhook, no tracking pixels — so it should be revisited if any of that changes.
 */
export default function PrivacyPage() {
  return (
    <PageMain>
      <h1 className="text-page-title m-0">Privacy.</h1>
      <p className="mt-3 mb-0 text-lead text-muted">
        A short, accurate description of what this site does with your data. Last reviewed when the
        site launched.
      </p>

      <section className="mt-14">
        <SectionHeading spacing="narrow">What this site collects</SectionHeading>
        <p className="m-0 text-muted">
          Nothing, unless you use the contact form. There are no advertising trackers, no
          third-party analytics profiles, and no cookies used to identify you. The only value stored
          in your browser is your light or dark theme preference, which stays on your device and is
          never sent anywhere.
        </p>
      </section>

      <section className="mt-10">
        <SectionHeading spacing="narrow">The contact form</SectionHeading>
        <p className="m-0 text-muted">
          When you submit the form, your name, email address, and message are sent to me by email so
          I can reply. They are not written to a database, added to a mailing list, or shared with
          anyone. The email contains no open-tracking pixel and no rewritten click-tracking links.
        </p>
        <ul className="mt-3.5 grid list-disc gap-2 pl-[18px] text-muted">
          <li>Delivery is handled by Resend, which processes the message in order to send it.</li>
          <li>
            Spam protection is handled by Cloudflare Turnstile, which is designed to check that a
            submission is human without profiling you across sites.
          </li>
          <li>Message contents are never written to server logs.</li>
        </ul>
      </section>

      <section className="mt-10">
        <SectionHeading spacing="narrow">Analytics</SectionHeading>
        <p className="m-0 text-muted">
          Aggregate page-view and performance measurements come from Vercel Web Analytics and Speed
          Insights. They report totals and timings, not individual browsing histories.
        </p>
      </section>

      <section className="mt-10">
        <SectionHeading spacing="narrow">Getting in touch</SectionHeading>
        <p className="m-0 text-muted">
          If you would like the email you sent me deleted, reply to it and ask; that is the whole
          process, because the message only ever exists in my inbox.
        </p>
      </section>
    </PageMain>
  );
}
