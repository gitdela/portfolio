import { SINGLETON_TYPES, type SingletonType } from "@portfolio/sanity/schema";
import { CogIcon } from "@sanity/icons/Cog";
import { ComposeIcon } from "@sanity/icons/Compose";
import { UserIcon } from "@sanity/icons/User";
import type { StructureResolver } from "sanity/structure";

/**
 * Singletons live at a fixed document ID equal to their type name, so the Presentation
 * tool and the revalidation webhook can address them without a lookup.
 */
export const singletonDocumentId = (type: SingletonType): string => type;

const SINGLETON_TITLES: Record<SingletonType, string> = {
  siteSettings: "Site settings",
  profile: "Profile",
  homePage: "Home page",
  aboutPage: "About page",
  workPage: "Work page",
  blogPage: "Blog page",
  contactPage: "Contact page",
};

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(singletonDocumentId("siteSettings"))
            .title("Site settings"),
        ),
      S.listItem()
        .title("Profile")
        .icon(UserIcon)
        .child(
          S.document()
            .schemaType("profile")
            .documentId(singletonDocumentId("profile"))
            .title("Profile"),
        ),

      S.divider(),

      S.listItem()
        .title("Pages")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Pages")
            .items(
              (["homePage", "aboutPage", "workPage", "blogPage", "contactPage"] as const).map(
                (type) =>
                  S.listItem()
                    .id(type)
                    .title(SINGLETON_TITLES[type])
                    .child(
                      S.document()
                        .schemaType(type)
                        .documentId(singletonDocumentId(type))
                        .title(SINGLETON_TITLES[type]),
                    ),
              ),
            ),
        ),

      S.divider(),

      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("post").title("Posts"),
      S.documentTypeListItem("experience").title("Experience"),
      S.documentTypeListItem("testimonial").title("Testimonials"),

      S.divider(),

      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("tag").title("Tags"),
    ]);

/** Everything the structure renders explicitly, so it is not duplicated by the fallback list. */
export const STRUCTURE_MANAGED_TYPES: readonly string[] = [
  ...SINGLETON_TYPES,
  "project",
  "post",
  "experience",
  "testimonial",
  "category",
  "tag",
];
