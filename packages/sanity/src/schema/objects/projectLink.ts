import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";

/**
 * One extra destination for a project that ships more than a single surface. The primary
 * action stays in the project's own `liveUrl`; these render beside it.
 */
export const projectLink = defineType({
  name: "projectLink",
  title: "Project link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'What the visitor reads, for example "Admin console ↗".',
      validation: (rule) => rule.required().max(30),
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
