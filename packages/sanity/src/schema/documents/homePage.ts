import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";

/** Singleton. Hero copy plus the ordering and references the homepage sections render. */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "showAvailabilityBadge",
      title: "Show the availability badge",
      type: "boolean",
      group: "hero",
      initialValue: true,
      description: "The badge only renders when the profile is also marked available for work.",
    }),
    defineField({
      name: "heading",
      title: "Hero heading",
      type: "text",
      rows: 3,
      group: "hero",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "subheading",
      title: "Hero subheading",
      type: "text",
      rows: 3,
      group: "hero",
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary call to action",
      type: "callToAction",
      group: "hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary call to action",
      type: "callToAction",
      group: "hero",
    }),

    defineField({
      name: "skillsHeading",
      title: "Skills section heading",
      type: "string",
      group: "sections",
      initialValue: "Skills",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredWorkHeading",
      title: "Featured work heading",
      type: "string",
      group: "sections",
      initialValue: "Featured Work",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredProjects",
      title: "Featured projects",
      type: "array",
      group: "sections",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Up to three, rendered in this order.",
      validation: (rule) => rule.max(3).unique(),
    }),
    defineField({
      name: "testimonialsHeading",
      title: "Testimonials heading",
      type: "string",
      group: "sections",
      initialValue: "What people say",
    }),
    defineField({
      name: "testimonials",
      title: "Testimonials",
      type: "array",
      group: "sections",
      of: [{ type: "reference", to: [{ type: "testimonial" }] }],
      description:
        "Up to two. Leave empty to hide the section entirely — never publish placeholder quotes.",
      validation: (rule) => rule.max(2).unique(),
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
