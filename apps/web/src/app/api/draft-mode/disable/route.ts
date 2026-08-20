import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Clears the Draft Mode cookie and returns the visitor to the published site. */
export async function GET(request: Request): Promise<Response> {
  const draft = await draftMode();
  draft.disable();

  return NextResponse.redirect(new URL("/", request.url));
}
