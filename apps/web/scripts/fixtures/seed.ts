/**
 * Development fixtures for `bun run dev:offline`.
 *
 * NOT PUBLISHABLE CONTENT. This file is never uploaded to a Sanity dataset and never
 * reaches the live site — it exists so the whole design can be exercised locally and by
 * end-to-end tests.
 *
 * Most of it is real: docs/handoff/README.md states its copy is final, so the profile,
 * hero, skills, projects, experience, and contact copy are the genuine article.
 *
 * The blog posts and the two testimonials are the exception. The handoff explicitly marks
 * those as placeholders, and plan §1 forbids launching with either. They are included here
 * only so the blog index, the ?tag= filter, the article template, and the testimonial
 * section can actually be run. See docs/handoff-deviations.md.
 */

interface SanityDocument {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

let keyCounter = 0;
const nextKey = () => `k${String((keyCounter += 1)).padStart(4, "0")}`;

/** A Portable Text paragraph, optionally carrying inline link annotations. */
function para(
  text: string,
  options: { style?: string; links?: { text: string; href: string }[] } = {},
): Record<string, unknown> {
  const { style = "normal", links = [] } = options;

  if (links.length === 0) {
    return {
      _type: "block",
      _key: nextKey(),
      style,
      markDefs: [],
      children: [{ _type: "span", _key: nextKey(), text, marks: [] }],
    };
  }

  // Split the text around each linked phrase, marking those spans with the annotation.
  const markDefs: Record<string, unknown>[] = [];
  const children: Record<string, unknown>[] = [];
  let rest = text;

  for (const link of links) {
    const index = rest.indexOf(link.text);
    if (index === -1) continue;

    const markKey = nextKey();
    markDefs.push({ _type: "externalLink", _key: markKey, href: link.href, openInNewTab: true });

    if (index > 0) {
      children.push({ _type: "span", _key: nextKey(), text: rest.slice(0, index), marks: [] });
    }
    children.push({ _type: "span", _key: nextKey(), text: link.text, marks: [markKey] });
    rest = rest.slice(index + link.text.length);
  }

  if (rest.length > 0) {
    children.push({ _type: "span", _key: nextKey(), text: rest, marks: [] });
  }

  return { _type: "block", _key: nextKey(), style, markDefs, children };
}

/** A Portable Text list item. */
function bullet(text: string): Record<string, unknown> {
  return {
    _type: "block",
    _key: nextKey(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: nextKey(), text, marks: [] }],
  };
}

const ref = (id: string) => ({ _type: "reference", _ref: id });
const slug = (current: string) => ({ _type: "slug", current });

/* ------------------------------------------------------------------ *
 * Taxonomy
 * ------------------------------------------------------------------ */

const categories: SanityDocument[] = [
  { _id: "category-react", _type: "category", title: "React", slug: slug("react") },
  { _id: "category-seo", _type: "category", title: "SEO", slug: slug("seo") },
  { _id: "category-career", _type: "category", title: "Career", slug: slug("career") },
  { _id: "category-build-log", _type: "category", title: "Build log", slug: slug("build-log") },
  { _id: "category-opinion", _type: "category", title: "Opinion", slug: slug("opinion") },
];

// The UI shows the human label; the ?tag= parameter carries the slug.
const tags: SanityDocument[] = [
  { _id: "tag-frontend", _type: "tag", title: "Frontend", slug: slug("frontend") },
  { _id: "tag-mybitstore", _type: "tag", title: "Mybitstore", slug: slug("mybitstore") },
  { _id: "tag-company-work", _type: "tag", title: "Company work", slug: slug("company-work") },
  { _id: "tag-career", _type: "tag", title: "Career", slug: slug("career") },
  { _id: "tag-backend", _type: "tag", title: "Backend", slug: slug("backend") },
  { _id: "tag-fullstack", _type: "tag", title: "Fullstack", slug: slug("fullstack") },
  {
    _id: "tag-personal-project",
    _type: "tag",
    title: "Personal project",
    slug: slug("personal-project"),
  },
];

/* ------------------------------------------------------------------ *
 * Profile and site settings — genuine content
 * ------------------------------------------------------------------ */

