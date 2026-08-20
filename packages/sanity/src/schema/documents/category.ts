import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

import { isUrlSafeSlug, slugOptions } from "../lib/slug.js";

/** A post's single category, rendered uppercase in the accent colour above its title. */
export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'The human label, for example "Build log".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: slugOptions,
      description: 'The URL-safe form, for example "build-log".',
      validation: (rule) => rule.required().custom((value) => isUrlSafeSlug(value?.current)),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
