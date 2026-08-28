import { describe, expect, it } from "vitest";
import {
  createSlug,
  createUniqueSlug,
  formatPrice,
  getAvailability,
  parseCatalogQuery,
} from "@/lib/catalog";

describe("catalog helpers", () => {
  it("CAT-U-001: formats integer cents as MXN", () => {
    expect(formatPrice(200000)).toContain("2,000.00");
    expect(() => formatPrice(1.5)).toThrow();
  });

  it("CAT-U-002: normalizes bounded search text", () => {
    expect(parseCatalogQuery({ q: "  Steve   Madden  " }).q).toBe("Steve Madden");
    expect(parseCatalogQuery({ q: "x".repeat(100) }).q).toHaveLength(80);
  });

  it("CAT-U-003: parses only valid filter values", () => {
    expect(
      parseCatalogQuery({ categoria: "armazones-opticos", marca: "BOY LONDON", genero: "Mujer" }),
    ).toMatchObject({ category: "armazones-opticos", brand: "BOY LONDON", gender: "Mujer" });
    expect(parseCatalogQuery({ categoria: "<script>" }).category).toBeNull();
  });

  it("CAT-U-004: uses a safe default order and availability", () => {
    expect(parseCatalogQuery({ sort: "price-desc", disponibilidad: "out-of-stock" })).toMatchObject(
      { sort: "price-desc", availability: "out-of-stock" },
    );
    expect(parseCatalogQuery({ sort: "DROP TABLE", disponibilidad: "unknown" })).toMatchObject({
      sort: "relevance",
      availability: "all",
    });
  });

  it("CAT-U-005: creates stable, unique slugs", () => {
    expect(createSlug("  ÓGGI 469! ")).toBe("oggi-469");
    expect(createUniqueSlug("OGGI 469", new Set(["oggi-469", "oggi-469-2"]))).toBe("oggi-469-3");
  });

  it("CAT-U-006: maps inventory to public availability without exposing quantities", () => {
    expect(getAvailability(0)).toEqual({ key: "out-of-stock", label: "Agotado" });
    expect(getAvailability(2)).toEqual({ key: "low-stock", label: "Pocas unidades" });
    expect(getAvailability(4)).toEqual({ key: "in-stock", label: "En stock" });
  });
});
