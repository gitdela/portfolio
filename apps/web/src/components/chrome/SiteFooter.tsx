import type { LayoutQueryResult } from "@portfolio/sanity/types";

type ProfileData = NonNullable<LayoutQueryResult["profile"]>;

export interface SiteFooterProps {
  email: string | null;
  location: string | null;
  socialProfiles: ProfileData["socialProfiles"];
}

/**
 * The handoff ships three different footers across seven screens — the four-item link row
 * on five pages, a single line on Contact, and none at all on the case study. Normalized to
 * the four-item row everywhere; see docs/handoff-deviations.md.
 */
export function SiteFooter({ email, location, socialProfiles }: SiteFooterProps) {
  return (
    <footer className="mt-24 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-5 text-chip text-soft">
      {email ? (
        <a href={`mailto:${email}`} className="text-accent hover:underline">
          {email}
        </a>
      ) : null}

      {socialProfiles?.map((profile) =>
        profile.url && profile.label ? (
          <a
            key={profile.url}
            href={profile.url}
            rel="me noopener noreferrer"
            target="_blank"
            className="text-accent hover:underline"
          >
            {profile.label}
          </a>
        ) : null,
      )}

      {location ? <span>{location}</span> : null}
    </footer>
  );
}
