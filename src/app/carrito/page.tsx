import Image from "next/image";
import Link from "next/link";
import { CartItemControls } from "@/components/cart-item-controls";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatPrice } from "@/lib/catalog";
import { getCartSummary } from "@/server/cart-service";
import { requireUser } from "@/server/dal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await requireUser();
  const cart = await getCartSummary(user.id);
  return (
    <div className="site-shell">
      <SiteHeader />
      <main className="cart-page" id="main-content">
        <header className="cart-heading">
          <p className="eyebrow">Tu selección</p>
          <h1>Carrito</h1>
        </header>
        {!cart.items.length ? (
          <section className="empty-state">
            <h2>Tu carrito está vacío</h2>
            <p>Explora los armazones disponibles y agrega el que más te guste.</p>
            <Link className="button button-primary" href="/catalogo">
              Explorar catálogo
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section aria-label="Artículos del carrito" className="cart-items">
              {cart.items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <Link
                    aria-label={`Ver ${item.name}`}
                    className="cart-item-image"
                    href={`/catalogo/${item.slug}`}
                  >
                    {item.image ? (
                      <Image alt={item.image.alt} fill sizes="112px" src={item.image.url} />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </Link>
                  <div className="cart-item-info">
                    <h2>
                      <Link href={`/catalogo/${item.slug}`}>{item.name}</Link>
                    </h2>
                    <p className="product-price">{formatPrice(item.priceCents)}</p>
                    <p className={`availability availability-${item.state.key}`}>
                      {item.state.label}
                    </p>
                    <p>
                      Subtotal: <strong>{formatPrice(item.subtotalCents)}</strong>
                    </p>
                    <CartItemControls
                      itemId={item.id}
                      quantity={item.quantity}
                      canModify={item.state.canModify}
                    />
                  </div>
                </article>
              ))}
            </section>
            <aside aria-label="Resumen del carrito" className="cart-summary">
              <h2>Resumen</h2>
              <p>
                <span>Artículos</span>
                <strong>{cart.itemCount}</strong>
              </p>
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(cart.subtotalCents)}</strong>
              </p>
              <p className="cart-total">
                <span>Total provisional</span>
                <strong>{formatPrice(cart.totalCents)}</strong>
              </p>
              <p className="muted">
                El inventario no queda reservado; se validará nuevamente antes de cualquier pedido.
              </p>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
