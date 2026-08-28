"use client";

import Link from "next/link";
import { useState } from "react";
import type { CatalogQuery } from "@/lib/catalog";
import type { CatalogFacets } from "@/server/catalog-repository";

export function CatalogFilters({ facets, query }: { facets: CatalogFacets; query: CatalogQuery }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <section
      aria-label="Filtros del catálogo"
      className="catalog-filter-section"
      data-open={isOpen}
    >
      <button
        aria-controls="catalog-filter-form"
        aria-expanded={isOpen}
        className="filter-mobile-toggle"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? "Ocultar filtros" : "Filtrar y ordenar"}
      </button>
      <form action="/catalogo" className="catalog-filters" id="catalog-filter-form" method="get">
        <label className="search-field">
          Buscar
          <input
            defaultValue={query.q}
            maxLength={80}
            name="q"
            placeholder="Nombre, marca, modelo o SKU"
            type="search"
          />
        </label>
        <label>
          Categoría
          <select defaultValue={query.category ?? ""} name="categoria">
            <option value="">Todas</option>
            {facets.categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        {facets.brands.length > 1 ? (
          <label>
            Marca
            <select defaultValue={query.brand ?? ""} name="marca">
              <option value="">Todas</option>
              {facets.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {facets.genders.length > 1 ? (
          <label>
            Segmento
            <select defaultValue={query.gender ?? ""} name="genero">
              <option value="">Todos</option>
              {facets.genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Disponibilidad
          <select defaultValue={query.availability} name="disponibilidad">
            <option value="all">Todos</option>
            <option value="in-stock">En stock</option>
            <option value="out-of-stock">Agotados</option>
          </select>
        </label>
        <label>
          Ordenar
          <select defaultValue={query.sort} name="sort">
            <option value="relevance">Relevancia</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre</option>
          </select>
        </label>
        <div className="filter-actions">
          <button className="button button-primary" type="submit">
            Aplicar
          </button>
          <Link className="button button-secondary" href="/catalogo">
            Limpiar
          </Link>
        </div>
      </form>
    </section>
  );
}
