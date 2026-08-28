import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Nosotros",
  description: "Conoce Salud y Vida, óptica local en Texcoco.",
};

export default function AboutPage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="institutional-page" id="main-content">
        <section className="institutional-hero">
          <p className="eyebrow">Salud y Vida en Texcoco</p>
          <h1>Una óptica para elegir con calma y preguntar con confianza.</h1>
          <p>
            Salud y Vida reúne una selección de armazones y atención cercana desde su sucursal
            física. Aquí puedes revisar disponibilidad antes de visitar.
          </p>
          <Link className="button button-primary" href="/catalogo">
            Explorar armazones
          </Link>
        </section>
        <section className="editorial-grid" aria-labelledby="about-work-title">
          <div>
            <p className="eyebrow">Nuestra forma de atender</p>
            <h2 id="about-work-title">Información clara antes de cualquier decisión.</h2>
          </div>
          <div>
            <p>
              Mostramos el precio del armazón y su disponibilidad para que llegues con un punto de
              partida real. Las dudas sobre atención visual se resuelven directamente con la
              sucursal, sin prometer servicios que aún no estén definidos.
            </p>
            <p>La experiencia digital acompaña una óptica local: descubre, compara y consulta.</p>
          </div>
        </section>
        <section className="principles-section" aria-labelledby="principles-title">
          <p className="eyebrow">Lo que cuidamos</p>
          <h2 id="principles-title">Una experiencia útil, no promesas vacías.</h2>
          <div>
            <p>
              <strong>Claridad comercial.</strong> Precio y alcance del producto visibles.
            </p>
            <p>
              <strong>Disponibilidad real.</strong> Catálogo conectado al inventario de sucursal.
            </p>
            <p>
              <strong>Atención cercana.</strong> Un canal directo para orientar tu visita.
            </p>
          </div>
        </section>
        <section className="institutional-cta">
          <div>
            <p className="eyebrow">Conoce la sucursal</p>
            <h2>La selección en línea continúa en Texcoco.</h2>
          </div>
          <div>
            <Link className="button button-secondary" href="/sucursales">
              Ver sucursal
            </Link>
            <Link className="text-link" href="/contacto">
              Contactar a Salud y Vida <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
