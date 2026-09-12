import { homePageQuery } from "@portfolio/sanity/queries";
import { internalRoutePath } from "@portfolio/sanity/routes";
import type { HomePageQueryResult } from "@portfolio/sanity/types";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { ProjectListingImage } from "@/components/content/ProjectListingImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CARD_CLASS, Chip, PageMain, PrimaryPill, SecondaryPill } from "@/components/ui/primitives";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TAGS = [
  documentTypeTag("homePage"),
  documentTypeTag("profile"),
  documentTypeTag("project"),
  documentTypeTag("testimonial"),
];

async function load(): Promise<HomePageQueryResult> {
  return loadQuery(homePageQuery, {}, TAGS);
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  return buildPageMetadata({
    seo: page?.seo ?? null,
    description: page?.subheading ?? null,
    path: "/",
  });
}

export default async function HomePage() {
  const { page, profile } = await load();

  const showBadge =
    page?.showAvailabilityBadge !== false && profile?.availability?.isAvailable === true;
  const testimonials = page?.testimonials ?? [];

  return (
    <PageMain variant="home">
      <header>
        {showBadge ? (
          <div className="mb-5 inline-flex items-center gap-2 text-badge font-bold tracking-[0.06em] text-accent uppercase">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {profile.availability?.label ?? "Available for work"}
          </div>
        ) : null}

        {page?.heading ? <h1 className="text-hero m-0">{page.heading}</h1> : null}

        {page?.subheading ? (
          <p className="mt-4 mb-0 text-lead-lg text-muted">{page.subheading}</p>
        ) : null}

        <div className="mt-[26px] flex flex-wrap gap-x-4 gap-y-3 text-action font-bold">
          {page?.primaryCta?.label ? (
            <PrimaryPill href={internalRoutePath(page.primaryCta.destination)}>
              {page.primaryCta.label}
            </PrimaryPill>
          ) : null}
          {page?.secondaryCta?.label ? (
            <SecondaryPill href={internalRoutePath(page.secondaryCta.destination)}>
              {page.secondaryCta.label}
            </SecondaryPill>
          ) : null}
        </div>
      </header>

      {profile?.skillGroups?.length ? (
        <section className="mt-20">
          <SectionHeading spacing="wide">{page?.skillsHeading ?? "Skills"}</SectionHeading>
          <div className="grid gap-5">
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

      {page?.featuredProjects?.length ? (
        <section className="mt-20">
          <SectionHeading spacing="wide">
            {page.featuredWorkHeading ?? "Featured Work"}
          </SectionHeading>
          <div className="grid gap-[14px]">
            {page.featuredProjects.map((project) => {
              // Projects with case-study content link to their own page and are flagged as
              // such; the rest carry their date and point at the index.
              const href = (
                project.hasCaseStudy && project.slug ? `/work/${project.slug}` : "/work"
              ) as Route;

              return (
                <Link key={project._id} href={href} className={CARD_CLASS}>
                  <ProjectListingImage image={project.listingImage} variant="card" />
                  <div className="px-[22px] py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-lead-lg font-bold">{project.title}</span>
                      <span className="text-eyebrow font-bold whitespace-nowrap text-accent">
                        {project.hasCaseStudy ? "Case study →" : project.dateLabel}
                      </span>
                    </div>
                    {/* The handoff runs a shorter blurb here than on the Work index. */}
                    <p className="mt-1.5 mb-0 text-body-sm text-muted">
                      {project.cardSummary ?? project.summary}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/*
        Hidden entirely until verified quotes exist — the query already filters to
        isVerified, so an empty array means there is nothing to show.
      */}
      {testimonials.length > 0 ? (
        <section className="mt-20">
          <SectionHeading spacing="wide">
            {page?.testimonialsHeading ?? "What people say"}
          </SectionHeading>
          <div className="grid gap-5">
            {testimonials.map((testimonial) => (
              <blockquote
                key={testimonial._id}
                className="m-0 border-l-[3px] border-accent pl-[18px]"
              >
                <p className="m-0 text-quote">{testimonial.quote}</p>
                <footer className="mt-2 text-tag text-soft">{testimonial.attribution}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}
    </PageMain>
  );
}
