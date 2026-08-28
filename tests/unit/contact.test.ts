import { describe, expect, it } from "vitest";
import { contactMessageSchema } from "@/lib/contact";

describe("contact validation", () => {
  const valid = {
    name: "Ana Cliente",
    email: " ANA@EXAMPLE.TEST ",
    phone: "",
    message: "Quiero consultar disponibilidad de armazones.",
    website: "",
  };
  it("CONTACT-U-001: normalizes public contact data", () => {
    expect(contactMessageSchema.parse(valid)).toMatchObject({
      email: "ana@example.test",
      phone: undefined,
    });
  });
  it("CONTACT-U-002: rejects invalid email and empty message", () => {
    expect(contactMessageSchema.safeParse({ ...valid, email: "no-correo" }).success).toBe(false);
    expect(contactMessageSchema.safeParse({ ...valid, message: "" }).success).toBe(false);
  });
  it("CONTACT-U-003: rejects oversized message and honeypot", () => {
    expect(contactMessageSchema.safeParse({ ...valid, message: "a".repeat(2001) }).success).toBe(
      false,
    );
    expect(contactMessageSchema.safeParse({ ...valid, website: "bot.example" }).success).toBe(
      false,
    );
  });
});
