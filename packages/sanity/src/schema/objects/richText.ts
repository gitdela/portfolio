import { defineArrayMember, defineField, defineType } from "sanity";

import { INTERNAL_ROUTE_OPTIONS } from "../../routes.js";

/**
 * Link annotations. External and internal are separate marks so the renderer can decide
 * `target`/`rel` from the type rather than by sniffing the href.
 */
const externalLinkAnnotation = defineArrayMember({
  name: "externalLink",
  title: "External link",
  type: "object",
  fields: [
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https", "mailto", "tel"] }),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      initialValue: true,
    }),
  ],
});

const internalLinkAnnotation = defineArrayMember({
  name: "internalLink",
  title: "Internal link",
  type: "object",
  fields: [
    defineField({
      name: "destination",
      title: "Destination",
      type: "string",
      options: { list: [...INTERNAL_ROUTE_OPTIONS] },
      validation: (rule) => rule.required(),
    }),
  ],
});

/**
 * Full article body. Heading levels start at h2 because the page supplies the single h1.
 */
export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraph", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [externalLinkAnnotation, internalLinkAnnotation],
      },
    }),
    defineArrayMember({ type: "accessibleImage" }),
    defineArrayMember({ type: "codeBlock" }),
    defineArrayMember({ type: "callout" }),
  ],
});

/**
 * Single-paragraph copy that still needs inline links — page introductions, for instance.
 * No headings, no lists, no embedded blocks.
 */
export const inlineText = defineType({
  name: "inlineText",
  title: "Text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Paragraph", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [externalLinkAnnotation, internalLinkAnnotation],
      },
    }),
  ],
});
