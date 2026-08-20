import { ImageIcon } from "@sanity/icons/Image";
import { defineField, defineType } from "sanity";

/**
 * Every image on the public site goes through this type so alt text can never be skipped.
 * Decorative images opt out explicitly rather than by leaving the field blank.
 */
export const accessibleImage = defineType({
  name: "accessibleImage",
  title: "Image",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description:
        "Describe the image for screen readers and for when the image fails to load. Leave blank only if the image is purely decorative.",
      validation: (rule) =>
        rule.custom((alt, context) => {
          const parent = context.parent as { decorative?: boolean } | undefined;
          if (parent?.decorative) return true;
          if (typeof alt === "string" && alt.trim().length > 0) return true;
          return "Alternative text is required unless the image is marked decorative.";
        }),
    }),
    defineField({
      name: "decorative",
      title: "Decorative only",
      type: "boolean",
      description:
        "Hides the image from screen readers. Use only when the image adds no information.",
      initialValue: false,
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional visible caption rendered beneath the image.",
    }),
  ],
  preview: {
    select: { media: "asset", title: "alt", subtitle: "caption" },
  },
});
