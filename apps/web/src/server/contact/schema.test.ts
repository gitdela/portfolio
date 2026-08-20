import { describe, expect, test } from "bun:test";

import { contactSchema } from "./schema";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "I would like to talk about a project.",
  turnstileToken: "token-value",
  company: "",
};

describe("contactSchema", () => {
  test("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  test("trims surrounding whitespace from the visible fields", () => {
    const parsed = contactSchema.parse({ ...valid, name: "  Ada  " });
    expect(parsed.name).toBe("Ada");
  });

  test("rejects a malformed email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  test("rejects an empty name", () => {
    expect(contactSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  test("rejects a message too short to be actionable", () => {
    expect(contactSchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
  });

  test("rejects an oversized message rather than forwarding it", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(5001) }).success).toBe(false);
  });

  test("requires a Turnstile token — the challenge is not optional", () => {
    expect(contactSchema.safeParse({ ...valid, turnstileToken: "" }).success).toBe(false);
  });

  test("rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...valid, company: "spam-bot" }).success).toBe(false);
  });

  test("reports every invalid field at once rather than stopping at the first", () => {
    const result = contactSchema.safeParse({
      ...valid,
      name: "",
      email: "nope",
      message: "hi",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = new Set(result.error.issues.map((issue) => issue.path[0]));
      expect(paths).toEqual(new Set(["name", "email", "message"]));
    }
  });
});
