import {
  blogPageQuery,
  caseStudyQuery,
  caseStudySlugsQuery,
  contactPageQuery,
  homePageQuery,
  layoutQuery,
  postSlugsQuery,
  rssQuery,
  sitemapQuery,
  workPageQuery,
} from "@portfolio/sanity/queries";
import { describe, expect, test } from "bun:test";
import * as groqJs from "groq-js";

import { documents } from "../../../scripts/fixtures/seed";

/*
 * Runs the app's real GROQ against the fixture dataset using groq-js — the same evaluator
 * Sanity uses server-side. These assert the *projections*, which TypeGen cannot check: a
 * query can be perfectly typed and still select the wrong thing.
 */

interface GroqValue {
  get: () => Promise<unknown>;
}
interface GroqJsModule {
  parse: (query: string, options?: { params?: Record<string, unknown> }) => unknown;
  evaluate: (
    tree: unknown,
    options: { dataset: unknown; params?: Record<string, unknown> },
  ) => Promise<GroqValue>;
}
const { parse, evaluate } = groqJs as unknown as GroqJsModule;

async function run<T = never>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const value = await evaluate(parse(query, { params }), { dataset: documents, params });
  return (await value.get()) as T;
}

const listingImageAsset = {
  _id: "image-project-listing",
  _type: "sanity.imageAsset",
  url: "https://cdn.sanity.io/images/example/production/project-listing-1600x900.jpg",
  metadata: {
    dimensions: { width: 1600, height: 900 },
    lqip: "data:image/jpeg;base64,preview",
  },
};

function datasetWithListingImage() {
  return [
    ...documents.map((document) =>
      document._id === "project-mybitstore"
        ? {
            ...document,
            listingImage: {
              _type: "image",
              asset: { _type: "reference", _ref: listingImageAsset._id },
              hotspot: { _type: "sanity.imageHotspot", x: 0.5, y: 0.45, height: 0.8, width: 0.9 },
              crop: { _type: "sanity.imageCrop", top: 0.05, bottom: 0.05, left: 0, right: 0 },
              alt: "Mybitstore dashboard",
              decorative: false,
              caption: "The redesigned marketplace dashboard",
            },
          }
        : document,
    ),
    listingImageAsset,
  ];
}

describe("layoutQuery", () => {
  test("returns the wordmark and footer identity", async () => {
    const data = await run<{ profile: Record<string, unknown> }>(layoutQuery);
    expect(data.profile.wordmarkStrong).toBe("KEN");
    expect(data.profile.wordmarkLight).toBe("NARTEY");
    expect(data.profile.location).toBe("Accra, Ghana");
  });

  test("withholds the phone number while phoneIsPublic is false", async () => {
    const data = await run<{ profile: { phone: unknown } }>(layoutQuery);
    expect(data.profile.phone).toBeNull();
  });

  test("publishes the phone number only once the flag is set", async () => {
    const opened = documents.map((d) =>
      d._type === "profile" ? { ...d, phoneIsPublic: true } : d,
    );
    const value = await evaluate(parse(layoutQuery), { dataset: opened, params: {} });
    const data = (await value.get()) as { profile: { phone: unknown } };
    expect(data.profile.phone).toBe("+233 24 920 3351");
  });
});

