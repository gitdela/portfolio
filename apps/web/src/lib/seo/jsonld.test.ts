import { describe, expect, test } from "bun:test";

import { blogPostingJsonLd, breadcrumbJsonLd, personJsonLd, serializeJsonLd } from "./jsonld";

const SITE = "https://example.com";

describe("serializeJsonLd", () => {
  test("produces valid JSON that round-trips", () => {
    const value = { "@type": "Person", name: "Ada" };
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });

  test("escapes a closing script tag so it cannot break out of the block", () => {
    const out = serializeJsonLd({ headline: "</script><img onerror=alert(1)>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    // Still valid JSON, and the original text survives intact once parsed.
    expect((JSON.parse(out) as { headline: string }).headline).toBe(
      "</script><img onerror=alert(1)>",
    );
  });

  test("escapes ampersands, which HTML entity-decodes inside the block", () => {
    const out = serializeJsonLd({ name: "Tom & Jerry" });
    expect(out).not.toContain("&");
    expect((JSON.parse(out) as { name: string }).name).toBe("Tom & Jerry");
  });

  test("escapes hostile content nested anywhere in the structure", () => {
    const out = serializeJsonLd({
      "@type": "BlogPosting",
      author: { name: "</script>" },
      keywords: ["a<b", "c>d"],
    });
    expect(out).not.toMatch(/[<>&]/);
    expect((JSON.parse(out) as { author: { name: string } }).author.name).toBe("</script>");
  });

  test("leaves ordinary text readable", () => {
    expect(serializeJsonLd({ name: "Kenneth Dela Nartey" })).toContain("Kenneth Dela Nartey");
  });
});

describe("personJsonLd", () => {
  test("emits a well-formed Person", () => {
    const out = personJsonLd({
      fullName: "Kenneth Dela Nartey",
      role: "Software engineer",
      socialUrls: ["https://github.com/gitdela"],
      siteUrl: SITE,
    });
    expect(out["@type"]).toBe("Person");
    expect(out.name).toBe("Kenneth Dela Nartey");
    expect(out.url).toBe(SITE);
    expect(out.sameAs).toEqual(["https://github.com/gitdela"]);
  });

  test("omits sameAs entirely rather than emitting an empty array", () => {
    const out = personJsonLd({ fullName: "A", role: "B", socialUrls: [], siteUrl: SITE });
    expect("sameAs" in out).toBe(false);
  });

  test("drops null and empty social URLs", () => {
    const out = personJsonLd({
      fullName: "A",
      role: "B",
      socialUrls: [null, "", undefined, "https://example.org"],
      siteUrl: SITE,
    });
    expect(out.sameAs).toEqual(["https://example.org"]);
  });
});

describe("blogPostingJsonLd", () => {
  const post = {
    title: "A post",
    standfirst: "A standfirst",
    publishedAt: "2026-08-20T09:00:00.000Z",
    author: { fullName: "Kenneth Dela Nartey" },
    category: { title: "SEO" },
  } as never;

  test("builds absolute URLs from the configured origin", () => {
    const out = blogPostingJsonLd({ post, slug: "a-post", siteUrl: SITE });
    expect(out.url).toBe(`${SITE}/blog/a-post`);
    expect(out.mainEntityOfPage["@id"]).toBe(`${SITE}/blog/a-post`);
  });

  test("omits the image key when there is no image", () => {
    const out = blogPostingJsonLd({ post, slug: "a-post", siteUrl: SITE });
    expect("image" in out).toBe(false);
  });

  test("includes the image when supplied", () => {
    const out = blogPostingJsonLd({
      post,
      slug: "a-post",
      siteUrl: SITE,
      imageUrl: "https://cdn.example.com/x.png",
    });
    expect(out.image).toEqual(["https://cdn.example.com/x.png"]);
  });
});

describe("breadcrumbJsonLd", () => {
  test("numbers positions from one and resolves each item to an absolute URL", () => {
    const out = breadcrumbJsonLd(
      [
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "A post", path: "/blog/a-post" },
      ],
      SITE,
    );
    expect(out.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(out.itemListElement[2]?.item).toBe(`${SITE}/blog/a-post`);
  });

  test("survives serialization with hostile crumb names", () => {
    const out = breadcrumbJsonLd([{ name: "</script>", path: "/x" }], SITE);
    expect(serializeJsonLd(out)).not.toContain("</script>");
  });
});
