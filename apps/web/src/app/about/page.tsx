import { aboutPageQuery } from "@portfolio/sanity/queries";
import type { AboutPageQueryResult } from "@portfolio/sanity/types";
import type { Metadata } from "next";
import Image from "next/image";

import { InlineText } from "@/components/content/PortableText";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip, PageMain } from "@/components/ui/primitives";
import { hasImage, imageAlt, imageUrl } from "@/lib/sanity/image";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TAGS = [
  documentTypeTag("aboutPage"),
  documentTypeTag("profile"),
  documentTypeTag("experience"),
];

async function load(): Promise<AboutPageQueryResult> {
  return loadQuery(aboutPageQuery, {}, TAGS);
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  return buildPageMetadata({
    seo: page?.seo ?? null,
    title: page?.heading?.replace(/\.$/, "") ?? "About",
    description: page?.intro ?? null,
    path: "/about",
  });
}

export default async function AboutPage() {
  const { page, profile } = await load();
  const portrait = profile?.portrait;

  return (
    <PageMain>
      <div className="flex flex-wrap items-center gap-7">
        {hasImage(portrait) && portrait ? (
          <Image
            src={imageUrl(portrait, 240, 240)}
            alt={imageAlt(portrait)}
            width={120}
            height={120}
            priority
            className="h-[120px] w-[120px] flex-none rounded-full object-cover"
            {...(portrait.asset?.metadata?.lqip
              ? { placeholder: "blur" as const, blurDataURL: portrait.asset.metadata.lqip }
              : {})}
          />
        ) : null}

        <div className="min-w-[260px] flex-1">
          <h1 className="text-page-title m-0">{page?.heading}</h1>
          {page?.intro ? <p className="mt-2.5 mb-0 text-lead text-muted">{page.intro}</p> : null}
        </div>
      </div>

      {profile?.biography ? (
        <section className="mt-12">
          <InlineText value={profile.biography} className="text-muted" />
        </section>
      ) : null}

      {page?.experiences?.length ? (
        <section className="mt-14">
          <SectionHeading spacing="wide">{page.experienceHeading ?? "Experience"}</SectionHeading>
          <div className="grid gap-[22px]">
            {page.experiences.map((entry) => (
              <div key={entry._id} className="flex flex-wrap gap-x-4 gap-y-1.5">
                <div className="w-[110px] flex-none text-chip font-bold whitespace-nowrap text-accent">
                  {entry.periodLabel}
                </div>
                <div className="min-w-[240px] flex-1">
                  <div className="font-bold">{entry.title}</div>
                  <div className="text-body-sm text-muted">{entry.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {profile?.skillGroups?.length ? (
        <section className="mt-14">
          {/* About uses the 20px bar spacing and an 18px group gap; Home uses 24px and 20px. */}
          <SectionHeading spacing="medium">{page?.skillsHeading ?? "Skills"}</SectionHeading>
          <div className="grid gap-[18px]">
            {profile.skillGroups.map((group) => (
              <div key={group.label}>
                <div className="mb-2.5 text-badge font-bold tracking-[0.06em] text-soft uppercase">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.skills?.map((skill) => (
                    <Chip key={skill}>{skill}</Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </PageMain>
  );
}
