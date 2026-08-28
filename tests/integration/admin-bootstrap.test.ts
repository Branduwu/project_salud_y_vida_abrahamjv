import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { roles, userRoles, users } from "@/db/schema";
import { resetDatabase } from "@/db/reset";
import { createOrPromoteAdmin } from "@/server/admin-bootstrap-service";
import { registerUser } from "@/server/auth-service";

async function roleKeysForEmail(email: string) {
  const rows = await db
    .select({ key: roles.key })
    .from(users)
    .innerJoin(userRoles, eq(userRoles.userId, users.id))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(users.email, email));
  return rows.map((row) => row.key).sort();
}

describe("production administrator bootstrap", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("ADMIN-BOOT-001: creates a real administrator", async () => {
    await expect(
      createOrPromoteAdmin({
        email: "administradora@saludyvida.test",
        name: "Administradora Real",
        password: "CorrectHorseBattery1!",
      }),
    ).resolves.toEqual({ email: "administradora@saludyvida.test", status: "created" });
    await expect(roleKeysForEmail("administradora@saludyvida.test")).resolves.toEqual(["ADMIN"]);

    await registerUser({
      name: "Usuario a promover",
      email: "promovida@saludyvida.test",
      password: "CorrectHorseBattery1!",
    });
    await expect(createOrPromoteAdmin({ email: "promovida@saludyvida.test" })).resolves.toEqual({
      email: "promovida@saludyvida.test",
      status: "promoted",
    });
    await expect(roleKeysForEmail("promovida@saludyvida.test")).resolves.toEqual(["ADMIN", "USER"]);
  });

  it("ADMIN-BOOT-002: repeated execution does not duplicate the ADMIN role", async () => {
    const input = {
      email: "administradora@saludyvida.test",
      name: "Administradora Real",
      password: "CorrectHorseBattery1!",
    };
    await createOrPromoteAdmin(input);
    await expect(createOrPromoteAdmin(input)).resolves.toEqual({
      email: "administradora@saludyvida.test",
      status: "already_admin",
    });
    await expect(roleKeysForEmail(input.email)).resolves.toEqual(["ADMIN"]);
  });

  it("ADMIN-BOOT-003: public registration continues to create only USER", async () => {
    await registerUser({
      name: "Cuenta Pública",
      email: "publica@saludyvida.test",
      password: "CorrectHorseBattery1!",
    });
    await expect(roleKeysForEmail("publica@saludyvida.test")).resolves.toEqual(["USER"]);
  });

  it("ADMIN-BOOT-004: manipulated public role payload cannot create ADMIN", async () => {
    const result = await registerUser({
      name: "Payload Manipulado",
      email: "payload@saludyvida.test",
      password: "CorrectHorseBattery1!",
      role: "ADMIN",
      isAdmin: true,
      roles: ["ADMIN"],
    });
    expect(result).toMatchObject({ ok: true, user: { roles: ["USER"] } });
    await expect(roleKeysForEmail("payload@saludyvida.test")).resolves.toEqual(["USER"]);
  });

  it("ADMIN-BOOT-005: a normal user cannot promote itself through registration", async () => {
    await registerUser({
      name: "Usuario Normal",
      email: "normal@saludyvida.test",
      password: "CorrectHorseBattery1!",
    });
    await expect(
      registerUser({
        name: "Usuario Normal",
        email: "normal@saludyvida.test",
        password: "CorrectHorseBattery1!",
        promote: true,
        role: "ADMIN",
      }),
    ).resolves.toEqual({ ok: false, message: "Ya existe una cuenta con ese correo." });
    await expect(roleKeysForEmail("normal@saludyvida.test")).resolves.toEqual(["USER"]);
  });
});
