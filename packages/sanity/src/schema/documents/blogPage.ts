import { DocumentsIcon } from "@sanity/icons/Documents";
import { defineField, defineType } from "sanity";

/** Singleton. Blog index heading, introduction, and the optional featured post. */
export const blogPage = defineType({
  name: "blogPage",
  title: "Blog page",
  type: "document",
  icon: DocumentsIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      group: "content",
      initialValue: "Writing.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "inlineText",
      group: "content",
    }),
    defineField({
      name: "featuredPost",
      title: "Featured post",
      type: "reference",
      group: "content",
      to: [{ type: "post" }],
      description:
        "Renders the accent-filled card at the top of the index. Leave empty to omit the card.",
    }),
    defineField({
      name: "emptyStateMessage",
      title: "Empty filter message",
      type: "string",
      group: "content",
      initialValue: "No posts with that tag yet.",
      description: "Shown when a tag filter matches nothing.",
      validation: (rule) => rule.required(),
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Blog page" }),
  },
});
