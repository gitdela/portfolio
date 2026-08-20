import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineField, defineType } from "sanity";

/**
 * Singleton. Public contact copy only.
 *
 * The recipient address is environment configuration, not content — it never appears here.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  icon: EnvelopeIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "form", title: "Form copy" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      group: "content",
      initialValue: "Let's build something.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      type: "text",
      rows: 3,
      group: "content",
      description: "Sets the response expectation, for example “I reply fast”.",
      validation: (rule) => rule.required().max(280),
    }),
    defineField({
      name: "elsewhereHeading",
      title: "Elsewhere heading",
      type: "string",
      group: "content",
      initialValue: "Elsewhere",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "submitLabel",
      title: "Submit button label",
      type: "string",
      group: "form",
      initialValue: "Send message →",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "pendingLabel",
      title: "Submit button label while sending",
      type: "string",
      group: "form",
      initialValue: "Sending…",
      description: "Also announced to screen readers while the submission is in flight.",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      type: "text",
      rows: 3,
      group: "form",
      initialValue: "Thanks — your message is on its way. I'll get back to you shortly.",
      description: "Replaces the form once the email has been delivered.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "errorMessage",
      title: "Delivery failure message",
      type: "text",
      rows: 3,
      group: "form",
      initialValue: "Something went wrong sending that. Please try again, or email me directly.",
      description:
        "Shown at form level when delivery fails. The form stays filled in and retryable.",
      validation: (rule) => rule.required(),
    }),

    defineField({ name: "seo", title: "SEO overrides", type: "seo", group: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Contact page" }),
  },
});
