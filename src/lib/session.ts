import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import {
  createDatabaseSession,
  deleteDatabaseSession,
  getDatabaseSession,
  type AuthUser,
} from "@/server/auth-service";

const cookieName = "salud_y_vida_session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET);

type SessionPayload = { sessionId: string; token: string };

function signingKey() {
  if (secret.length < 32) throw new Error("AUTH_SECRET must be at least 32 bytes");
  return secret;
}

async function readPayload(value: string | undefined): Promise<SessionPayload | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtVerify(value, signingKey(), { algorithms: ["HS256"] });
    if (typeof payload.sessionId !== "string" || typeof payload.token !== "string") return null;
    return { sessionId: payload.sessionId, token: payload.token };
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const { sessionId, token, expiresAt } = await createDatabaseSession(userId);
  const value = await new SignJWT({ sessionId, token })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(signingKey());
  const cookieStore = await cookies();
  cookieStore.set(cookieName, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const value = (await cookies()).get(cookieName)?.value;
  const payload = await readPayload(value);
  return payload ? getDatabaseSession(payload.sessionId, payload.token) : null;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const payload = await readPayload(cookieStore.get(cookieName)?.value);
  if (payload) await deleteDatabaseSession(payload.sessionId);
  cookieStore.delete(cookieName);
}
