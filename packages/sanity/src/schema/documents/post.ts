import { ComposeIcon } from "@sanity/icons/Compose";
import { defineField, defineType } from "sanity";

import { isUrlSafeSlug, slugOptions } from "../lib/slug.js";

/**
 * A blog article. Reading time is derived from the body at render time rather than typed
 * in, so it can never drift from the content.
 */
export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  icon: ComposeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "taxonomy", title: "Taxonomy" },
    { name: "media", title: "Media" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: slugOptions,
      validation: (rule) => rule.required().custom((value) => isUrlSafeSlug(value?.current)),
    }),
    defineField({
      name: "standfirst",
      title: "Standfirst",
      type: "text",
      rows: 3,
      group: "content",
      description: "The larger paragraph under the title. Doubles as the index blurb.",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "publishedAt",
      title: "Publication date",
      type: "datetime",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "richText",
      group: "content",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      group: "taxonomy",
      to: [{ type: "category" }],
      description: "Exactly one. Rendered uppercase in the accent colour above the title.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "taxonomy",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
      description: "Drive the ?tag= filter on the blog index.",
      validation: (rule) => rule.unique(),
    }),

    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "accessibleImage",
      group: "media",
    }),
    defineField({
      name: "socialImage",
      title: "Social sharing image",
      type: "accessibleImage",
      group: "media",
      description: "Falls back to the cover image, then to the site default.",
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  orderings: [
    {
      title: "Publication date, newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      category: "category.title",
      publishedAt: "publishedAt",
      media: "coverImage",
    },
    prepare({
      title,
      category,
      publishedAt,
      media,
    }: {
      title?: string;
      category?: string;
      publishedAt?: string;
      media?: unknown;
    }) {
      const date = publishedAt ? new Date(publishedAt).toISOString().slice(0, 10) : "No date";
      return {
        title: title ?? "Untitled post",
        subtitle: [category, date].filter(Boolean).join(" · "),
        media: media as never,
      };
    },
  },
});
