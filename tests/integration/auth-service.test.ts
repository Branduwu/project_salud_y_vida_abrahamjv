import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { sessions, users } from "@/db/schema";
import { resetDatabase } from "@/db/reset";
import {
  authenticateUser,
  createDatabaseSession,
  deleteDatabaseSession,
  getDatabaseSession,
  registerUser,
} from "@/server/auth-service";

describe("database-backed authentication", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("AUTH-001: registers a USER with a bcrypt hash", async () => {
    const result = await registerUser({
      name: "Cuenta Nueva",
      email: "nueva@saludyvida.test",
      password: "CorrectHorseBattery1!",
    });
    expect(result).toMatchObject({
      ok: true,
      user: { email: "nueva@saludyvida.test", roles: ["USER"] },
    });
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, "nueva@saludyvida.test"));
    expect(user?.passwordHash).toMatch(/^\$2[aby]\$/);
  });

  it("AUTH-002: rejects duplicate registration without exposing database errors", async () => {
    const result = await registerUser({
      name: "Otra Cuenta",
      email: "admin.demo@saludyvida.test",
      password: "CorrectHorseBattery1!",
    });
    expect(result).toEqual({ ok: false, message: "Ya existe una cuenta con ese correo." });
  });

  it("AUTH-003: validates credentials and retrieves the database role", async () => {
    await expect(
      authenticateUser("admin.demo@saludyvida.test", "DemoOnly!2026"),
    ).resolves.toMatchObject({ ok: true, user: { roles: ["ADMIN"] } });
    await expect(
      authenticateUser("admin.demo@saludyvida.test", "contraseña-incorrecta"),
    ).resolves.toEqual({ ok: false, message: "Correo o contraseña inválidos." });
  });

  it("AUTH-004: persists, validates and deletes a server session", async () => {
    const [user] = await db.select({ id: users.id }).from(users).limit(1);
    if (!user) throw new Error("seed user missing");
    const created = await createDatabaseSession(user.id);
    const stored = await db
      .select({ tokenHash: sessions.tokenHash })
      .from(sessions)
      .where(eq(sessions.id, created.sessionId));
    expect(stored[0]?.tokenHash).not.toBe(created.token);
    await expect(getDatabaseSession(created.sessionId, created.token)).resolves.toMatchObject({
      id: user.id,
    });
    await deleteDatabaseSession(created.sessionId);
    await expect(getDatabaseSession(created.sessionId, created.token)).resolves.toBeNull();
  });

  it("AUTH-005: does not accept an invented or modified session token", async () => {
    await expect(getDatabaseSession(randomUUID(), "invented-token")).resolves.toBeNull();
  });
});
