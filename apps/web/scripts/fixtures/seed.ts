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

/** A code block inside an article body. */
function code(language: string, source: string, filename?: string): Record<string, unknown> {
  return {
    _type: "codeBlock",
    _key: nextKey(),
    language,
    code: source,
    ...(filename ? { filename } : {}),
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
  { _id: "tag-pexwa", _type: "tag", title: "Pexwa", slug: slug("pexwa") },
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
    _id: "project-pexwa",
    _type: "project",
    title: "Pexwa Bitcoin Exchange",
    slug: slug("pexwa-bitcoin-exchange"),
    summary:
      "A custodial Bitcoin exchange for Ghana, built end to end — the marketing website, the customer web app, the operator console, the API, the wallet signer and four background workers. Customers buy and sell BTC with mobile money, on an internal double-entry ledger and a self-hosted Bitcoin node.",
    cardSummary:
      "A custodial Bitcoin exchange for Ghana — website, web app, operator console, API, wallet signer and workers, all built and run by me.",
    role: "Sole engineer — product, design, full-stack, infrastructure",
    dateLabel: "2026 – now",
    timeline: "05/2026 – Present",
    startDate: "2026-05-21",
    stack: [
      "TypeScript",
      "Bun",
      "Hono",
      "PostgreSQL",
      "Drizzle ORM",
      "Bitcoin Core",
      "Electrs",
      "bitcoinjs-lib",
      "React",
      "Next.js",
      "Vite",
      "Tailwind CSS",
      "Docker",
      "Grafana",
    ],
    liveUrl: "https://app.pexwa.app",
    liveLabel: "Live app ↗",
    // Three public surfaces, so the single live action is not enough on its own.
    additionalLinks: [
      { _key: nextKey(), label: "Website ↗", url: "https://pexwa.app" },
      { _key: nextKey(), label: "Admin console ↗", url: "https://zeusdev.pexwa.app" },
    ],
    caseStudy: {
      headline: "Pexwa: building a Bitcoin exchange for Ghana end to end",
      problem: [
        para(
          "Buying and selling Bitcoin in Ghana mostly happens through informal channels — agents on WhatsApp, peer-to-peer chats, and platforms built for somewhere else. The money people actually hold is mobile money, and most of those platforms do not take it. The ones that do ask for a level of technical confidence that ordinary customers do not have.",
        ),
        para(
          "I wanted to build the alternative properly rather than as a demonstration: a broker where a customer signs up, verifies their identity once, pays with MTN MoMo or Telecel Cash in cedis, and receives Bitcoin they can withdraw to their own wallet. That is a small product on the surface and a large one underneath. It means holding other people's money, keeping an exact record of every balance, running a Bitcoin node that never misses a deposit, satisfying identity checks that a compliance review would accept, and giving an operator a way to see and correct anything that goes wrong.",
        ),
        para(
          "It also meant there was nobody else to do any of it. No backend team, no designer, no infrastructure engineer, no operations staff. The brand and design system, the marketing site, the customer app, the operator console, the API, the wallet signer, the database, the servers, the monitoring and the runbooks all had to be designed, built, deployed and operated by one person — and had to be good enough that real money could eventually move through them.",
        ),
      ],
      approach: [
        "I started with the product specification rather than the code. Pexwa is a broker, not an order-book exchange, and I wrote down what it is not as carefully as what it is: no swaps, no leverage, no order books, no fiat wallet balances, no card or bank rails. The fastest way to never ship a money product is to let it quietly grow into a trading terminal, so the non-scope list became a rule the whole system is checked against.",
        "The customer-facing surfaces share one design system. I used Claude Design to explore the visual direction, then wrote the system down as a contract: a platform-neutral token package is the only source anyone edits by hand, and the CSS variables, Tailwind mappings, typed TypeScript objects and React Native theme objects are all generated from it rather than copied. Components take semantic properties — variant, size, tone, status — and never accept a raw colour. Product rules live in the system too: buy is never green and sell is never red, because colour should not tell a customer which direction is the good one.",
        "There are three separate frontends. The marketing website is Next.js with a Sanity CMS behind it, so the blog, help centre, FAQs and legal documents can be edited without a deployment, and a signed webhook revalidates only the pages a change actually affects. The customer web app is React with Vite and React Router, and the operator console is a second React and Vite application with forty-two lazily loaded pages. When I redesigned the customer app onto a new design system I kept eleven redirect routes so that every URL from the previous version still resolves.",
        "Identity was the part I was most careful about. Legal identity never comes from the customer's keyboard — signup collects a display name and an age attestation, and the legal name, date of birth and country are read off a government ID by the verification provider and written to the account exactly once, at approval. Verification is a seven-state machine that the backend owns and the interface only renders. One of those states deliberately hides its cause: a manual review, a document already used by another account, and an age failure all present identically, because telling a customer which one it was tells someone probing the system how to get around it.",
        "The API is Hono running on Bun: around a hundred and sixty routes, every one described in OpenAPI and validated with Zod. Authentication is Better Auth with email one-time codes, usernames and two-factor, wrapped so it is never called directly over HTTP. Every admin mutation requires a second factor, fourteen separate rate limiters cover the endpoints that deserve their own budget, and every provider webhook is verified by signature over the raw body before a single field of it is trusted.",
        "Balances are never written directly. Every movement is an entry in an internal double-entry ledger, which is the only source of truth for what anyone owns; there are two buckets, available and locked, and money math is integer-only — satoshis as bigints, fiat as pesewas — with no floating point anywhere near it. Everything that touches the chain is idempotent, keyed so that a rescan or a replayed webhook costs nothing: a deposit credit is keyed on the transaction id and output index, and re-processing it is a no-op rather than a second credit.",
        "Custody is split into its own process. The signer is the only thing in the system that holds the master extended private key, and the API, the observer and the workers refuse to start if that key is present in their environment. They ask the signer for work through a Postgres queue claimed with row-level locking and a lease, so a signer that dies halfway through a job can have that job safely reclaimed without any risk of signing it twice.",
        "I run the Bitcoin side myself — bitcoind and Electrs on their own host behind an Electrum TLS front door — rather than depending on a hosted API. Business code only ever sees a chain-provider interface, so moving between my own node and a third-party provider is one environment variable. The same boundary pattern covers payments, mobile money, prices, identity and evidence storage: each has a real implementation and a deterministic mock, and the test suite forces the mock, so the entire suite runs without a single provider account.",
        "The hardest bug was a deposit that had already been credited disappearing from the chain in staging. It would have been easy to write that off as a monitoring false positive; it was a genuine chain reorganisation. The observer keeps a canonical snapshot of every watched address and reconciles against it continuously, so a displaced transaction is detected, the credit is corrected, and an alert fires naming the transaction. Reorgs are the class of bug that costs money quietly, and I would rather the system be noisy about them than polite.",
        "Four background processes run the rails: a deposit observer, a settlement worker, a notification worker and a KYC worker, all built from the same image and separated only by a role variable. The settlement worker runs seven independent loops — payout polling, charge polling, confirmation sync, price feed and the rest — each with its own deadline and error boundary, so one provider call hanging cannot starve the other six. Prices come from a single writer that stores a snapshot in the database rather than every process polling independently, and buy and sell spreads are asymmetric and adjustable by an operator without a deployment.",
        "Running it is part of building it. Six processes come out of one Docker image, and a per-process credential matrix decides which secrets each role is even allowed to see — the wrong pairing fails at boot rather than at the moment it matters. Three narrow Postgres roles are verified against a written grant matrix by a script. The deploy script refuses a dirty working tree, refuses to deploy past an unapplied migration, tags every image with the commit it came from, waits on a readiness endpoint and prints the rollback command rather than guessing. Logs and metrics ship to Grafana, ninety-nine alert rules cover chain health, reconciliation staleness, uncredited deposits, certificate expiry and worker heartbeats, and a timer writes a canary heartbeat so that a dead logging pipeline is itself something that alerts.",
      ],
      result: [
        para(
          "The platform runs end to end on Bitcoin Testnet4 from a deployed staging environment. A customer can sign up, verify their identity, buy Bitcoin with mobile money, receive an on-chain deposit, send Bitcoin to another Pexwa user and withdraw to an external address. An operator can see all of it and act on any of it from the console.",
        ),
        para(
          "Mainnet is not live, and that is deliberate. Real money moves only after a readiness review I have not signed off. Nineteen live acceptance steps have passed against the real chain with real testnet coins, including the reorganisation that the observer caught and corrected, and everything still outstanding is tracked in one prioritised gap register rather than scattered through to-do comments in the code.",
        ),
        para(
          "As it stands the system is six backend processes, around a hundred and sixty API routes, forty-seven database tables behind seventy-nine migrations, three frontends, roughly fifteen hundred automated tests and ninety-nine alert rules, spread across three repositories with a mobile client in progress.",
        ),
        para(
          "What the project actually taught me is what it costs to own something completely. Nothing here was handed over by another team, and when something blocked, finding the cause was mine: a webhook signature composed in the wrong order, a rotating refresh token racing itself and logging people out, a logging agent's permissions quietly masking container DNS, a deploy that appeared to succeed while silently restoring a pre-fix image. Each of those became a fix, a test, an alert or a gate in the deploy script, so the same failure cannot happen unobserved twice.",
        ),
      ],
      relatedPosts: [
        { ...ref("post-credited-deposit-vanished"), _key: nextKey() },
        { ...ref("post-wallet-signer-own-process"), _key: nextKey() },
        { ...ref("post-one-design-system-four-surfaces"), _key: nextKey() },
      ],
      relatedTag: ref("tag-pexwa"),
    },
  },
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
 * Blog posts and testimonials
 *
 * The three Pexwa build-log posts are genuine content, written to be published and linked
 * from the Pexwa case study's "Related writing".
 *
 * Everything after them — the remaining posts and both testimonials — is PLACEHOLDER,
 * marked as drafts in the handoff and forbidden at launch by plan §1. Those are present
 * only so the blog index, tag filter, article template, and testimonial section can be
 * exercised. See docs/handoff-deviations.md.
 * ------------------------------------------------------------------ */

const posts: SanityDocument[] = [
  /* ---------------------------------------------------------------- *
   * Pexwa build log — genuine content, linked from the Pexwa case study.
   * ---------------------------------------------------------------- */
  {
    _id: "post-credited-deposit-vanished",
    _type: "post",
    title: "The day a credited deposit vanished",
    slug: slug("the-day-a-credited-deposit-vanished"),
    standfirst:
      "A deposit had been confirmed and credited to a customer's balance. Then it was not on the chain any more. The comfortable explanation was a bug in my monitoring. The real one was worse, and more interesting.",
    publishedAt: "2026-08-21T09:00:00.000Z",
    category: ref("category-build-log"),
    tags: [
      { ...ref("tag-pexwa"), _key: nextKey() },
      { ...ref("tag-backend"), _key: nextKey() },
    ],
    body: [
      para(
        "On a Tuesday in August an alert fired on the Pexwa staging environment with a name I had written myself and half hoped never to see: a credited deposit had been displaced. A transaction the system had already confirmed, credited, and shown to a customer as spendable balance was no longer in the chain my node could see.",
      ),
      para(
        "My first thought was that the monitoring was wrong. That is almost always the right first thought, and it is almost always a trap.",
      ),

      para("What actually happened", { style: "h2" }),
      para(
        "Pexwa holds customer Bitcoin. A deposit arrives at an address the system derived for a particular customer, the deposit observer sees it, waits for confirmations, and writes a ledger entry crediting that customer. The entry is keyed on the transaction id and the output index, so the same deposit can never be credited twice no matter how many times the observer rescans.",
      ),
      code("text", "btc-deposit:{txid}:{vout}", "The idempotency key on a deposit credit"),
      para(
        "What that key does not protect against is the transaction ceasing to exist. Bitcoin's chain is not a list that only ever grows. When two miners find a block at nearly the same moment the network briefly disagrees about which one is real, and the losing branch is discarded. Transactions in the discarded blocks go back to being unconfirmed, and if the winning branch does not include them, they may never confirm at all.",
      ),
      para(
        "That is a reorganisation — a reorg. On testnet, where the hash rate is small and erratic, they are a fact of life rather than a curiosity. Which is exactly why I insisted on running the entire money path there before running it anywhere with real money in it.",
      ),

      para("Why this is worse for a custodian than for a wallet", { style: "h2" }),
      para(
        "If you run your own wallet and a deposit gets reorganised away, you watch a number change and you wait. It is annoying. It is not a loss.",
      ),
      para(
        "If you are holding the money, the same event is a hole in your balance sheet. The customer's balance said the coins were there. Had they traded or withdrawn against that balance in the window before anyone noticed, the platform would have paid out against Bitcoin it no longer had. The chain would have been right, my database would have been wrong, and the difference would have come out of the business.",
      ),
      para(
        "A confirmation is a probability, not a receipt. Treating it as a receipt is how a custodian loses money quietly.",
        { style: "blockquote" },
      ),

      para("Making it detectable at all", { style: "h2" }),
      para(
        "The reason an alert fired is that the observer does not simply react to events as they arrive. For every address it watches it keeps a canonical snapshot: which transactions it believes are in the chain, at which height, in which block. A reconciliation loop compares that snapshot against what the node reports now.",
      ),
      bullet(
        "A transaction that was in the snapshot at a given height and is now absent is a displacement, and is treated as one.",
      ),
      bullet(
        "A transaction that has moved to a different height is not missing — it was re-mined into the winning branch, and the snapshot is simply updated.",
      ),
      bullet(
        "A disagreement between what Bitcoin Core and Electrs say about the same block is its own separate alert, because if my two views of the chain do not agree, no number on the screen can be trusted.",
      ),
      para(
        "Without that snapshot there is nothing to compare against. The system would only ever know the current state of the chain, which always looks internally consistent. The entire ability to notice comes from having written down what you believed earlier.",
      ),

      para("Correcting without lying about the past", { style: "h2" }),
      para(
        "Ledger entries are immutable. I do not go back and delete the credit, and I do not edit it. The original entry is a true record that the system did, at that moment, credit that deposit. What happens instead is a compensating entry that reverses it, carrying a reference to the deposit that was displaced.",
      ),
      para(
        "This is the part double-entry actually buys you. A balance is a function of the entries, so correcting a balance means adding a fact rather than removing one. When somebody asks six months later why a customer's balance changed on that Tuesday, the answer is in the ledger instead of in my memory.",
      ),

      para("The second one was not a reorg", { style: "h2" }),
      para(
        "A week later the same alert fired again, and that time it was a false positive. The observer had asked for a view of the chain while the node could not properly answer, and the empty answer was read as “the transaction is gone” rather than “I do not know right now”.",
      ),
      para(
        "That distinction — absent versus unknown — mattered more than anything else in the whole incident. Code that treats a failed lookup as a negative result will invent displacements that never happened, and after two or three of those nobody believes the alerts any more. An alert nobody believes is worse than no alert: it costs the same to run and buys nothing.",
      ),
      para(
        "So the sweep is bounded now and the two failure modes are kept apart. A reconciliation that cannot get an answer says so and retries. Only an answer that positively contradicts the snapshot counts as a displacement.",
      ),
      para(
        "The lesson generalises well past Bitcoin. In code that touches money, “the lookup failed” and “the thing is not there” must never end up in the same branch.",
      ),

      para("What changed, and what is still open", { style: "h2" }),
      bullet(
        "The reconciliation sweep is bounded, so one stuck call cannot wedge the loop for every other address.",
      ),
      bullet(
        "Displacement, height change and provider disagreement are three alerts with three meanings, not one catch-all.",
      ),
      bullet(
        "Both incidents have regression tests, so the behaviour is pinned down rather than remembered.",
      ),
      bullet(
        "The confirmation threshold is configuration rather than a constant, because the right number for testnet is not the right number for mainnet.",
      ),
      para(
        "What is still open is the judgement call: how many confirmations before a deposit becomes spendable on mainnet, and whether a large deposit should wait longer than a small one. That is a risk decision rather than an engineering one, and it sits on the list of things that have to be settled before real money moves through the system.",
      ),
      para(
        "The bug cost me a few days. Finding it on testnet, in a system I had deliberately made noisy, cost me nothing else at all. That was the entire point of running it there first.",
      ),
    ],
  },
  {
    _id: "post-wallet-signer-own-process",
    _type: "post",
    title: "Why the wallet signer is its own process",
    slug: slug("why-the-wallet-signer-is-its-own-process"),
    standfirst:
      "One process holds the master key. Every other process refuses to start if it can even see that key. They talk to each other through a Postgres table. Here is what that boundary buys, and what it costs.",
    publishedAt: "2026-08-28T09:00:00.000Z",
    category: ref("category-build-log"),
    tags: [
      { ...ref("tag-pexwa"), _key: nextKey() },
      { ...ref("tag-backend"), _key: nextKey() },
    ],
    body: [
      para(
        "Pexwa is custodial, which means it holds the private keys for customer Bitcoin. Everything else in the system is a detail next to that. If the keys leak there is no recovery, no rollback, and no apology that helps.",
      ),
      para(
        "So the first architectural decision was not about frameworks or databases. It was about where the key is allowed to be.",
      ),

      para("The boundary is a process, not a module", { style: "h2" }),
      para(
        "The obvious version is a module: a signing service inside the API, with a comment asking people not to import it carelessly. It is far less code, and it is what I would have written a few years ago.",
      ),
      para(
        "The problem is what it makes true. If signing runs inside the API process, the key material is in the API's memory and the API's environment. Every path into that process becomes a path to the key — a dependency with a vulnerability, a logging call that serialises more than it should, a debug route somebody forgot to remove. A comment is not a boundary.",
      ),
      para(
        "So the signer is its own process. It has no HTTP port and nothing can reach it over the network. It reads work from the database, signs, and writes the result back.",
      ),

      para("Fail closed at boot, not at use", { style: "h2" }),
      para(
        "Separating the signer is only half of it. The other half is making it impossible for the key to end up anywhere else by accident.",
      ),
      para(
        "Every process declares its role, and there is a table of which environment fields each role requires and which it is forbidden. The signer requires the master key. The API, the deposit observer and the workers forbid it. If that key is present in the environment of a process that must not have it, the process refuses to start.",
      ),
      code(
        "text",
        "wallet-backend     requires  WALLET_BACKEND_MASTER_XPRV\napi                forbids   WALLET_BACKEND_MASTER_XPRV\ndeposit-observer   forbids   WALLET_BACKEND_MASTER_XPRV\nsettlement-worker  forbids   WALLET_BACKEND_MASTER_XPRV",
        "The rule, in words",
      ),
      para(
        "The timing is the point. A check that runs when the key is used will pass every day until the day something unusual happens. A check that runs at boot fails immediately and loudly, in front of whoever is deploying, at the one moment when fixing it is cheap. A misconfigured deployment never serves a single request.",
      ),
      para(
        "The same table covers the rest of the secrets. Session secrets and the mobile signing keys are API-only. The Electrum connection belongs to the API and the observer, because the settlement worker broadcasts through Core instead. The payment provider key is rejected for the observer, which has no business talking to a payment provider at all. Every rule exists because I went through what each process genuinely imports.",
      ),
      para(
        "It has an unglamorous cost. The shared development environment file is rejected by three of the roles, so those three carry their own derived files, and when the shared one changes they have to be regenerated by hand. I have not found a version of this that is both strict and convenient.",
      ),

      para("A database table is a perfectly good queue", { style: "h2" }),
      para(
        "With no network path to the signer, the API needs another way to ask for a signature. The usual answer is a queue — Redis, a broker, a hosted service.",
      ),
      para(
        "I used a Postgres table. The API inserts a signing request. The signer polls for unclaimed rows, claims one, does the work, writes the result back. There are two of these: one for signing requests, one for address generation.",
      ),
      para(
        "The reason is not that message brokers are bad. It is that a broker is another moving part, with its own failure modes, its own persistence story and its own operational surface, solving a problem the database I already depend on solves correctly. A signing request is a row that must not be lost and must not be processed twice. That is precisely what a transactional database is for.",
      ),
      para(
        "Claiming a row uses row-level locking that skips rows another worker already holds, so two signers can run side by side and never pick up the same job.",
      ),
      code(
        "sql",
        "select * from btc_signing_requests\nwhere status = 'queued'\norder by created_at\nlimit 1\nfor update skip locked;",
        "Claiming a job, in essence",
      ),

      para("The job claimed by a process that died", { style: "h2" }),
      para(
        "The failure this design does not survive on its own is a signer that claims a job and then dies — an out-of-memory kill, a host reboot, a deploy at an unlucky moment. The row is claimed, so no other signer will touch it, and the process that claimed it no longer exists. The job sits there forever and a customer's withdrawal never goes out.",
      ),
      para(
        "The fix is a lease. A claim is not permanent; it is held for a period and has to be renewed. When a lease expires, another signer may reclaim the job.",
      ),
      para(
        "The subtlety is that reclaiming must never mean signing twice. A Bitcoin transaction signed and broadcast twice over different inputs is not a duplicate message — it is potentially a double spend of the platform's own coins. Reclaim is only safe because of what surrounds it: a job records what it produced before it is considered finished, and a reclaimed job checks for that result before starting again. The lease makes the work available; the recorded result makes repeating it harmless.",
      ),

      para("What it costs", { style: "h2" }),
      bullet(
        "More processes. Six in total, built from one image, each with its own environment — more to deploy, more to monitor, more to hold in your head.",
      ),
      bullet(
        "Latency. A signature is no longer a function call; it is an insert, a poll and a write-back. For a withdrawal that does not matter. For anything interactive it would.",
      ),
      bullet(
        "A sharper failure mode. If the signer is down, signing stops. That is visible and it alerts, which is correct — but it is now a thing that can be down.",
      ),
      para(
        "None of that is free, and on a smaller product it would be over-engineering. The test I applied was simple: if this goes wrong, is it recoverable? A slow withdrawal is recoverable. A leaked master key is not. When the two sides of a trade-off are that lopsided, a few extra moving parts are cheap.",
      ),
      para(
        "The shape is worth stealing even if you never touch Bitcoin. Put the irreversible thing in its own process, give it no network surface, let it pull work rather than receive it, and make every other process fail at boot if it can see what it should not.",
      ),
    ],
  },
  {
    _id: "post-one-design-system-four-surfaces",
    _type: "post",
    title: "One design system, four surfaces",
    slug: slug("one-design-system-four-surfaces"),
    standfirst:
      "A marketing site, a customer app, an operator console and a phone app that all have to look like one product — without four copies of the same colour values quietly drifting apart.",
    publishedAt: "2026-09-08T09:00:00.000Z",
    category: ref("category-build-log"),
    tags: [
      { ...ref("tag-pexwa"), _key: nextKey() },
      { ...ref("tag-frontend"), _key: nextKey() },
    ],
    body: [
      para(
        "Pexwa has four front ends: a marketing website, the customer web app, an operator console, and a mobile app. Two of them are built with completely different tooling from the other two, and one of them is not a browser at all.",
      ),
      para(
        "There is one of me. The only way that works is if the design decisions live in a single place and everything else is downstream of it.",
      ),

      para("One source, everything else generated", { style: "h2" }),
      para(
        "The only artefact anyone edits by hand is a token package: a plain data file describing colours, type, spacing, radii, motion durations and the rest.",
      ),
      para(
        "From it are generated the CSS custom properties the web apps consume, the Tailwind theme mapping, a typed TypeScript object for code that needs values rather than class names, and the theme objects the React Native app uses — where there is no CSS at all.",
      ),
      para(
        "The rule that matters is not “we have tokens”. Plenty of projects have tokens and still drift. The rule is that generated output is never hand-edited. The moment somebody tweaks a hex value in the CSS file because it is faster than regenerating, there are two sources of truth and one of them is lying.",
      ),
      code(
        "json",
        '{\n  "primitive": { "blue-600": "#494fdf" },\n  "semantic":  { "action-default": "{primitive.blue-600}" },\n  "component": { "button-primary-bg": "{semantic.action-default}" }\n}',
        "Three tiers, simplified",
      ),
      para(
        "The tiers matter as much as the generation. Primitives are raw values, and nothing in a component may reference one directly. Components reference semantic or component-level tokens. That indirection is what turns a theme change into a token change rather than a search-and-replace across four codebases.",
      ),

      para("Components take meaning, not colour", { style: "h2" }),
      para(
        "No component in the system accepts a colour. The props are variant, size, tone and status — words about intent. A caller cannot pass a hex value, and cannot pass “red” either.",
      ),
      para(
        "It is restrictive on purpose. A component that accepts a colour is a component whose appearance is decided at every call site, which means the design system describes what things could look like rather than what they do look like. Once a colour can be passed in, consistency stops being a type problem and becomes a code-review problem, and code review is where consistency goes to die.",
      ),
      para(
        "The same principle settled some smaller arguments. A button in a loading state composes a spinner and sets the right accessibility attribute, instead of taking an opaque boolean that hides behaviour behind a flag. An invalid field marks the wrapper and the control separately, because the styling and the announcement to a screen reader are two different jobs that happen to occur together.",
      ),

      para("Some rules are product decisions, not preferences", { style: "h2" }),
      para("The system also carries constraints that have nothing to do with aesthetics."),
      para("Buy is never green and sell is never red.", { style: "blockquote" }),
      para(
        "That one is not about taste. Green and red on a financial control tell the customer which direction is the good one. Buying is not good and selling is not bad — they are two things a person might reasonably want to do with their own money. Colouring them like a profit-and-loss statement nudges people, and nudging people about their own money is not a business I want to be in.",
      ),
      para(
        "There is a banned-language list for the same reason, and a rule that price figures never render in the monospace face the rest of the numerics use, because a price that looks like a code sample reads as machine output rather than an offer being made to a person.",
      ),

      para("The shared package cannot know which framework it is in", { style: "h2" }),
      para(
        "The website is Next.js. The customer app and the console are Vite. The mobile app is React Native. A shared component that imports one framework's router is not shared — it is a Next.js component the other three have to work around.",
      ),
      para(
        "So the shared package has no framework imports at all. Anything that navigates takes a callback, and each host application supplies the kind of link it actually has. It is a slightly awkward API, and it is the reason the same header renders in three applications without a fork.",
      ),

      para("Failure conditions you can actually check", { style: "h2" }),
      para(
        "The part I would recommend most is the least glamorous: writing down what a wrong result looks like.",
      ),
      para(
        "The system has an explicit list of conditions that mean the work is not done. Not guidelines — conditions. A light theme containing a black band, or a drop shadow, or a leftover colour from the previous brand, or the old typeface, or a monospace price, or an overlay with an exterior shadow. Any one of those and the work has failed, whatever the screenshots look like.",
      ),
      para(
        "There is a matching rule for the documentation: the design index is updated in the same change as the token or component it describes, and a lint compares the token source, the generated output, the component exports and that index against each other. Documentation that is allowed to be updated later is documentation that is wrong.",
      ),

      para("Where it actually stands", { style: "h2" }),
      para("I would rather be honest about this than present it as finished."),
      para(
        "The website and the shared content components consume the shared package. The customer app does not — it was rebuilt on a token-exact system of its own, and the two coexist today. The new tokens are deliberately scoped rather than global so they cannot collide with the old ones, and that scope collapses at a named cutover step which has not happened yet.",
      ),
      para(
        "That is a migration in progress, and I know exactly which phase it stops being one. What I was not willing to do was let the two systems blend into each other in the meantime, which is how you end up with a third system nobody designed.",
      ),
      para(
        "The measure of whether any of it worked is not how the tokens are structured. It is that I can open the operator console and the customer app side by side and see that the same company built both — and that when a colour changes, it changes once.",
      ),
    ],
  },

  /* ---------------------------------------------------------------- *
   * PLACEHOLDER posts — see the section note above.
   * ---------------------------------------------------------------- */
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
      { ...ref("project-pexwa"), _key: nextKey() },
      { ...ref("project-mybitstore"), _key: nextKey() },
      { ...ref("project-shipping"), _key: nextKey() },
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
      { ...ref("project-pexwa"), _key: nextKey() },
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