const profile: SanityDocument = {
  _id: "profile",
  _type: "profile",
  fullName: "Kenneth Dela Nartey",
  wordmarkStrong: "KEN",
  wordmarkLight: "NARTEY",
  role: "Software engineer",
  location: "Accra, Ghana",
  availability: { isAvailable: true, label: "Available for work" },
  email: "kendelanartey@gmail.com",
  phone: "+233 24 920 3351",
  // Hidden until an explicit content decision, per plan §1.
  phoneIsPublic: false,
  socialProfiles: [
    {
      _key: nextKey(),
      platform: "github",
      label: "github.com/gitdela",
      url: "https://github.com/gitdela",
    },
    {
      _key: nextKey(),
      platform: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/in/ken-nartey",
    },
  ],
  biography: [
    para(
      "I studied telecommunication engineering, then taught myself to ship software — and haven't stopped. Since 2023 I've been the front-end developer at Mybitstore, rebuilding a crypto marketplace's entire web presence. On the side I build full-stack products end to end: logistics platforms, banking apps, whatever's hard enough to be interesting. I pair engineering with SEO, so what I build doesn't just work — it gets found.",
    ),
  ],
  skillGroups: [
    {
      _key: nextKey(),
      label: "Frontend",
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Next.js",
        "Vite",
        "React Router",
        "Tailwind CSS",
        "shadcn/ui",
        "TanStack Query",
        "TanStack Form",
        "Recharts",
      ],
    },
    {
      _key: nextKey(),
      label: "Backend & Data",
      skills: [
        "Node.js",
        "Express",
        "Hono",
        "REST APIs",
        "OpenAPI",
        "PostgreSQL",
        "Neon",
        "Drizzle ORM",
        "Appwrite",
        "Sanity CMS",
        "Better Auth",
        "Webhooks",
        "Background Workers",
      ],
    },
    {
      _key: nextKey(),
      label: "Infrastructure & Tooling",
      skills: [
        "Bun",
        "Turborepo",
        "Git",
        "Docker",
        "DigitalOcean",
        "Cloudflare",
        "Vercel",
        "Caddy",
        "Nginx",
        "Bash",
        "Linux",
      ],
    },
    {
      _key: nextKey(),
      label: "Testing & Observability",
      skills: [
        "Bun Test",
        "Bruno",
        "Pino",
        "Grafana",
        "Prometheus",
        "Loki",
        "Monitoring & Alerting",
      ],
    },
    {
      _key: nextKey(),
      label: "Blockchain & Fintech",
      skills: [
        "Bitcoin Core",
        "Electrs",
        "bitcoinjs-lib",
        "PSBT",
        "Bitcoin Wallet Infrastructure",
        "Double-Entry Ledgers",
        "Paystack",
      ],
    },
    {
      _key: nextKey(),
      label: "SEO & Web Quality",
      skills: ["Technical SEO", "Web Performance", "Accessibility", "SEMrush"],
    },
  ],
};

const siteSettings: SanityDocument = {
  _id: "siteSettings",
  _type: "siteSettings",
  siteName: "Kenneth Dela Nartey",
  tagline: "Software engineer in Accra building fast, well-crafted web products.",
  author: ref("profile"),
  defaultTitle: "Kenneth Dela Nartey — Software engineer",
  titleTemplate: "%s | Kenneth Dela Nartey",
  defaultDescription:
    "Software engineer in Accra shipping production apps with React, Next.js, and Node.js. Frontend craft, backend logic, and SEO that actually ranks.",
  footerCta: { label: "Work with me →", destination: "contact" },
};

/* ------------------------------------------------------------------ *
 * Projects — genuine content
 * ------------------------------------------------------------------ */

