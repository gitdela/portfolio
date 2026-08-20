import { CaseIcon } from "@sanity/icons/Case";
import { defineField, defineType } from "sanity";

/** Singleton. Work index heading, introduction, and the exact project order the design shows. */
export const workPage = defineType({
  name: "workPage",
  title: "Work page",
  type: "document",
  icon: CaseIcon,
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
      initialValue: "Selected work.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "inlineText",
      group: "content",
      description: "Supports inline links — the design links the word “GitHub” here.",
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "project" }] }],
      description: "Controls the exact order projects appear in on the index.",
      validation: (rule) => rule.unique(),
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Work page" }),
  },
});
