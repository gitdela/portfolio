import { caseStudyQuery, caseStudySlugsQuery, siteSettingsQuery } from "@portfolio/sanity/queries";
import { internalRoutePath } from "@portfolio/sanity/routes";
import type { CaseStudyQueryResult } from "@portfolio/sanity/types";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InlineText } from "@/components/content/PortableText";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageMain, PrimaryPill } from "@/components/ui/primitives";
import { siteUrl } from "@/lib/env";
import { hasImage, imageAlt, imageDimensions, imageUrl } from "@/lib/sanity/image";
import { loadPublishedQuery, loadQuery } from "@/lib/sanity/loadQuery";
import { documentIdTag, documentTypeTag } from "@/lib/sanity/tags";
import { breadcrumbJsonLd, caseStudyJsonLd } from "@/lib/seo/jsonld";
import { buildPageMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function load(slug: string): Promise<CaseStudyQueryResult> {
  return loadQuery(caseStudyQuery, { slug }, [documentTypeTag("project"), documentIdTag(slug)]);
}

export async function generateStaticParams() {
  const slugs = await loadPublishedQuery(caseStudySlugsQuery, {}, [documentTypeTag("project")]);

  return slugs.filter((slug): slug is string => typeof slug === "string").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await load(slug);
  if (!project) return {};

  return buildPageMetadata({
    seo: project.seo ?? null,
    title: project.title ?? null,
    description: project.summary ?? null,
    image: project.caseStudy?.heroImage ?? null,
    path: `/work/${slug}`,
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await load(slug);

  // A project without case-study content has no page of its own.
  if (!project?.caseStudy?.headline) notFound();

  const settings = await loadPublishedQuery(siteSettingsQuery, {}, [
    documentTypeTag("siteSettings"),
  ]);

  const caseStudy = project.caseStudy;
  const hero = caseStudy.heroImage;
  const supporting = caseStudy.supportingImage;
  const cta = settings?.footerCta;

  return (
    <PageMain variant="article">
      <JsonLd
        data={[
          caseStudyJsonLd({ project, slug, siteUrl }),
          breadcrumbJsonLd(
            [
              { name: "Home", path: "/" },
              { name: "Work", path: "/work" },
              { name: project.title ?? "Case study", path: `/work/${slug}` },
            ],
            siteUrl,
          ),
        ]}
      />

      <Link href="/work" className="text-small font-bold text-accent hover:underline">
        ← All work
      </Link>

      <h1 className="text-page-title mt-[18px] mb-0">{caseStudy.headline}</h1>

      <div className="mt-3.5 flex flex-wrap gap-x-7 gap-y-2.5 text-small text-soft">
        {project.role ? (
          <span>
            <strong className="font-bold text-ink">Role</strong> — {project.role}
          </span>
        ) : null}
        {project.timeline ? (
          <span>
            <strong className="font-bold text-ink">Timeline</strong> — {project.timeline}
          </span>
        ) : null}
        {project.stack?.length ? (
          <span>
            <strong className="font-bold text-ink">Stack</strong> — {project.stack.join(", ")}
          </span>
        ) : null}
      </div>

      {hasImage(hero) && hero ? (
        <div className="mt-9">
          <Image
            src={imageUrl(hero, 1360)}
            alt={imageAlt(hero)}
            width={imageDimensions(hero)?.width ?? 1360}
            height={imageDimensions(hero)?.height ?? 680}
            priority
            sizes="(max-width: 720px) 100vw, 680px"
            className="h-[clamp(200px,48vw,340px)] w-full rounded-[14px] object-cover"
            {...(hero.asset?.metadata?.lqip
              ? { placeholder: "blur" as const, blurDataURL: hero.asset.metadata.lqip }
              : {})}
          />
        </div>
      ) : null}

      {caseStudy.problem ? (
        <section className="mt-11">
          <SectionHeading spacing="narrow">The problem</SectionHeading>
          <InlineText value={caseStudy.problem} className="text-muted" />
        </section>
      ) : null}

      {caseStudy.approach?.length ? (
        <section className="mt-10">
          <SectionHeading spacing="narrow">The approach</SectionHeading>
          <ul className="m-0 grid list-disc gap-2 pl-[18px] text-muted">
            {caseStudy.approach.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasImage(supporting) && supporting ? (
        <div className="mt-10">
          <Image
            src={imageUrl(supporting, 1360)}
            alt={imageAlt(supporting)}
            width={imageDimensions(supporting)?.width ?? 1360}
            height={imageDimensions(supporting)?.height ?? 680}
            sizes="(max-width: 720px) 100vw, 680px"
            className="h-[clamp(200px,48vw,340px)] w-full rounded-[14px] object-cover"
            {...(supporting.asset?.metadata?.lqip
              ? { placeholder: "blur" as const, blurDataURL: supporting.asset.metadata.lqip }
              : {})}
          />
        </div>
      ) : null}

      {caseStudy.result ? (
        <section className="mt-10">
          <SectionHeading spacing="narrow">The result</SectionHeading>
          <InlineText value={caseStudy.result} className="text-muted" />
        </section>
      ) : null}

      {caseStudy.relatedPosts?.length ? (
        <section className="mt-11">
          <SectionHeading spacing="narrow">Related writing</SectionHeading>
          <div className="grid gap-2.5 text-action">
            {caseStudy.relatedPosts.map((post) =>
              post.slug ? (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}` as Route}
                  className="text-accent hover:underline"
                >
                  {post.title} →
                </Link>
              ) : null,
            )}
            {caseStudy.relatedTag?.slug ? (
              <Link
                href={`/blog?tag=${caseStudy.relatedTag.slug}` as Route}
                className="text-tag text-soft hover:underline"
              >
                All {caseStudy.relatedTag.title} posts
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <Link href="/work" className="text-body-sm font-bold text-accent hover:underline">
          ← All work
        </Link>
        {cta?.label ? (
          <PrimaryPill href={internalRoutePath(cta.destination)} className="text-body-sm">
            {cta.label}
          </PrimaryPill>
        ) : null}
      </div>
    </PageMain>
  );
}
