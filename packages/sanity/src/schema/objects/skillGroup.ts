import { TagsIcon } from "@sanity/icons/Tags";
import { defineField, defineType } from "sanity";

/**
 * One labelled chip row. The same ordered groups render on Home and About,
 * so they live on `profile` and are referenced from both pages.
 */
export const skillGroup = defineType({
  name: "skillGroup",
  title: "Skill group",
  type: "object",
  icon: TagsIcon,
  fields: [
    defineField({
      name: "label",
      title: "Group label",
      type: "string",
      description: 'Rendered uppercase above the chips, for example "Frontend".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Each entry renders as one chip, in this order.",
      validation: (rule) => rule.required().min(1).unique(),
    }),
  ],
  preview: {
    select: { title: "label", skills: "skills" },
    prepare({ title, skills }: { title?: string; skills?: string[] }) {
      const count = skills?.length ?? 0;
      return {
        title: title ?? "Untitled group",
        subtitle: `${String(count)} skill${count === 1 ? "" : "s"}`,
      };
    },
  },
});
