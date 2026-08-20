import { CodeBlockIcon } from "@sanity/icons/CodeBlock";
import { defineField, defineType } from "sanity";

export const CODE_LANGUAGES = [
  { value: "typescript", title: "TypeScript" },
  { value: "tsx", title: "TSX" },
  { value: "javascript", title: "JavaScript" },
  { value: "jsx", title: "JSX" },
  { value: "json", title: "JSON" },
  { value: "html", title: "HTML" },
  { value: "css", title: "CSS" },
  { value: "bash", title: "Shell" },
  { value: "sql", title: "SQL" },
  { value: "groq", title: "GROQ" },
  { value: "text", title: "Plain text" },
] as const;

export const codeBlock = defineType({
  name: "codeBlock",
  title: "Code block",
  type: "object",
  icon: CodeBlockIcon,
  fields: [
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      options: { list: [...CODE_LANGUAGES] },
      initialValue: "typescript",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "filename",
      title: "Filename",
      type: "string",
      description: "Optional caption shown above the snippet.",
    }),
    defineField({
      name: "code",
      title: "Code",
      type: "text",
      rows: 12,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { language: "language", filename: "filename", code: "code" },
    prepare({ language, filename, code }: { language?: string; filename?: string; code?: string }) {
      return {
        title: filename ?? `${language ?? "code"} snippet`,
        subtitle: code?.split("\n")[0]?.trim() ?? "",
      };
    },
  },
});
