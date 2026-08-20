import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";

/**
 * Per-document overrides sitting at the top of the metadata cascade:
 * this override → document title/excerpt/cover → siteSettings defaults.
 *
 * Recommended lengths are warnings, not errors: an over-long title still
 * publishes, it just gets truncated in results.
 */
export const seo = defineType({
  name: "seo",
  title: "SEO overrides",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "title",
      title: "Meta title",
      type: "string",
      description:
        "Overrides the document title in search results and the browser tab. Around 60 characters.",
      validation: (rule) =>
        rule.max(70).warning("Titles beyond ~60 characters are usually truncated in results."),
    }),
    defineField({
      name: "description",
      title: "Meta description",
      type: "text",
      rows: 3,
      description: "Overrides the summary shown in search results. Around 155 characters.",
      validation: (rule) => [
        rule
          .min(50)
          .warning("Descriptions under ~50 characters rarely give searchers enough to act on."),
        rule.max(170).warning("Descriptions beyond ~155 characters are usually truncated."),
      ],
    }),
    defineField({
      name: "image",
      title: "Social sharing image",
      type: "accessibleImage",
      description:
        "Overrides the image used when this page is shared. Falls back to site defaults.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description: "Adds a noindex directive. The page stays publicly reachable by direct link.",
      initialValue: false,
    }),
  ],
});
