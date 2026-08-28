import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { roles, sessions, userRoles, users } from "@/db/schema";

const registrationSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo.").max(120),
  email: z.email("Escribe un correo válido.").trim().toLowerCase(),
  password: z.string().min(12, "La contraseña debe tener al menos 12 caracteres.").max(128),
});

export type AuthUser = { id: string; name: string; email: string; roles: string[] };

export type AuthResult = { ok: true; user: AuthUser } | { ok: false; message: string };

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function rolesForUser(userId: string) {
  const rows = await db
    .select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  return rows.map((row) => row.key);
}

export async function registerUser(input: unknown): Promise<AuthResult> {
  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (existing[0]) return { ok: false, message: "Ya existe una cuenta con ese correo." };

  const userRole = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.key, "USER"))
    .limit(1);
  if (!userRole[0]) throw new Error("The USER role is missing from the database");

  const passwordHash = await hash(parsed.data.password, 12);
  try {
    const user = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ name: parsed.data.name, email: parsed.data.email, passwordHash })
        .returning({ id: users.id, name: users.name, email: users.email });
      if (!created) return null;
      await tx.insert(userRoles).values({ userId: created.id, roleId: userRole[0].id });
      return created;
    });
    if (!user) return { ok: false, message: "No fue posible crear la cuenta." };
    return { ok: true, user: { ...user, roles: ["USER"] } };
  } catch (error: unknown) {
    if (isUniqueViolation(error))
      return { ok: false, message: "Ya existe una cuenta con ese correo." };
    throw error;
  }
}

export async function authenticateUser(email: unknown, password: unknown): Promise<AuthResult> {
  if (typeof email !== "string" || typeof password !== "string") {
    return { ok: false, message: "Correo o contraseña inválidos." };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user || !user.isActive || !(await compare(password, user.passwordHash))) {
    return { ok: false, message: "Correo o contraseña inválidos." };
  }

  return {
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, roles: await rolesForUser(user.id) },
  };
}

export async function createDatabaseSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const [session] = await db
    .insert(sessions)
    .values({ userId, tokenHash: hashToken(token), expiresAt })
    .returning({ id: sessions.id });
  if (!session) throw new Error("Could not create database session");
  return { sessionId: session.id, token, expiresAt };
}

export async function getDatabaseSession(
  sessionId: string,
  token: string,
): Promise<AuthUser | null> {
  const [session] = await db
    .select({ userId: sessions.userId, name: users.name, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.isActive, true),
      ),
    )
    .limit(1);
  if (!session) return null;
  return {
    id: session.userId,
    name: session.name,
    email: session.email,
    roles: await rolesForUser(session.userId),
  };
}

export async function deleteDatabaseSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
