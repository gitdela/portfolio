import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

export const SOCIAL_PLATFORMS = [
  { value: "github", title: "GitHub" },
  { value: "linkedin", title: "LinkedIn" },
  { value: "x", title: "X" },
  { value: "mastodon", title: "Mastodon" },
  { value: "website", title: "Website" },
] as const;

export const socialProfile = defineType({
  name: "socialProfile",
  title: "Social profile",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: { list: [...SOCIAL_PLATFORMS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Display label",
      type: "string",
      description: 'What the visitor reads, for example "github.com/gitdela".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "url" },
  },
});
