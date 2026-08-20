import { defineQuery } from "groq";

/*
 * Shared projections.
 *
 * These are plain string constants interpolated into `defineQuery` templates so TypeGen
 * still sees one complete query string per export.
 */

const IMAGE_FIELDS = /* groq */ `
  asset->{
    _id,
    url,
    metadata { dimensions { width, height }, lqip }
  },
  hotspot,
  crop,
  alt,
  decorative,
  caption
`;

const SEO_FIELDS = /* groq */ `
  title,
  description,
  noIndex,
  image { ${IMAGE_FIELDS} }
`;

const CTA_FIELDS = /* groq */ `label, destination`;

const TAG_FIELDS = /* groq */ `_id, title, "slug": slug.current`;

const PROJECT_CARD_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  role,
  dateLabel,
  timeline,
  stack,
  liveUrl,
  liveLabel,
  repositoryUrl,
  "hasCaseStudy": defined(caseStudy.headline) && defined(slug.current)
`;

const POST_CARD_FIELDS = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  standfirst,
  publishedAt,
  category->{ _id, title, "slug": slug.current },
  tags[]->{ ${TAG_FIELDS} },
  coverImage { ${IMAGE_FIELDS} }
`;

/* ------------------------------------------------------------------ *
 * Global chrome
 * ------------------------------------------------------------------ */

/** Nav wordmark, footer contact row, and the site-wide metadata defaults. */
export const layoutQuery = defineQuery(`{
  "settings": *[_type == "siteSettings"][0]{
    siteName,
    tagline,
    defaultTitle,
    titleTemplate,
    defaultDescription,
    defaultSocialImage { ${IMAGE_FIELDS} },
    footerCta { ${CTA_FIELDS} }
  },
  "profile": *[_type == "profile"][0]{
    fullName,
    role,
    wordmarkStrong,
    wordmarkLight,
    location,
    email,
    "phone": select(phoneIsPublic == true => phone, null),
    socialProfiles[]{ platform, label, url }
  }
}`);

/** Metadata defaults on their own, for `generateMetadata` in the root layout. */
export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  siteName,
  tagline,
  defaultTitle,
  titleTemplate,
  defaultDescription,
  defaultSocialImage { ${IMAGE_FIELDS} },
  footerCta { ${CTA_FIELDS} },
  "author": author->{ fullName, role, socialProfiles[]{ platform, url } }
}`);

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

export const homePageQuery = defineQuery(`{
  "page": *[_type == "homePage"][0]{
    showAvailabilityBadge,
    heading,
    subheading,
    primaryCta { ${CTA_FIELDS} },
    secondaryCta { ${CTA_FIELDS} },
    skillsHeading,
    featuredWorkHeading,
    featuredProjects[]->{ ${PROJECT_CARD_FIELDS} },
    testimonialsHeading,
    "testimonials": testimonials[@->isVerified == true]->{ _id, quote, attribution },
    seo { ${SEO_FIELDS} }
  },
  "profile": *[_type == "profile"][0]{
    fullName,
    availability { isAvailable, label },
    skillGroups[]{ label, skills }
  }
}`);

export const aboutPageQuery = defineQuery(`{
  "page": *[_type == "aboutPage"][0]{
    heading,
    intro,
    experienceHeading,
    experiences[]->{ _id, periodLabel, title, summary },
    skillsHeading,
    seo { ${SEO_FIELDS} }
  },
  "profile": *[_type == "profile"][0]{
    fullName,
    role,
    biography,
    portrait { ${IMAGE_FIELDS} },
    skillGroups[]{ label, skills }
  }
}`);

export const workPageQuery = defineQuery(`{
  "page": *[_type == "workPage"][0]{
    heading,
    intro,
    projects[]->{ ${PROJECT_CARD_FIELDS} },
    seo { ${SEO_FIELDS} }
  }
}`);

export const blogPageQuery = defineQuery(`{
  "page": *[_type == "blogPage"][0]{
    heading,
    intro,
    emptyStateMessage,
    featuredPost->{ ${POST_CARD_FIELDS} },
    seo { ${SEO_FIELDS} }
  },
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)]
    | order(publishedAt desc){ ${POST_CARD_FIELDS} },
  "tags": *[_type == "tag" && count(*[_type == "post" && references(^._id) && defined(slug.current)]) > 0]
    | order(title asc){ ${TAG_FIELDS} }
}`);

export const contactPageQuery = defineQuery(`{
  "page": *[_type == "contactPage"][0]{
    heading,
    intro,
    elsewhereHeading,
    submitLabel,
    pendingLabel,
    successMessage,
    errorMessage,
    seo { ${SEO_FIELDS} }
  },
  "profile": *[_type == "profile"][0]{
    email,
    "phone": select(phoneIsPublic == true => phone, null),
    socialProfiles[]{ platform, label, url }
  }
}`);

/* ------------------------------------------------------------------ *
 * Routed documents
 * ------------------------------------------------------------------ */

/** Only projects that actually carry case-study content get a page. */
export const caseStudySlugsQuery = defineQuery(`
  *[_type == "project" && defined(slug.current) && defined(caseStudy.headline)].slug.current
`);

export const caseStudyQuery = defineQuery(`
  *[_type == "project" && slug.current == $slug][0]{
    ${PROJECT_CARD_FIELDS},
    caseStudy {
      headline,
      heroImage { ${IMAGE_FIELDS} },
      problem,
      approach,
      supportingImage { ${IMAGE_FIELDS} },
      result,
      relatedPosts[]->{ _id, title, "slug": slug.current },
      relatedTag->{ ${TAG_FIELDS} }
    },
    seo { ${SEO_FIELDS} }
  }
`);

export const postSlugsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && defined(publishedAt)].slug.current
`);

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug][0]{
    ${POST_CARD_FIELDS},
    body,
    socialImage { ${IMAGE_FIELDS} },
    seo { ${SEO_FIELDS} },
    "author": *[_type == "siteSettings"][0].author->{ fullName, role }
  }
`);

/* ------------------------------------------------------------------ *
 * Feeds and sitemap
 * ------------------------------------------------------------------ */

export const sitemapQuery = defineQuery(`{
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)]{
    "slug": slug.current,
    publishedAt,
    _updatedAt
  },
  "caseStudies": *[_type == "project" && defined(slug.current) && defined(caseStudy.headline)]{
    "slug": slug.current,
    _updatedAt
  }
}`);

export const rssQuery = defineQuery(`{
  "settings": *[_type == "siteSettings"][0]{ siteName, defaultDescription },
  "profile": *[_type == "profile"][0]{ fullName, email },
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)]
    | order(publishedAt desc)[0...50]{
      title,
      "slug": slug.current,
      standfirst,
      publishedAt,
      category->{ title }
    }
}`);
