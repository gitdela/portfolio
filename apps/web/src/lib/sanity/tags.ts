/**
 * Cache tags. Production invalidation is deterministic: the webhook knows a document's
 * `_type` and `_id`, and invalidates exactly those two tags.
 *
 * `defineLive` drives the editor preview experience; these tags drive production.
 */

export const documentTypeTag = (type: string): string => `sanity:type:${type}`;
export const documentIdTag = (id: string): string => `sanity:id:${id}`;

/** Global chrome depends on these, so a change to either must bust the root layout. */
export const GLOBAL_SINGLETON_TYPES = ["siteSettings", "profile"] as const;

export const ROOT_LAYOUT_TAG = "sanity:layout";

/** Draft IDs are prefixed; the published document is what the public cache keys on. */
export function publishedId(id: string): string {
  return id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}
