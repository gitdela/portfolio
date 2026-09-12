import { contactPageQuery } from "@portfolio/sanity/queries";
import type { ContactPageQueryResult } from "@portfolio/sanity/types";
import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/ContactForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageMain } from "@/components/ui/primitives";
import { publicEnv } from "@/lib/env";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TAGS = [documentTypeTag("contactPage"), documentTypeTag("profile")];

async function load(): Promise<ContactPageQueryResult> {
  return loadQuery(contactPageQuery, {}, TAGS);
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  return buildPageMetadata({
    seo: page?.seo ?? null,
    title: page?.heading?.replace(/\.$/, "") ?? "Contact",
    description: page?.intro ?? null,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const { page, profile } = await load();

  return (
    <PageMain>
      <h1 className="text-page-title m-0">{page?.heading}</h1>
      {page?.intro ? <p className="mt-3 mb-0 text-lead text-muted">{page.intro}</p> : null}

      <ContactForm
        siteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        submitLabel={page?.submitLabel ?? "Send message →"}
        pendingLabel={page?.pendingLabel ?? "Sending…"}
        successMessage={page?.successMessage ?? "Thanks, your message is on its way."}
        errorMessage={page?.errorMessage ?? "Something went wrong sending that. Please try again."}
      />

      <section className="mt-16">
        <SectionHeading spacing="medium">{page?.elsewhereHeading ?? "Elsewhere"}</SectionHeading>
        <div className="grid gap-2.5 text-action">
          {profile?.email ? (
            <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
              {profile.email}
            </a>
          ) : null}

          {profile?.socialProfiles?.map((social) =>
            social.url && social.label ? (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="me noopener noreferrer"
                className="text-accent hover:underline"
              >
                {social.label}
              </a>
            ) : null,
          )}

          {/*
            The query returns null unless the profile explicitly publishes the number, so
            this stays hidden until that content decision is made.
          */}
          {profile?.phone ? <span className="text-muted">{profile.phone}</span> : null}
        </div>
      </section>
    </PageMain>
  );
}
