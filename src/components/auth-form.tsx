"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/app/actions/auth";

type AuthAction = (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;

export function AuthForm({ action, mode }: { action: AuthAction; mode: "login" | "register" }) {
  const [state, formAction, pending] = useActionState(action, {});
  const isRegister = mode === "register";

  return (
    <form action={formAction} className="auth-form" noValidate>
      {isRegister ? (
        <label>
          Nombre completo
          <input autoComplete="name" name="name" required minLength={2} maxLength={120} />
        </label>
      ) : null}
      <label>
        Correo electrónico
        <input autoComplete="email" name="email" type="email" required />
      </label>
      <label>
        Contraseña
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          name="password"
          type="password"
          required
          minLength={12}
        />
      </label>
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Procesando…" : isRegister ? "Crear cuenta" : "Ingresar"}
      </button>
    </form>
  );
}
