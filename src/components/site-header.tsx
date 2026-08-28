import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { MobileMenu } from "@/components/mobile-menu";
import { getCurrentUser } from "@/lib/session";
import { getCartItemCount } from "@/server/cart-service";

const publicLinks = [
  ["Armazones", "/catalogo"],
  ["Atención visual", "/atencion-visual"],
  ["Sucursales", "/sucursales"],
  ["Nosotros", "/nosotros"],
] as const;

export async function SiteHeader() {
  const user = await getCurrentUser();
  const cartItemCount = user ? await getCartItemCount(user.id) : 0;
  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        Saltar al contenido principal
      </a>
      <nav aria-label="Navegación principal" className="navigation">
        <Link className="brand" href="/" aria-label="Salud y Vida, inicio">
          Salud <span>y Vida</span>
        </Link>
        <div className="nav-links desktop-only">
          {publicLinks.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </div>
        {user ? (
          <div className="account-links desktop-only">
            <Link href="/carrito">Carrito{cartItemCount ? ` (${cartItemCount})` : ""}</Link>
            <Link href="/perfil">Mi perfil</Link>
            {isAdmin ? <Link href="/admin">Administración</Link> : null}
            <form action={logoutAction}>
              <button className="button button-compact" type="submit">
                Salir
              </button>
            </form>
          </div>
        ) : (
          <Link className="button button-compact desktop-only" href="/login">
            Ingresar
          </Link>
        )}
        <MobileMenu authenticated={Boolean(user)} cartItemCount={cartItemCount} isAdmin={isAdmin} />
      </nav>
    </header>
  );
}
