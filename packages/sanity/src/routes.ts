/**
 * Route structure lives in code, not in Sanity — editors choose a destination from this list
 * rather than typing a path that could drift from the App Router.
 */
export const INTERNAL_ROUTES = [
  { value: "home", title: "Home", path: "/" },
  { value: "about", title: "About", path: "/about" },
  { value: "work", title: "Work", path: "/work" },
  { value: "blog", title: "Blog", path: "/blog" },
  { value: "contact", title: "Contact", path: "/contact" },
  { value: "privacy", title: "Privacy", path: "/privacy" },
] as const;

export type InternalRoute = (typeof INTERNAL_ROUTES)[number]["value"];

const ROUTE_PATHS = new Map<string, string>(INTERNAL_ROUTES.map((r) => [r.value, r.path]));

/** Resolves a stored route key to its public path, falling back to the home page. */
export function internalRoutePath(route: string | null | undefined): string {
  if (!route) return "/";
  return ROUTE_PATHS.get(route) ?? "/";
}

export const INTERNAL_ROUTE_OPTIONS = INTERNAL_ROUTES.map(({ value, title }) => ({ value, title }));
