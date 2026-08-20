/**
 * Document-type constants shared by the Studio and the web app.
 *
 * Deliberately free of any `sanity` import: the web app needs these to key cache tags and
 * resolve routes, and importing them from `/schema` would pull the entire Studio SDK into
 * the Next.js bundle.
 */

/** Documents that may only ever have one instance, pinned to a fixed document ID. */
export const SINGLETON_TYPES = [
  "siteSettings",
  "profile",
  "homePage",
  "aboutPage",
  "workPage",
  "blogPage",
  "contactPage",
] as const;

export type SingletonType = (typeof SINGLETON_TYPES)[number];

const SINGLETON_TYPE_SET: ReadonlySet<string> = new Set(SINGLETON_TYPES);

export function isSingletonType(type: string): type is SingletonType {
  return SINGLETON_TYPE_SET.has(type);
}

/** Collections a visitor can reach at a URL of their own. */
export const ROUTED_TYPES = ["project", "post"] as const;
