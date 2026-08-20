/**
 * The metadata cascade, isolated from any network or environment access so it can be
 * exercised directly.
 *
 * Plan §3 fixes the order:
 *   page or document SEO override → document title, excerpt, cover image → siteSettings defaults
 */

export interface CascadeSources {
  /** Top of the cascade: the document's own SEO override. */
  overrideTitle?: string | null | undefined;
  overrideDescription?: string | null | undefined;
  /** Middle: the document's natural title and excerpt. */
  documentTitle?: string | null | undefined;
  documentDescription?: string | null | undefined;
  /** Bottom: site-wide defaults. */
  defaultTitle?: string | null | undefined;
  defaultDescription?: string | null | undefined;
  siteName?: string | null | undefined;
}

/** Treats empty and whitespace-only strings as absent, so a blank field falls through. */
function present(value: string | null | undefined): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function resolveTitle(sources: CascadeSources): string | undefined {
  return (
    present(sources.overrideTitle) ??
    present(sources.documentTitle) ??
    present(sources.defaultTitle) ??
    present(sources.siteName)
  );
}

export function resolveDescription(sources: CascadeSources): string {
  return (
    present(sources.overrideDescription) ??
    present(sources.documentDescription) ??
    present(sources.defaultDescription) ??
    ""
  );
}

/** Canonical paths are always absolute; a caller passing "blog" still gets "/blog". */
export function resolveCanonicalPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Indexing is opt-out per document, and additionally forced off anywhere that is not the
 * production deployment — a preview URL must never compete with the canonical origin.
 */
export function resolveNoIndex(options: {
  documentNoIndex?: boolean | null | undefined;
  vercelEnv?: string | undefined;
}): boolean {
  return options.documentNoIndex === true || options.vercelEnv !== "production";
}
