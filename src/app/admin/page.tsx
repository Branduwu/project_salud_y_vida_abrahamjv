import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireAdmin } from "@/server/dal";

export default async function AdminPage() {
  const user = await requireAdmin();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="admin-title">
          <p className="eyebrow">Administración protegida</p>
          <h1 id="admin-title">Panel de administración</h1>
          <p>Acceso autorizado para {user.name}.</p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
