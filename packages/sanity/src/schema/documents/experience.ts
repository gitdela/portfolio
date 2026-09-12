import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineField, defineType } from "sanity";

/** One row in the About page's experience list. */
export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "periodLabel",
      title: "Period label",
      type: "string",
      description: 'The fixed-width left column, for example "2023 – now".',
      validation: (rule) => rule.required().max(20),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      description: "Used for ordering only; the visible text comes from the period label.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: 'For example "Front-end Developer, Mybitstore Technologies".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required().max(280),
    }),
  ],
  orderings: [
    {
      title: "Start date, newest first",
      name: "startDateDesc",
      by: [{ field: "startDate", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "periodLabel" },
  },
});