const projects: SanityDocument[] = [
  {
    _id: "project-mybitstore",
    _type: "project",
    title: "Mybitstore — web platform",
    slug: slug("mybitstore"),
    summary:
      "Redesigned and modernized the website, web app, admin dashboard, and blog of a crypto marketplace. Built a scalable, SEO-ready blog on Sanity CMS and lifted search visibility with SEMrush-driven optimization.",
    cardSummary: "Rebuilt the website, web app, admin dashboard, and blog of a crypto marketplace.",
    role: "Front-end Developer",
    dateLabel: "2023 – now",
    timeline: "07/2023 – Present",
    startDate: "2023-07-01",
    stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Shadcn/UI", "Sanity CMS"],
    liveUrl: "https://www.mybitstore.com",
    liveLabel: "Live site ↗",
    caseStudy: {
      headline: "Mybitstore: rebuilding a crypto marketplace's entire web presence",
      problem: [
        para(
          "Mybitstore's web surfaces — the marketing site, web app, admin dashboard, and blog — had grown inconsistent and dated. The UI didn't match the product's ambition, and the site was underperforming in search, leaving organic growth on the table.",
        ),
      ],
      approach: [
        "Rebuilt all four surfaces on one modern stack — React, Next.js, TypeScript, Tailwind CSS, and Shadcn/UI — for a consistent design language and faster iteration.",
        "Launched a scalable blog on Sanity CMS with structured content and SEO-ready delivery baked in.",
        "Ran SEMrush-driven technical SEO: audits, on-page optimization, and performance work.",
        "Designed responsive email templates for marketing and communication.",
        "Worked daily with UX/UI designers, backend developers, and project managers to ship without seams.",
      ],
      result: [
        para(
          "A unified, modern web presence across all four surfaces, a blog that ships SEO-ready content on a proper CMS, and measurably improved search visibility and performance. The platform now looks and moves like the product it sells.",
        ),
      ],
      relatedPosts: [{ ...ref("post-technical-seo"), _key: nextKey() }],
      relatedTag: ref("tag-mybitstore"),
    },
  },
  {
    _id: "project-shipping",
    _type: "project",
    title: "Shipping logistics platform",
    slug: slug("shipping-logistics-platform"),
    summary:
      "A responsive website and admin dashboard for managing shipping logistics — shipment tracking, cost calculation, and inventory across multiple warehouses. Appwrite handles complex data relationships and real-time updates.",
    cardSummary: "Shipment tracking, cost calculation, and multi-warehouse inventory on Appwrite.",
    dateLabel: "2025",
    startDate: "2025-01-01",
    stack: ["Next.js", "TypeScript", "Appwrite", "Tailwind CSS", "Cloudflare"],
    // No live URL yet, so the action is omitted rather than rendered as "#".
    repositoryUrl: "https://github.com/gitdela",
  },
  {
    _id: "project-banking",
    _type: "project",
    title: "Banking web application",
    slug: slug("banking-web-application"),
    summary:
      "A modern, responsive banking app with an intuitive UI, built with Next.js and Shadcn/UI and deployed to Vercel behind Cloudflare for speed and reliability.",
    cardSummary: "A modern, responsive banking app built with Next.js and Shadcn/UI.",
    dateLabel: "2025",
    startDate: "2025-06-01",
    stack: ["Next.js", "Shadcn/UI", "TypeScript", "Appwrite", "Vercel", "Cloudflare"],
    repositoryUrl: "https://github.com/gitdela",
  },
];

/* ------------------------------------------------------------------ *
 * Experience — genuine content
 * ------------------------------------------------------------------ */

const experiences: SanityDocument[] = [
  {
    _id: "experience-mybitstore",
    _type: "experience",
    periodLabel: "2023 – now",
    startDate: "2023-07-01",
    title: "Front-end Developer — Mybitstore Technologies",
    summary: "Website, web app, admin dashboard, blog, and SEO for a crypto marketplace.",
  },
  {
    _id: "experience-independent",
    _type: "experience",
    periodLabel: "2025",
    startDate: "2025-01-01",
    title: "Independent full-stack projects",
    summary:
      "Shipping-logistics platform and banking web app, built end to end on Next.js and Appwrite.",
  },
];

/* ------------------------------------------------------------------ *
 * PLACEHOLDER — blog posts and testimonials
 *
 * Marked as drafts in the handoff and forbidden at launch by plan §1. Present only so the
 * blog index, tag filter, article template, and testimonial section can be exercised.
 * ------------------------------------------------------------------ */

