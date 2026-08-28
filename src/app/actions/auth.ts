"use server";

import { redirect } from "next/navigation";
import { authenticateUser, registerUser } from "@/server/auth-service";
import { createSession, deleteSession } from "@/lib/session";

export type AuthFormState = { message?: string };

export async function loginAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = await authenticateUser(formData.get("email"), formData.get("password"));
  if (!result.ok) return { message: result.message };
  await createSession(result.user.id);
  redirect("/perfil");
}

export async function registerAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const result = await registerUser({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) return { message: result.message };
  await createSession(result.user.id);
  redirect("/perfil");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
