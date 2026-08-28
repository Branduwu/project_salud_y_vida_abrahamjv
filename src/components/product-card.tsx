import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { PublicProduct } from "@/server/catalog-repository";

export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <article className="product-card">
      <Link
        aria-label={`Ver ${product.name}`}
        className="product-image"
        href={`/catalogo/${product.slug}`}
      >
        {product.image ? (
          <Image
            alt={product.image.alt}
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
            src={product.image.url}
          />
        ) : (
          <span aria-hidden="true">Salud y Vida</span>
        )}
      </Link>
      <div className="product-card-body">
        {product.brand ? <p className="product-brand">{product.brand}</p> : null}
        <h3>
          <Link href={`/catalogo/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.frameModel ? <p className="product-meta">Modelo {product.frameModel}</p> : null}
        <div className="product-card-bottom">
          <div>
            <p className="product-price">{formatPrice(product.priceCents)}</p>
            <p className={`availability availability-${product.availability.key}`}>
              {product.availability.label}
            </p>
          </div>
          <Link className="text-link" href={`/catalogo/${product.slug}`}>
            Ver <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
