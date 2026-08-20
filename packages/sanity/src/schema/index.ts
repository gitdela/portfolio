import type { SchemaTypeDefinition } from "sanity";

import { aboutPage } from "./documents/aboutPage.js";
import { blogPage } from "./documents/blogPage.js";
import { category } from "./documents/category.js";
import { contactPage } from "./documents/contactPage.js";
import { experience } from "./documents/experience.js";
import { homePage } from "./documents/homePage.js";
import { post } from "./documents/post.js";
import { profile } from "./documents/profile.js";
import { project } from "./documents/project.js";
import { siteSettings } from "./documents/siteSettings.js";
import { tag } from "./documents/tag.js";
import { testimonial } from "./documents/testimonial.js";
import { workPage } from "./documents/workPage.js";
import { accessibleImage } from "./objects/accessibleImage.js";
import { callToAction } from "./objects/callToAction.js";
import { callout } from "./objects/callout.js";
import { codeBlock } from "./objects/codeBlock.js";
import { inlineText, richText } from "./objects/richText.js";
import { seo } from "./objects/seo.js";
import { skillGroup } from "./objects/skillGroup.js";
import { socialProfile } from "./objects/socialProfile.js";

// Singleton and routed-type constants live in ../singletons.ts so the web app can import
// them without pulling in the Studio SDK. Re-exported here for Studio-side convenience.
export {
  isSingletonType,
  ROUTED_TYPES,
  SINGLETON_TYPES,
  type SingletonType,
} from "../singletons.js";

const objectTypes: SchemaTypeDefinition[] = [
  accessibleImage,
  callToAction,
  callout,
  codeBlock,
  inlineText,
  richText,
  seo,
  skillGroup,
  socialProfile,
];

const singletonDocuments: SchemaTypeDefinition[] = [
  siteSettings,
  profile,
  homePage,
  aboutPage,
  workPage,
  blogPage,
  contactPage,
];

const collectionDocuments: SchemaTypeDefinition[] = [
  project,
  post,
  experience,
  testimonial,
  category,
  tag,
];

export const schemaTypes: SchemaTypeDefinition[] = [
  ...objectTypes,
  ...singletonDocuments,
  ...collectionDocuments,
];

export {
  aboutPage,
  accessibleImage,
  blogPage,
  callToAction,
  callout,
  category,
  codeBlock,
  contactPage,
  experience,
  homePage,
  inlineText,
  post,
  profile,
  project,
  richText,
  seo,
  siteSettings,
  skillGroup,
  socialProfile,
  tag,
  testimonial,
  workPage,
};

export { INTERNAL_ROUTES, INTERNAL_ROUTE_OPTIONS, internalRoutePath } from "../routes.js";
export type { InternalRoute } from "../routes.js";
export { isUrlSafeSlug, slugify } from "./lib/slug.js";
