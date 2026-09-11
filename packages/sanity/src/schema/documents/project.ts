import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";

import { isUrlSafeSlug, slugOptions } from "../lib/slug.js";

/**
 * A piece of work on the Work index. Projects that also carry case-study content get a
 * `/work/[slug]` page; the rest render as index entries only.
 */
export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  icon: CaseIcon,
  groups: [
    { name: "overview", title: "Overview", default: true },
    { name: "caseStudy", title: "Case study" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "overview",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "overview",
      options: slugOptions,
      validation: (rule) => rule.required().custom((value) => isUrlSafeSlug(value?.current)),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      group: "overview",
      description: "The blurb shown on the Work index.",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "cardSummary",
      title: "Card summary",
      type: "text",
      rows: 2,
      group: "overview",
      description:
        "The shorter one-line blurb used on the homepage card. Falls back to the summary above when empty.",
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: "listingImage",
      title: "Project image",
      type: "accessibleImage",
      group: "overview",
      description:
        "The wide image shown with this project on the homepage and Work page. Leave empty to keep the text-only layout.",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      group: "overview",
      description: 'For example "Front-end Developer".',
    }),
    defineField({
      name: "dateLabel",
      title: "Date label",
      type: "string",
      group: "overview",
      description: 'Exactly as it should read, for example "2023 – now" or "2025".',
      validation: (rule) => rule.required().max(30),
    }),
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "string",
      group: "overview",
      description:
        'The longer form shown in the case-study meta row, for example "07/2023 – Present".',
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      group: "overview",
      description: "Used for ordering only; the visible text comes from the date label.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stack",
      title: "Stack",
      type: "array",
      group: "overview",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Rendered as an italic, middot-separated line.",
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "liveUrl",
      title: "Live URL",
      type: "url",
      group: "overview",
      description:
        "Leave empty to hide the live action entirely — never publish a placeholder link.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "liveLabel",
      title: "Live action label",
      type: "string",
      group: "overview",
      description: 'For example "Live site ↗" or "Live demo ↗".',
      initialValue: "Live site ↗",
    }),
    defineField({
      name: "repositoryUrl",
      title: "Repository URL",
      type: "url",
      group: "overview",
      description: "Leave empty to hide the repository action.",
      validation: (rule) => rule.uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "additionalLinks",
      title: "Additional links",
      type: "array",
      group: "overview",
      of: [{ type: "projectLink" }],
      description:
        "For a project that ships more than one surface. The main action stays in Live URL; these render beside it.",
      validation: (rule) => rule.max(3).unique(),
    }),

    defineField({
      name: "caseStudy",
      title: "Case study",
      type: "object",
      group: "caseStudy",
      description:
        "Fill this in to give the project its own page. Leave it empty and the project stays an index entry.",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: "headline",
          title: "Case study headline",
          type: "text",
          rows: 3,
          description: "The h1 on the case-study page, usually longer than the project title.",
        }),
        defineField({ name: "heroImage", title: "Hero image", type: "accessibleImage" }),
        defineField({
          name: "problem",
          title: "The problem",
          type: "inlineText",
        }),
        defineField({
          name: "approach",
          title: "The approach",
          type: "array",
          of: [{ type: "text", rows: 3 }],
          description: "One entry per bullet.",
        }),
        defineField({
          name: "supportingImage",
          title: "Supporting image",
          type: "accessibleImage",
          description: "Sits between the approach bullets and the result.",
        }),
        defineField({ name: "result", title: "The result", type: "inlineText" }),
        defineField({
          name: "relatedPosts",
          title: "Related writing",
          type: "array",
          of: [{ type: "reference", to: [{ type: "post" }] }],
          validation: (rule) => rule.unique(),
        }),
        defineField({
          name: "relatedTag",
          title: "Related tag",
          type: "reference",
          to: [{ type: "tag" }],
          description: 'Powers the smaller "All … posts" link beneath the related writing.',
        }),
      ],
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "dateLabel", media: "listingImage" },
  },
});
