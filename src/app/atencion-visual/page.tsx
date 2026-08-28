import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Atención visual",
  description: "Consulta disponibilidad de atención visual en Salud y Vida Texcoco.",
};

export default function VisualCarePage() {
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="institutional-page" id="main-content">
        <section className="institutional-hero compact">
          <p className="eyebrow">Atención visual</p>
          <h1>Consulta la atención disponible antes de visitarnos.</h1>
          <p>
            La información de la óptica puede orientarte para elegir armazones y resolver dudas de
            disponibilidad. Los servicios específicos se confirmarán directamente en sucursal.
          </p>
          <Link className="button button-primary" href="/contacto">
            Contactar sucursal
          </Link>
        </section>
        <section className="editorial-grid">
          <div>
            <p className="eyebrow">Una orientación prudente</p>
            <h2>Sin diagnósticos ni promesas que no podamos confirmar.</h2>
          </div>
          <div>
            <p>
              Esta página no reemplaza una valoración profesional ni publica servicios clínicos no
              confirmados. Si necesitas saber qué atención está disponible, envía un mensaje o
              consulta la sucursal.
            </p>
            <p>
              Cuando la operación defina citas y servicios, esta sección evolucionará con reglas
              claras.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
