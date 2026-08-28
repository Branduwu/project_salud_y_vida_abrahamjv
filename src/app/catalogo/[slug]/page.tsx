import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { formatPrice } from "@/lib/catalog";
import { getPublicProductBySlug } from "@/server/catalog-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getPublicProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: `${product.name} | Salud y Vida`, description: product.description },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getPublicProductBySlug((await params).slug);
  if (!product) notFound();
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="product-detail" id="main-content">
        <Link className="back-link" href="/catalogo">
          ← Volver al catálogo
        </Link>
        <div className="product-detail-grid">
          <section aria-label={`Imágenes de ${product.name}`} className="product-gallery">
            {product.images.length ? (
              product.images.map((image, index) => (
                <div className="product-detail-image" key={image.url}>
                  <Image
                    alt={image.alt}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 800px) 100vw, 50vw"
                    src={image.url}
                  />
                </div>
              ))
            ) : (
              <div className="product-detail-image product-placeholder">Sin imagen disponible</div>
            )}
          </section>
          <section className="product-information">
            {product.category ? <p className="product-category">{product.category.name}</p> : null}
            <h1>{product.name}</h1>
            <p className="product-price">{formatPrice(product.priceCents)}</p>
            <p className="price-context">
              Precio correspondiente al armazón. Lentes graduados y tratamientos se cotizan por
              separado.
            </p>
            <p className={`availability availability-${product.availability.key}`}>
              {product.availability.label}
            </p>
            <p className="product-description">{product.description}</p>
            <dl className="product-specs">
              {product.brand ? (
                <>
                  <dt>Marca</dt>
                  <dd>{product.brand}</dd>
                </>
              ) : null}
              {product.frameModel ? (
                <>
                  <dt>Modelo</dt>
                  <dd>{product.frameModel}</dd>
                </>
              ) : null}
              {product.gender ? (
                <>
                  <dt>Segmento</dt>
                  <dd>{product.gender}</dd>
                </>
              ) : null}
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </dl>
            {product.branches.length ? (
              <section aria-labelledby="branch-stock-title">
                <h2 id="branch-stock-title">Disponible en</h2>
                <ul className="branch-list">
                  {product.branches.map((branch) => (
                    <li key={branch.name}>
                      <strong>{branch.name}</strong>
                      <span>{branch.address}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p>Este producto no tiene existencias disponibles por ahora.</p>
            )}
            <AddToCartForm
              disabled={product.availability.key === "out-of-stock"}
              productId={product.id}
            />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
