import Link from "next/link";

export default function NotFound() {
  return (
    <main className="centered-page">
      <p className="eyebrow">404</p>
      <h1>Esta página no existe.</h1>
      <p>Revisa la dirección o vuelve al inicio para seguir explorando Salud y Vida.</p>
      <Link className="button button-primary" href="/">
        Volver al inicio
      </Link>
    </main>
  );
}
