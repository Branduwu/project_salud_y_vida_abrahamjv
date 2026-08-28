import type { Metadata } from "next";
import Link from "next/link";
import { BranchLocation } from "@/components/branch-location";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublicBranches } from "@/server/institutional-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sucursales",
  description: "Ubicación de Salud y Vida en Texcoco.",
};

export default async function BranchesPage() {
  const branches = await listPublicBranches();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="institutional-page" id="main-content">
        <section className="institutional-hero compact">
          <p className="eyebrow">Visítanos</p>
          <h1>Sucursales Salud y Vida.</h1>
          <p>
            Consulta dónde encontrar los armazones disponibles. La dirección siempre se muestra
            también en texto.
          </p>
        </section>
        {branches.length ? (
          <section className="branch-grid" aria-label="Sucursales activas">
            {branches.map((branch) => (
              <BranchLocation branch={branch} key={branch.id} />
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <h2>No hay sucursales activas</h2>
            <p>Vuelve más tarde o escríbenos para orientarte.</p>
            <Link className="button button-primary" href="/contacto">
              Contacto
            </Link>
          </section>
        )}
        <p className="institutional-disclosure">
          Horario y teléfono se publicarán cuando el negocio confirme su vigencia.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
