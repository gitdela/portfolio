import { layoutQuery } from "@portfolio/sanity/queries";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteNav } from "@/components/chrome/SiteNav";
import { ThemeProvider } from "@/components/chrome/ThemeProvider";
import { siteUrl } from "@/lib/env";
import { SanityLive } from "@/lib/sanity/live";
import { loadQuery } from "@/lib/sanity/loadQuery";
import { buildRootMetadata } from "@/lib/seo/metadata";
import { documentTypeTag, ROOT_LAYOUT_TAG } from "@/lib/sanity/tags";

import "./globals.css";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lato",
});

const LAYOUT_TAGS = [ROOT_LAYOUT_TAG, documentTypeTag("siteSettings"), documentTypeTag("profile")];

export async function generateMetadata(): Promise<Metadata> {
  return buildRootMetadata();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [data, { isEnabled: isDraftMode }] = await Promise.all([
    loadQuery(layoutQuery, {}, LAYOUT_TAGS),
    draftMode(),
  ]);

  const profile = data.profile;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={lato.variable}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS" href={`${siteUrl}/rss.xml`} />
      </head>
      <body className="min-h-screen">
        <NuqsAdapter>
          <ThemeProvider>
            <a
              href="#main"
              className="sr-only rounded-full bg-accent px-5 py-2.5 font-bold text-bg focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
            >
              Skip to content
            </a>

            <SiteNav
              wordmarkStrong={profile?.wordmarkStrong ?? "KEN"}
              wordmarkLight={profile?.wordmarkLight ?? "NARTEY"}
              fullName={profile?.fullName ?? "Home"}
            />

            {children}

            <div className="mx-auto max-w-column px-gutter">
              <SiteFooter
                email={profile?.email ?? null}
                location={profile?.location ?? null}
                socialProfiles={profile?.socialProfiles ?? null}
              />
            </div>
          </ThemeProvider>
        </NuqsAdapter>

        {/*
          Both are editor-only. SanityLive opens a long-lived connection to Sanity's live
          events stream, which exists to push draft edits into the Presentation preview —
          the published site has nothing to do with it and invalidates through the
          revalidation webhook's cache tags instead.

          Mounting it unconditionally meant every visitor opened that stream using the
          browser token, and when the token is absent or wrong the request fails before
          CORS headers come back, which the browser reports as a CORS error.
        */}
        {isDraftMode ? (
          <>
            <SanityLive />
            <VisualEditing />
          </>
        ) : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
