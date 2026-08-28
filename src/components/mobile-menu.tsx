"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { logoutAction } from "@/app/actions/auth";

type MobileMenuProps = { authenticated: boolean; cartItemCount: number; isAdmin: boolean };
const publicLinks = [
  ["Armazones", "/catalogo"],
  ["Atención visual", "/atencion-visual"],
  ["Sucursales", "/sucursales"],
  ["Nosotros", "/nosotros"],
  ["Contacto", "/contacto"],
] as const;

export function MobileMenu({ authenticated, cartItemCount, isAdmin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
  return (
    <div className="mobile-menu">
      <button
        aria-controls="mobile-menu-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="menu-toggle"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true" className="menu-toggle-lines" />
        <span>Menú</span>
      </button>
      {isOpen ? (
        <div className="mobile-menu-panel" id="mobile-menu-panel">
          <div className="mobile-menu-links">
            {publicLinks.map(([label, href]) => (
              <Link href={href} key={href} onClick={() => setIsOpen(false)}>
                {label}
              </Link>
            ))}
          </div>
          {authenticated ? (
            <div className="mobile-account-links">
              <Link href="/carrito" onClick={() => setIsOpen(false)}>
                Carrito{cartItemCount ? ` (${cartItemCount})` : ""}
              </Link>
              <Link href="/perfil" onClick={() => setIsOpen(false)}>
                Mi perfil
              </Link>
              {isAdmin ? (
                <Link href="/admin" onClick={() => setIsOpen(false)}>
                  Administración
                </Link>
              ) : null}
              <form action={logoutAction}>
                <button type="submit">Salir</button>
              </form>
            </div>
          ) : (
            <Link className="button button-primary" href="/login" onClick={() => setIsOpen(false)}>
              Ingresar
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
