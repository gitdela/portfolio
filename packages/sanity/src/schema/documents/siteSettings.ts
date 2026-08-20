import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

/**
 * Singleton. Strictly values that apply to the entire site.
 *
 * Deliberately absent: the canonical origin, analytics verification values, the contact
 * recipient, tokens, and secrets — those are environment configuration. Navigation paths
 * and route structure stay in code.
 */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "metadata", title: "Metadata defaults" },
    { name: "cta", title: "Footer CTA" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "general",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Default author",
      type: "reference",
      group: "general",
      to: [{ type: "profile" }],
      description: "Used for article bylines and Person structured data.",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "defaultTitle",
      title: "Default meta title",
      type: "string",
      group: "metadata",
      description: "Used on pages with no title of their own — the homepage, for instance.",
      validation: (rule) => [
        rule.required(),
        rule.max(70).warning("Titles beyond ~60 characters are usually truncated in results."),
      ],
    }),
    defineField({
      name: "titleTemplate",
      title: "Title template",
      type: "string",
      group: "metadata",
      description: 'Applied to child pages. Use %s for the page title, for example "%s | Name".',
      initialValue: "%s",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === "string" && value.includes("%s")
              ? true
              : "The template must contain %s so the page title can be substituted in.",
          ),
    }),
    defineField({
      name: "defaultDescription",
      title: "Default meta description",
      type: "text",
      rows: 3,
      group: "metadata",
      validation: (rule) => [
        rule.required(),
        rule.max(170).warning("Descriptions beyond ~155 characters are usually truncated."),
      ],
    }),
    defineField({
      name: "defaultSocialImage",
      title: "Default social sharing image",
      type: "accessibleImage",
      group: "metadata",
      description: "Falls back here whenever a page or document has no image of its own.",
    }),

    defineField({
      name: "footerCta",
      title: "Repeated footer call to action",
      type: "callToAction",
      group: "cta",
      description: 'The "Work with me →" action repeated at the foot of case studies and articles.',
    }),
  ],
  preview: {
    select: { title: "siteName", subtitle: "tagline" },
  },
});
