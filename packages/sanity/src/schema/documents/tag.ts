import { TagsIcon } from "@sanity/icons/Tags";
import { defineField, defineType } from "sanity";

import { isUrlSafeSlug, slugOptions } from "../lib/slug.js";

/**
 * A blog tag. The UI shows the title ("Company work"); the `?tag=` parameter carries the
 * slug ("company-work").
 */
export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  icon: TagsIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'The human label shown on chips and filter pills, for example "Company work".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: slugOptions,
      description: 'What appears in ?tag=, for example "company-work".',
      validation: (rule) => rule.required().custom((value) => isUrlSafeSlug(value?.current)),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});
