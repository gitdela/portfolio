const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Combining diacritical marks, stripped after NFKD so "é" collapses to "e". */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/**
 * Slugs are part of the public URL and of the `?tag=` contract, so they must be
 * lowercase and URL-safe. "Company work" becomes "company-work"; the human label
 * stays on the document's title field.
 */
export function isUrlSafeSlug(value: string | undefined): true | string {
  if (!value) return "A slug is required.";
  if (!SLUG_PATTERN.test(value)) {
    return "Use lowercase letters, numbers, and single hyphens only — for example “company-work”.";
  }
  if (value.length < 2) return "Slugs need at least two characters to be meaningful.";
  if (value.length > 96) return "Slugs longer than 96 characters make for unwieldy URLs.";
  return true;
}

/** Normalizes an arbitrary title into the slug shape `isUrlSafeSlug` accepts. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export const slugOptions = {
  source: "title",
  maxLength: 96,
  slugify,
};
