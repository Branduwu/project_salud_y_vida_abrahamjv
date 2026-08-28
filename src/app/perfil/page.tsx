import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="profile-page" id="main-content">
        <section className="profile-intro" aria-labelledby="profile-title">
          <p className="eyebrow">Mi cuenta</p>
          <h1 id="profile-title">Hola, {user.name}</h1>
          <p>Tu cuenta protege tu carrito y mantiene la experiencia de compra en un solo lugar.</p>
        </section>
        <section className="profile-card" aria-label="Datos de cuenta">
          <div>
            <p className="profile-label">Correo</p>
            <p>{user.email}</p>
          </div>
          <div>
            <p className="profile-label">Acceso</p>
            <p>{user.roles.includes("ADMIN") ? "Administración y cuenta" : "Cuenta personal"}</p>
          </div>
          <Link className="button button-primary" href="/carrito">
            Ver mi carrito
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
