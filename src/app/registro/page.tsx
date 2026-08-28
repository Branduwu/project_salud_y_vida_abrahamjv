import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="register-title">
        <p className="eyebrow">Cuenta Salud y Vida</p>
        <h1 id="register-title">Crea tu cuenta</h1>
        <p>Usa una contraseña de al menos 12 caracteres.</p>
        <AuthForm action={registerAction} mode="register" />
        <p>
          ¿Ya tienes cuenta? <Link href="/login">Ingresa</Link>.
        </p>
      </section>
    </main>
  );
}
