import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Cuenta Salud y Vida</p>
        <h1 id="login-title">Ingresa a tu cuenta</h1>
        <p>Tu sesión se protege con una cookie segura y se valida en el servidor.</p>
        <AuthForm action={loginAction} mode="login" />
        <p>
          ¿Aún no tienes cuenta? <Link href="/registro">Regístrate</Link>.
        </p>
      </section>
    </main>
  );
}
