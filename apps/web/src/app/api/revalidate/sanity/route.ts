import { isSingletonType } from "@portfolio/sanity/singletons";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { serverEnv } from "@/lib/env";
import {
  documentIdTag,
  documentTypeTag,
  GLOBAL_SINGLETON_TYPES,
  publishedId,
  ROOT_LAYOUT_TAG,
} from "@/lib/sanity/tags";

interface WebhookPayload {
  _type?: string;
  _id?: string;
  slug?: { current?: string } | null;
}

/**
 * Signed Sanity webhook. Publishing, updating, or deleting a document invalidates exactly
 * the tags that document feeds, so content goes live without a redeploy.
 *
 * The signature is verified before the payload is trusted; an unsigned or mis-signed
 * request is rejected without touching the cache.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const { isValidSignature, body } = await parseBody<WebhookPayload>(
    request,
    serverEnv().SANITY_REVALIDATE_SECRET,
  );

  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  if (!body?._type) {
    return NextResponse.json({ message: "Missing document type" }, { status: 400 });
  }

  const tags = new Set<string>([documentTypeTag(body._type)]);

  if (body._id) {
    tags.add(documentIdTag(publishedId(body._id)));
  }

  // Slug-keyed pages are cached under their slug rather than their document ID.
  if (body.slug?.current) {
    tags.add(documentIdTag(body.slug.current));
  }

  // The nav and footer read from these, so a change to either must bust the root layout.
  if (
    (GLOBAL_SINGLETON_TYPES as readonly string[]).includes(body._type) ||
    isSingletonType(body._type)
  ) {
    tags.add(ROOT_LAYOUT_TAG);
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags: [...tags] });
}
