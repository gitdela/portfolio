import { workPageQuery } from "@portfolio/sanity/queries";
import type { WorkPageQueryResult } from "@portfolio/sanity/types";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { InlineText } from "@/components/content/PortableText";
import { ProjectLinks } from "@/components/content/ProjectLinks";
import { ProjectListingImage } from "@/components/content/ProjectListingImage";
import { PageMain } from "@/components/ui/primitives";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { documentTypeTag } from "@/lib/sanity/tags";
import { buildPageMetadata } from "@/lib/seo/metadata";

const TAGS = [documentTypeTag("workPage"), documentTypeTag("project")];

async function load(): Promise<WorkPageQueryResult> {
  return loadQuery(workPageQuery, {}, TAGS);
}

export async function generateMetadata(): Promise<Metadata> {
  const { page } = await load();
  return buildPageMetadata({
    seo: page?.seo ?? null,
    title: page?.heading?.replace(/\.$/, "") ?? "Work",
    path: "/work",
  });
}

export default async function WorkPage() {
  const { page } = await load();
  const projects = page?.projects ?? [];

  return (
    <PageMain>
      <h1 className="text-page-title m-0">{page?.heading}</h1>
      {page?.intro ? <InlineText value={page.intro} className="mt-3 text-lead text-muted" /> : null}

      {projects.length > 0 ? (
        <div className="mt-14 grid gap-11">
          {projects.map((project) => (
            <article key={project._id}>
              <ProjectListingImage image={project.listingImage} variant="standalone" />

              <div className="flex items-baseline justify-between gap-4">
                <h2 className="m-0 text-heading font-bold">{project.title}</h2>
                <span className="text-eyebrow font-bold whitespace-nowrap text-accent">
                  {project.dateLabel}
                </span>
              </div>

              <p className="mt-2 mb-0 text-muted">{project.summary}</p>

              {project.stack?.length ? (
                <p className="mt-2 mb-0 text-tag text-soft italic">{project.stack.join(" · ")}</p>
              ) : null}

              <ProjectLinks
                liveUrl={project.liveUrl}
                liveLabel={project.liveLabel}
                additionalLinks={project.additionalLinks}
                repositoryUrl={project.repositoryUrl}
                className="mt-2.5"
              >
                {project.hasCaseStudy && project.slug ? (
                  <Link
                    href={`/work/${project.slug}` as Route}
                    className="text-accent hover:underline"
                  >
                    Read the case study →
                  </Link>
                ) : null}
              </ProjectLinks>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-14 text-soft italic">No projects published yet.</p>
      )}
    </PageMain>
  );
}