const posts: SanityDocument[] = [
  {
    _id: "post-ai-in-development",
    _type: "post",
    title: "What I think about using AI in development",
    slug: slug("what-i-think-about-using-ai-in-development"),
    standfirst:
      "Where it genuinely speeds me up, where it quietly makes things worse, and the rules I've settled on for letting it into my workflow.",
    publishedAt: "2026-08-18T09:00:00.000Z",
    category: ref("category-opinion"),
    body: [
      para(
        "Placeholder body. This post exists so the featured card and the article template can be rendered locally.",
      ),
    ],
  },
  {
    _id: "post-server-components",
    _type: "post",
    title: "Server Components changed how I structure Next.js apps",
    slug: slug("server-components-changed-how-i-structure-nextjs-apps"),
    standfirst:
      "Where the client boundary actually belongs, and what it did to my folder structure.",
    publishedAt: "2026-08-12T09:00:00.000Z",
    category: ref("category-react"),
    tags: [
      { ...ref("tag-frontend"), _key: nextKey() },
      { ...ref("tag-mybitstore"), _key: nextKey() },
    ],
    body: [para("Placeholder body.")],
  },
  {
    _id: "post-technical-seo",
    _type: "post",
    title: "Technical SEO for React apps: what actually moves rankings",
    slug: slug("technical-seo-for-react-apps"),
    standfirst:
      "Lessons from taking a crypto marketplace's search visibility up with SEMrush and Next.js — placeholder copy showing the article layout.",
    publishedAt: "2026-08-20T09:00:00.000Z",
    category: ref("category-seo"),
    tags: [
      { ...ref("tag-frontend"), _key: nextKey() },
      { ...ref("tag-mybitstore"), _key: nextKey() },
      { ...ref("tag-company-work"), _key: nextKey() },
    ],
    // The one post with a full body, so the article template renders every element:
    // headings with accent bars, a pull quote, and a bulleted list.
    body: [
      para(
        "React apps have a reputation problem with search engines, and most of it is self-inflicted. When we started the Mybitstore rebuild, the site had real content that crawlers simply couldn't see well. This post walks through what we changed and which changes actually showed up in the rankings.",
      ),
      para("Start with rendering, not keywords", { style: "h2" }),
      para(
        "Before touching a single meta tag, figure out what the crawler receives. Client-rendered pages often ship an empty shell; moving key routes to server rendering in Next.js was the single highest-impact change we made. Everything else compounds on top of it.",
      ),
      para(
        "A useful habit: fetch your page the way a bot does and read the raw HTML. If your product copy isn't in it, no amount of keyword work will save you.",
      ),
      para(
        "If the content isn't in the initial HTML, it doesn't exist — rankings follow rendering.",
        {
          style: "blockquote",
        },
      ),
      para("Structure the content, then the metadata", { style: "h2" }),
      para(
        "With rendering fixed, structured data and canonical URLs did the next chunk of work. We used SEMrush audits to find duplicate titles, orphan pages, and broken internal links — unglamorous fixes that moved more than any clever trick.",
      ),
      bullet("One canonical URL per piece of content, everywhere."),
      bullet("Descriptive titles under 60 characters; no template leftovers."),
      bullet("Internal links from high-traffic pages to the pages you want lifted."),
      para("Performance is a ranking input, not a vanity metric", { style: "h2" }),
      para(
        "Core Web Vitals moved after we cut unused JavaScript, lazy-loaded below-the-fold images, and put the site behind Cloudflare. None of it required exotic engineering — just discipline about what ships to the client.",
      ),
      para(
        "The takeaway: technical SEO for React apps is mostly good engineering with a crawler in mind. Fix rendering, fix structure, fix speed — in that order.",
      ),
    ],
  },
  {
    _id: "post-career-switch",
    _type: "post",
    title: "From telecom engineering to shipping production code",
    slug: slug("from-telecom-engineering-to-shipping-production-code"),
    standfirst: "How I taught myself to build for the web, and what I'd do differently.",
    publishedAt: "2026-07-30T09:00:00.000Z",
    category: ref("category-career"),
    tags: [{ ...ref("tag-career"), _key: nextKey() }],
    body: [para("Placeholder body.")],
  },
  {
    _id: "post-appwrite-build-log",
    _type: "post",
    title: "Build log: a shipping-logistics platform on Appwrite",
    slug: slug("build-log-shipping-logistics-platform-on-appwrite"),
    standfirst:
      "Modeling warehouses, shipments, and real-time updates with a backend-as-a-service.",
    publishedAt: "2026-07-15T09:00:00.000Z",
    category: ref("category-build-log"),
    tags: [
      { ...ref("tag-backend"), _key: nextKey() },
      { ...ref("tag-fullstack"), _key: nextKey() },
      { ...ref("tag-personal-project"), _key: nextKey() },
    ],
    body: [para("Placeholder body.")],
  },
];

