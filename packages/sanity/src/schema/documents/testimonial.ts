import { BlockquoteIcon } from "@sanity/icons/Blockquote";
import { defineField, defineType } from "sanity";

/**
 * A quote. `isVerified` must be switched on before the homepage will render it — the plan
 * forbids launching with the prototype's placeholder testimonials.
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      description: "Without surrounding quotation marks — the design supplies those.",
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: "attribution",
      title: "Attribution",
      type: "string",
      description: 'The line beneath the quote, for example "Product Lead, Mybitstore".',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "isVerified",
      title: "Verified",
      type: "boolean",
      initialValue: false,
      description:
        "Off by default. Unverified quotes can be drafted and stored freely; the public query filters them out, so only verified ones ever render.",
    }),
  ],
  preview: {
    select: { quote: "quote", subtitle: "attribution", verified: "isVerified" },
    prepare({
      quote,
      subtitle,
      verified,
    }: {
      quote?: string;
      subtitle?: string;
      verified?: boolean;
    }) {
      return {
        title: quote ? `“${quote.slice(0, 60)}…”` : "Empty quote",
        subtitle: [subtitle, verified ? "Verified" : "Unverified"].filter(Boolean).join(" · "),
      };
    },
  },
});
