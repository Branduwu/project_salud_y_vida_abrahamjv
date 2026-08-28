import { eq, sql } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { branches } from "@/db/schema";
import { createPublicContactMessage } from "@/server/contact-service";
import { listPublicBranches } from "@/server/institutional-repository";
import { resetDatabase } from "@/db/reset";

describe("institutional public data", () => {
  beforeEach(async () => {
    await resetDatabase();
  });
  afterEach(async () => {
    await resetDatabase();
  });
  it("CONTACT-I-001: persists a valid public contact message", async () => {
    await expect(
      createPublicContactMessage({
        name: "Ana Cliente",
        email: "contact-valid@saludyvida.test",
        phone: "",
        message: "Quiero consultar disponibilidad de armazones.",
        website: "",
      }),
    ).resolves.toEqual({ ok: true });
    const result = await db.execute(
      sql`SELECT name, email, phone, message FROM contact_messages WHERE email = 'contact-valid@saludyvida.test'`,
    );
    expect(result.rows).toEqual([
      expect.objectContaining({
        name: "Ana Cliente",
        email: "contact-valid@saludyvida.test",
        phone: null,
      }),
    ]);
  });
  it("CONTACT-I-002/003/004: invalid email, empty and oversized message do not persist", async () => {
    const inputs = [
      { name: "Ana", email: "invalid", message: "Mensaje de prueba válido.", website: "" },
      { name: "Ana", email: "empty@saludyvida.test", message: "", website: "" },
      { name: "Ana", email: "large@saludyvida.test", message: "a".repeat(2001), website: "" },
    ];
    for (const input of inputs)
      await expect(createPublicContactMessage(input)).resolves.toMatchObject({ ok: false });
    const result = await db.execute(sql`SELECT count(*)::int AS count FROM contact_messages`);
    expect(result.rows[0]).toMatchObject({ count: 0 });
  });
  it("CONTACT-I-005: rejects honeypot spam without inserting", async () => {
    await expect(
      createPublicContactMessage({
        name: "Bot",
        email: "bot@saludyvida.test",
        message: "Este mensaje no debe guardarse.",
        website: "spam.example",
      }),
    ).resolves.toMatchObject({ ok: false });
    const result = await db.execute(sql`SELECT count(*)::int AS count FROM contact_messages`);
    expect(result.rows[0]).toMatchObject({ count: 0 });
  });
  it("BRANCH-I-001/003: exposes active branch address from PostgreSQL", async () => {
    await expect(listPublicBranches()).resolves.toEqual([
      expect.objectContaining({
        name: "Salud y Vida Texcoco",
        address: expect.stringContaining("Texcoco"),
      }),
    ]);
  });
  it("BRANCH-I-002: hides inactive branches", async () => {
    await db.update(branches).set({ isActive: false }).where(eq(branches.slug, "texcoco"));
    await expect(listPublicBranches()).resolves.toEqual([]);
  });
});
