import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="brand">
          Salud <span>y Vida</span>
        </p>
        <p>Óptica local con armazones y orientación para tu visita.</p>
      </div>
      <nav aria-label="Navegación secundaria">
        <Link href="/catalogo">Armazones</Link>
        <Link href="/atencion-visual">Atención visual</Link>
        <Link href="/sucursales">Sucursales</Link>
        <Link href="/nosotros">Nosotros</Link>
        <Link href="/contacto">Contacto</Link>
      </nav>
      <div className="footer-contact">
        <p>Sucursal en Texcoco</p>
        <p>Consulta dirección y disponibilidad antes de visitarnos.</p>
        <Link href="/contacto">Escríbenos</Link>
      </div>
      <p>© {new Date().getFullYear()} Salud y Vida.</p>
    </footer>
  );
}
