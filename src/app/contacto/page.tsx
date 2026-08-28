import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPublicBranches } from "@/server/institutional-repository";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escribe a Salud y Vida para consultar armazones o atención en sucursal.",
};

export default async function ContactPage() {
  const [branch] = await listPublicBranches();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="contact-page" id="main-content">
        <section className="contact-intro">
          <p className="eyebrow">Contacto</p>
          <h1>Hablemos de tu próxima visita.</h1>
          <p>
            Escríbenos para consultar armazones, disponibilidad o atención en sucursal. No necesitas
            iniciar sesión.
          </p>
          {branch ? (
            <p className="contact-location">
              <strong>{branch.name}</strong>
              <br />
              {branch.address}
            </p>
          ) : null}
          <Link className="text-link" href="/sucursales">
            Ver sucursal <span aria-hidden="true">→</span>
          </Link>
        </section>
        <section className="contact-card" aria-labelledby="contact-form-title">
          <p className="eyebrow">Mensaje</p>
          <h2 id="contact-form-title">¿Cómo podemos ayudarte?</h2>
          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
