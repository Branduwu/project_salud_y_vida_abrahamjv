import type { Metadata } from "next";
import Link from "next/link";
import { CatalogFilters } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { parseCatalogQuery, type CatalogSearchParams } from "@/lib/catalog";
import { getCatalogFacets, listPublicProducts } from "@/server/catalog-repository";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora armazones ópticos y consulta su disponibilidad por sucursal.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const [products, facets] = await Promise.all([listPublicProducts(query), getCatalogFacets()]);
  const hasFilters = Boolean(
    query.q ||
    query.category ||
    query.brand ||
    query.gender ||
    query.availability !== "all" ||
    query.sort !== "relevance",
  );

  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="catalog-page" id="main-content">
        <header className="catalog-heading">
          <p className="eyebrow">Catálogo</p>
          <h1>Armazones para ver y sentirte bien.</h1>
          <p>Precios y disponibilidad consultados desde nuestro catálogo.</p>
        </header>
        <CatalogFilters facets={facets} query={query} />
        <p aria-live="polite" className="results-summary">
          {products.length
            ? `${products.length} ${products.length === 1 ? "producto" : "productos"} encontrados`
            : "Sin productos encontrados"}
        </p>
        {products.length ? (
          <section aria-label="Productos" className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <h2>{hasFilters ? "No encontramos resultados" : "No hay productos disponibles"}</h2>
            <p>
              {hasFilters
                ? "Prueba con otra búsqueda o limpia los filtros."
                : "Vuelve más tarde para conocer el catálogo."}
            </p>
            {hasFilters ? (
              <Link className="button button-primary" href="/catalogo">
                Limpiar filtros
              </Link>
            ) : null}
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