describe("homePageQuery", () => {
  test("projects the hero and CTAs", async () => {
    const { page } = await run<{ page: Record<string, unknown> }>(homePageQuery);
    expect(page.heading).toContain("I build web products");
    expect((page.primaryCta as { destination: string }).destination).toBe("work");
  });

  test("resolves featured projects in the order the editor set", async () => {
    const { page } = await run<{ page: { featuredProjects: { title: string }[] } }>(homePageQuery);
    expect(page.featuredProjects.map((p) => p.title)).toEqual([
      "Pexwa Bitcoin Exchange",
      "Mybitstore — web platform",
      "Shipping logistics platform",
    ]);
  });

  test("computes hasCaseStudy only for projects that actually have one", async () => {
    const { page } = await run<{
      page: { featuredProjects: { title: string; hasCaseStudy: boolean }[] };
    }>(homePageQuery);
    const byTitle = Object.fromEntries(page.featuredProjects.map((p) => [p.title, p.hasCaseStudy]));
    expect(byTitle["Pexwa Bitcoin Exchange"]).toBe(true);
    expect(byTitle["Mybitstore — web platform"]).toBe(true);
    expect(byTitle["Shipping logistics platform"]).toBe(false);
  });

  test("projects the accessible listing image and its optimization metadata", async () => {
    const value = await evaluate(parse(homePageQuery), {
      dataset: datasetWithListingImage(),
      params: {},
    });
    const data = (await value.get()) as {
      page: {
        featuredProjects: {
          title: string;
          listingImage: {
            asset: { url: string; metadata: { dimensions: { width: number; height: number } } };
            alt: string;
            decorative: boolean;
            caption: string;
          } | null;
        }[];
      };
    };
    const project = data.page.featuredProjects.find(
      ({ title }) => title === "Mybitstore — web platform",
    );

    expect(project?.listingImage?.asset.url).toContain("project-listing-1600x900.jpg");
    expect(project?.listingImage?.asset.metadata.dimensions).toEqual({ width: 1600, height: 900 });
    expect(project?.listingImage?.alt).toBe("Mybitstore dashboard");
    expect(project?.listingImage?.decorative).toBe(false);
    expect(project?.listingImage?.caption).toBe("The redesigned marketplace dashboard");
  });

  test("returns testimonials as objects, not nulls", async () => {
    // Regression: an earlier filter-then-project form silently produced Array<null>.
    const { page } = await run<{ page: { testimonials: unknown[] } }>(homePageQuery);
    expect(page.testimonials.length).toBeGreaterThan(0);
    for (const t of page.testimonials) {
      expect(t).not.toBeNull();
      expect(typeof (t as { quote: string }).quote).toBe("string");
    }
  });

  test("excludes unverified testimonials", async () => {
    const unverified = documents.map((d) =>
      d._type === "testimonial" ? { ...d, isVerified: false } : d,
    );
    const value = await evaluate(parse(homePageQuery), { dataset: unverified, params: {} });
    const data = (await value.get()) as { page: { testimonials: unknown[] } };
    expect(data.page.testimonials).toEqual([]);
  });
});

describe("workPageQuery", () => {
  test("keeps the editor's project order", async () => {
    const { page } = await run<{ page: { projects: { title: string }[] } }>(workPageQuery);
    expect(page.projects[0]?.title).toBe("Pexwa Bitcoin Exchange");
    expect(page.projects).toHaveLength(4);
  });

  test("returns no live URL for projects that have none, rather than a placeholder", async () => {
    const { page } = await run<{
      page: { projects: { title: string; liveUrl: unknown }[] };
    }>(workPageQuery);
    const byTitle = Object.fromEntries(page.projects.map((p) => [p.title, p.liveUrl]));

    expect(byTitle["Mybitstore — web platform"]).toBe("https://www.mybitstore.com");
    // The handoff shipped these as href="#"; they must come back empty so the action hides.
    expect(byTitle["Shipping logistics platform"]).toBeNull();
    expect(byTitle["Banking web application"]).toBeNull();
  });

  test("keeps projects without a listing image explicitly image-free", async () => {
    const { page } = await run<{
      page: { projects: { title: string; listingImage: unknown }[] };
    }>(workPageQuery);

    expect(page.projects.every((project) => project.listingImage === null)).toBe(true);
  });

  test("projects every additional link for a project that ships several surfaces", async () => {
    const { page } = await run<{
      page: { projects: { title: string; additionalLinks: { label: string; url: string }[] }[] };
    }>(workPageQuery);
    const pexwa = page.projects.find(({ title }) => title === "Pexwa Bitcoin Exchange");

    expect(pexwa?.additionalLinks).toEqual([
      { label: "Website ↗", url: "https://pexwa.app" },
      { label: "Admin console ↗", url: "https://zeusdev.pexwa.app" },
    ]);
  });

  test("returns no additional links for single-surface projects, rather than an empty array", async () => {
    // The renderer treats null and [] the same, but the projection should not invent a value.
    const { page } = await run<{
      page: { title: string; projects: { title: string; additionalLinks: unknown }[] };
    }>(workPageQuery);
    const byTitle = Object.fromEntries(page.projects.map((p) => [p.title, p.additionalLinks]));

    expect(byTitle["Mybitstore — web platform"]).toBeNull();
    expect(byTitle["Banking web application"]).toBeNull();
  });
});