const testimonials: SanityDocument[] = [
  {
    _id: "testimonial-product-lead",
    _type: "testimonial",
    quote:
      "Ken took our scattered web presence and turned it into one coherent, fast product. He ships quickly and sweats the details.",
    attribution: "Product Lead, Mybitstore",
    // True only so the section renders locally. These quotes are NOT verified.
    isVerified: true,
  },
  {
    _id: "testimonial-marketing",
    _type: "testimonial",
    quote: "The SEO work paid for itself — our visibility climbed within months of the relaunch.",
    attribution: "Marketing, Mybitstore",
    isVerified: true,
  },
];

/* ------------------------------------------------------------------ *
 * Page singletons — genuine copy
 * ------------------------------------------------------------------ */

const pages: SanityDocument[] = [
  {
    _id: "homePage",
    _type: "homePage",
    showAvailabilityBadge: true,
    heading: "I build web products that are fast, polished, and easy to find.",
    subheading:
      "I'm Kenneth Dela Nartey — a software engineer in Accra shipping production apps with React, Next.js, and Node.js. Frontend craft, backend logic, and SEO that actually ranks.",
    primaryCta: { label: "See my work →", destination: "work" },
    secondaryCta: { label: "Get in touch", destination: "contact" },
    skillsHeading: "Skills",
    featuredWorkHeading: "Featured Work",
    featuredProjects: [
      { ...ref("project-mybitstore"), _key: nextKey() },
      { ...ref("project-shipping"), _key: nextKey() },
      { ...ref("project-banking"), _key: nextKey() },
    ],
    testimonialsHeading: "What people say",
    testimonials: [
      { ...ref("testimonial-product-lead"), _key: nextKey() },
      { ...ref("testimonial-marketing"), _key: nextKey() },
    ],
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    heading: "About me.",
    intro:
      "Engineer by training, builder by habit. I turn ambitious product ideas into fast, well-crafted web apps.",
    experienceHeading: "Experience",
    experiences: [
      { ...ref("experience-mybitstore"), _key: nextKey() },
      { ...ref("experience-independent"), _key: nextKey() },
    ],
    skillsHeading: "Skills",
  },
  {
    _id: "workPage",
    _type: "workPage",
    heading: "Selected work.",
    intro: [
      para("Production work and full-stack builds. Code for personal projects is on GitHub.", {
        links: [{ text: "GitHub", href: "https://github.com/gitdela" }],
      }),
    ],
    projects: [
      { ...ref("project-mybitstore"), _key: nextKey() },
      { ...ref("project-shipping"), _key: nextKey() },
      { ...ref("project-banking"), _key: nextKey() },
    ],
  },
  {
    _id: "blogPage",
    _type: "blogPage",
    heading: "Writing.",
    intro: [para("Notes on frontend engineering, SEO, and building things.")],
    featuredPost: ref("post-ai-in-development"),
    emptyStateMessage: "No posts with that tag yet.",
  },
  {
    _id: "contactPage",
    _type: "contactPage",
    heading: "Let's build something.",
    intro: "Hiring, or have a project in mind? Tell me about it — I reply fast.",
    elsewhereHeading: "Elsewhere",
    submitLabel: "Send message →",
    pendingLabel: "Sending…",
    successMessage: "Thanks — your message is on its way. I'll get back to you shortly.",
    errorMessage: "Something went wrong sending that. Please try again, or email me directly.",
  },
];

export const documents: SanityDocument[] = [
  siteSettings,
  profile,
  ...pages,
  ...projects,
  ...experiences,
  ...categories,
  ...tags,
  ...posts,
  ...testimonials,
];

export default documents;
