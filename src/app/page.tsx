import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getFeaturedProducts } from "@/server/catalog-repository";
import { listPublicBranches } from "@/server/institutional-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredProducts, branches] = await Promise.all([
    getFeaturedProducts(),
    listPublicBranches(),
  ]);
  const heroProduct = featuredProducts[0];
  const branch = branches[0];
  return (
    <div className="site-shell">
      <SiteHeader />
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-content">
            <p className="eyebrow">Óptica local · Texcoco</p>
            <h1 id="hero-title">Armazones que se sienten tan bien como se ven.</h1>
            <p className="hero-copy">
              Explora modelos, precio y disponibilidad real. Elige con calma y consulta la atención
              visual directamente en sucursal.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/catalogo">
                Ver armazones
              </Link>
              <Link className="button button-secondary" href="/atencion-visual">
                Atención visual
              </Link>
            </div>
            <p className="hero-note">Los precios publicados corresponden al armazón.</p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            {heroProduct?.image ? (
              <Image
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 92vw, 42vw"
                src={heroProduct.image.url}
              />
            ) : (
              <span>Salud y Vida</span>
            )}
          </div>
        </section>
        <section className="confidence-strip" aria-label="Información de compra">
          <p>Disponibilidad por sucursal</p>
          <p>Precios claros de armazón</p>
          <p>Atención visual cercana</p>
        </section>
        <section className="section" aria-labelledby="highlights-title">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Selección destacada</p>
              <h2 id="highlights-title">Empieza por un armazón que vaya contigo.</h2>
            </div>
            <Link className="text-link desktop-only" href="/catalogo">
              Ver catálogo completo <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="product-grid" data-testid="home-highlights">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <p className="section-cta">
            <Link className="button button-primary" href="/catalogo">
              Explorar catálogo completo
            </Link>
          </p>
        </section>
        <section className="service-section" aria-labelledby="service-title">
          <div>
            <p className="eyebrow">Atención en óptica</p>
            <h2 id="service-title">Primero te escuchamos; después encontramos la mejor opción.</h2>
          </div>
          <div className="service-copy">
            <p>
              Consulta modelos y existencias antes de visitarnos. Para saber qué atención está
              disponible, contacta directamente con la sucursal.
            </p>
            <Link className="button button-secondary light-button" href="/atencion-visual">
              Consultar atención visual
            </Link>
          </div>
        </section>
        <section className="home-institutional" aria-label="Información institucional">
          <div>
            <p className="eyebrow">Una óptica local</p>
            <h2>La experiencia digital continúa en sucursal.</h2>
            <p>
              Conoce la ubicación, consulta disponibilidad y escríbenos cuando necesites
              orientación.
            </p>
            <Link className="text-link" href="/nosotros">
              Conoce Salud y Vida <span aria-hidden="true">→</span>
            </Link>
          </div>
          {branch ? (
            <div className="home-branch">
              <p className="eyebrow">Sucursal activa</p>
              <h3>{branch.name}</h3>
              <p>{branch.address}</p>
              <Link className="button button-secondary" href="/sucursales">
                Ver cómo llegar
              </Link>
            </div>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
