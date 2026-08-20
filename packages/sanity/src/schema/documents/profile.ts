import { UserIcon } from "@sanity/icons/User";
import { defineField, defineType } from "sanity";

/**
 * Singleton. Personal identity reused across every page: the wordmark, public contact
 * details, availability, portrait, biography, and the six ordered skill groups that Home
 * and About both render.
 */
export const profile = defineType({
  name: "profile",
  title: "Profile",
  type: "document",
  icon: UserIcon,
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "contact", title: "Contact" },
    { name: "about", title: "About" },
    { name: "skills", title: "Skills" },
  ],
  fields: [
    defineField({
      name: "fullName",
      title: "Full name",
      type: "string",
      group: "identity",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "wordmarkStrong",
      title: "Wordmark — bold part",
      type: "string",
      group: "identity",
      description: 'The heavier first half of the nav lockup, for example "KEN".',
      validation: (rule) => rule.required().max(12),
    }),
    defineField({
      name: "wordmarkLight",
      title: "Wordmark — light part",
      type: "string",
      group: "identity",
      description: 'The lighter second half of the nav lockup, for example "NARTEY".',
      validation: (rule) => rule.required().max(16),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      group: "identity",
      description: 'Short professional descriptor, for example "Software engineer".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      group: "identity",
      description: 'Shown in the footer, for example "Accra, Ghana".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "object",
      group: "identity",
      description: "Drives the badge above the homepage hero.",
      fields: [
        defineField({
          name: "isAvailable",
          title: "Currently available for work",
          type: "boolean",
          initialValue: false,
        }),
        defineField({
          name: "label",
          title: "Badge label",
          type: "string",
          initialValue: "Available for work",
          description: "Rendered uppercase beside the accent dot.",
          validation: (rule) => rule.max(40),
        }),
      ],
    }),

    defineField({
      name: "email",
      title: "Public email",
      type: "string",
      group: "contact",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Phone number",
      type: "string",
      group: "contact",
      description: "Stored but not published unless the toggle below is switched on.",
    }),
    defineField({
      name: "phoneIsPublic",
      title: "Publish the phone number",
      type: "boolean",
      group: "contact",
      initialValue: false,
      description: "Off by default. Turning this on exposes the number on the public contact page.",
    }),
    defineField({
      name: "socialProfiles",
      title: "Social profiles",
      type: "array",
      group: "contact",
      of: [{ type: "socialProfile" }],
      validation: (rule) => rule.unique(),
    }),

    defineField({
      name: "portrait",
      title: "Portrait",
      type: "accessibleImage",
      group: "about",
      description: "Circular photo at the top of the About page.",
    }),
    defineField({
      name: "biography",
      title: "Biography",
      type: "inlineText",
      group: "about",
      description: "The About page's main paragraph.",
    }),
    defineField({
      name: "resume",
      title: "Résumé",
      type: "file",
      group: "about",
      description: "Optional downloadable CV.",
      options: { accept: ".pdf" },
    }),

    defineField({
      name: "skillGroups",
      title: "Skill groups",
      type: "array",
      group: "skills",
      of: [{ type: "skillGroup" }],
      description: "Rendered in this order on both Home and About.",
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: "fullName", subtitle: "role", media: "portrait" },
  },
});
