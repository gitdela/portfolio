import { ArrowRightIcon } from "@sanity/icons/ArrowRight";
import { defineField, defineType } from "sanity";

import { INTERNAL_ROUTE_OPTIONS } from "../../routes.js";

/** A pill button pointing at one of the site's own routes. */
export const callToAction = defineType({
  name: "callToAction",
  title: "Call to action",
  type: "object",
  icon: ArrowRightIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'Button text, for example "See my work →".',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "string",
      options: { list: [...INTERNAL_ROUTE_OPTIONS], layout: "radio" },
      initialValue: "contact",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "destination" },
  },
});
