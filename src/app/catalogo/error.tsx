"use client";

export default function CatalogError() {
  return (
    <main className="catalog-page">
      <section className="empty-state">
        <h1>No fue posible cargar el catálogo</h1>
        <p>Intenta actualizar la página. Si el problema continúa, contáctanos.</p>
      </section>
    </main>
  );
}
