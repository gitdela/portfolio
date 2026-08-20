import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

/** Singleton. About-page copy; the portrait, biography, and skill groups come from `profile`. */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  icon: UserIcon,
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
      initialValue: "About me.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 3,
      group: "content",
      description: "Sits beside the portrait, above the biography.",
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "experienceHeading",
      title: "Experience heading",
      type: "string",
      group: "content",
      initialValue: "Experience",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "experiences",
      title: "Experience entries",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "experience" }] }],
      description: "Rendered in this order, newest first.",
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "skillsHeading",
      title: "Skills heading",
      type: "string",
      group: "content",
      initialValue: "Skills",
      validation: (rule) => rule.required(),
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "About page" }),
  },
});
