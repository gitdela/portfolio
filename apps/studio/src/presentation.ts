import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

/** `defineLocations` hands its resolver untyped selections, so narrow before interpolating. */
function asString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Maps documents to the public routes that render them, so editors can jump between a
 * Studio document and the page it appears on in either direction.
 *
 * Singletons resolve to their one page. Projects resolve to `/work/[slug]` only when they
 * actually carry case-study content — otherwise they appear on the index alone.
 */
export const presentationLocations: NonNullable<PresentationPluginOptions["resolve"]> = {
  locations: {
    homePage: defineLocations({
      message: "This document is the home page.",
      locations: [{ title: "Home", href: "/" }],
    }),
    aboutPage: defineLocations({
      message: "This document is the about page.",
      locations: [{ title: "About", href: "/about" }],
    }),
    workPage: defineLocations({
      message: "This document is the work index.",
      locations: [{ title: "Work", href: "/work" }],
    }),
    blogPage: defineLocations({
      message: "This document is the blog index.",
      locations: [{ title: "Blog", href: "/blog" }],
    }),
    contactPage: defineLocations({
      message: "This document is the contact page.",
      locations: [{ title: "Contact", href: "/contact" }],
    }),
    siteSettings: defineLocations({
      message: "Site settings affect every page.",
      locations: [{ title: "Home", href: "/" }],
    }),
    profile: defineLocations({
      message: "The profile appears in the site chrome and on Home, About, and Contact.",
      locations: [
        { title: "Home", href: "/" },
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
      ],
    }),

    project: defineLocations({
      select: { title: "title", slug: "slug.current", headline: "caseStudy.headline" },
      resolve: (doc) => {
        const slug = asString(doc?.slug);
        const hasCaseStudy = slug !== null && asString(doc?.headline) !== null;
        return {
          locations: [
            ...(hasCaseStudy
              ? [{ title: asString(doc?.title) ?? "Case study", href: `/work/${slug}` }]
              : []),
            { title: "Work index", href: "/work" },
            { title: "Home", href: "/" },
          ],
        };
      },
    }),

    post: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => {
        const slug = asString(doc?.slug);
        return {
          locations: [
            ...(slug ? [{ title: asString(doc?.title) ?? "Post", href: `/blog/${slug}` }] : []),
            { title: "Blog index", href: "/blog" },
          ],
        };
      },
    }),

    testimonial: defineLocations({
      message: "Verified testimonials appear on the home page.",
      locations: [{ title: "Home", href: "/" }],
    }),
    experience: defineLocations({
      message: "Experience entries appear on the about page.",
      locations: [{ title: "About", href: "/about" }],
    }),
  },
};