describe("blogPageQuery", () => {
  test("orders posts newest first", async () => {
    const { posts } = await run<{ posts: { publishedAt: string }[] }>(blogPageQuery);
    const dates = posts.map((p) => p.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  test("only surfaces tags that at least one post uses", async () => {
    // Add a tag no post references; it must not become a filter pill.
    const withOrphan = [
      ...documents,
      {
        _id: "tag-orphan",
        _type: "tag",
        title: "Orphan",
        slug: { _type: "slug", current: "orphan" },
      },
    ];
    const value = await evaluate(parse(blogPageQuery), { dataset: withOrphan, params: {} });
    const { tags } = (await value.get()) as { tags: { slug: string }[] };
    const slugs = tags.map((t) => t.slug);

    expect(slugs).toContain("frontend");
    expect(slugs).not.toContain("orphan");
  });

  test("exposes tags by URL-safe slug, with the human label kept separate", async () => {
    const { tags } = await run<{ tags: { slug: string; title: string }[] }>(blogPageQuery);
    const companyWork = tags.find((t) => t.title === "Company work");
    expect(companyWork?.slug).toBe("company-work");
  });

  test("resolves the featured post", async () => {
    const { page } = await run<{ page: { featuredPost: { title: string } } }>(blogPageQuery);
    expect(page.featuredPost.title).toBe("What I think about using AI in development");
  });
});

describe("routed document queries", () => {
  test("only projects with case-study content get a slug", async () => {
    const slugs = await run<string[]>(caseStudySlugsQuery);
    expect([...slugs].sort()).toEqual(["mybitstore", "pexwa-bitcoin-exchange"]);
  });

  test("caseStudyQuery carries the live actions through to the case-study page", async () => {
    const project = await run<{
      liveUrl: string;
      liveLabel: string;
      additionalLinks: { label: string; url: string }[];
    }>(caseStudyQuery, { slug: "pexwa-bitcoin-exchange" });

    expect(project.liveUrl).toBe("https://app.pexwa.app");
    expect(project.liveLabel).toBe("Live app ↗");
    expect(project.additionalLinks.map((link) => link.url)).toEqual([
      "https://pexwa.app",
      "https://zeusdev.pexwa.app",
    ]);
  });

  test("caseStudyQuery resolves related writing and the related tag", async () => {
    const project = await run<{
      caseStudy: { relatedPosts: { title: string }[]; relatedTag: { slug: string } };
    }>(caseStudyQuery, { slug: "mybitstore" });
    expect(project.caseStudy.relatedPosts[0]?.title).toContain("Technical SEO");
    expect(project.caseStudy.relatedTag.slug).toBe("mybitstore");
  });

  test("caseStudyQuery returns null for an unknown slug", async () => {
    const missing = await run(caseStudyQuery, { slug: "does-not-exist" });
    expect(missing).toBeNull();
  });

  test("postSlugsQuery lists every published post", async () => {
    const slugs = await run<string[]>(postSlugsQuery);
    expect(slugs).toContain("technical-seo-for-react-apps");
    expect(slugs.every((s) => typeof s === "string")).toBe(true);
  });
});

describe("contactPageQuery", () => {
  test("withholds the phone number while phoneIsPublic is false", async () => {
    const { profile } = await run<{ profile: { phone: unknown; email: string } }>(contactPageQuery);
    expect(profile.phone).toBeNull();
    expect(profile.email).toBe("kendelanartey@gmail.com");
  });
});

describe("feed and sitemap queries", () => {
  test("sitemapQuery lists posts and only case-study projects", async () => {
    const data = await run<{ posts: unknown[]; caseStudies: { slug: string }[] }>(sitemapQuery);
    expect(data.posts.length).toBeGreaterThan(0);
    expect(data.caseStudies.map((c) => c.slug).sort()).toEqual([
      "mybitstore",
      "pexwa-bitcoin-exchange",
    ]);
  });

  test("rssQuery returns posts newest first and caps the feed", async () => {
    const data = await run<{ posts: { publishedAt: string }[] }>(rssQuery);
    const dates = data.posts.map((p) => p.publishedAt);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(data.posts.length).toBeLessThanOrEqual(50);
  });
});
