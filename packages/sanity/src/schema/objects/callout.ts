import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineField, defineType } from "sanity";

export const CALLOUT_TONES = [
  { value: "note", title: "Note" },
  { value: "tip", title: "Tip" },
  { value: "warning", title: "Warning" },
] as const;

export const callout = defineType({
  name: "callout",
  title: "Callout",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: { list: [...CALLOUT_TONES], layout: "radio", direction: "horizontal" },
      initialValue: "note",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { tone: "tone", subtitle: "content" },
    prepare({ tone, subtitle }: { tone?: string; subtitle?: string }) {
      const title = tone ? `${(tone[0] ?? "").toUpperCase()}${tone.slice(1)}` : "Callout";
      return { title, subtitle: subtitle ?? "" };
    },
  },
});
