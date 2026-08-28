import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { products } from "@/db/schema";
import { parseCatalogQuery } from "@/lib/catalog";
import { resetDatabase } from "@/db/reset";
import { seedDatabase } from "@/db/seed";
import { getPublicProductBySlug, listPublicProducts } from "@/server/catalog-repository";

const emptyQuery = parseCatalogQuery({});

describe("public catalog backed by PostgreSQL", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("CAT-I-001: lists active products", async () => {
    await expect(listPublicProducts(emptyQuery)).resolves.toHaveLength(9);
  });

  it("CAT-I-002: never exposes an inactive product", async () => {
    await db.insert(products).values({
      id: randomUUID(),
      name: "Oculto",
      slug: "oculto",
      description: "No público",
      sku: "SV-HIDDEN",
      priceCents: 100,
      status: "inactive",
    });
    await expect(listPublicProducts(emptyQuery)).resolves.not.toContainEqual(
      expect.objectContaining({ slug: "oculto" }),
    );
    await expect(getPublicProductBySlug("oculto")).resolves.toBeNull();
  });

  it("CAT-I-003: searches by name on the server", async () => {
    await expect(listPublicProducts(parseCatalogQuery({ q: "OGGI" }))).resolves.toEqual([
      expect.objectContaining({ slug: "oggi-469" }),
    ]);
  });

  it("CAT-I-004: searches by brand on the server", async () => {
    await expect(listPublicProducts(parseCatalogQuery({ q: "BOY LONDON" }))).resolves.toEqual([
      expect.objectContaining({ slug: "boy-london-bo-007" }),
    ]);
  });

  it("CAT-I-005: filters by category", async () => {
    await expect(
      listPublicProducts(parseCatalogQuery({ categoria: "armazones-opticos" })),
    ).resolves.toHaveLength(9);
  });

  it("CAT-I-006: filters in-stock products from inventory", async () => {
    const productsInStock = await listPublicProducts(
      parseCatalogQuery({ disponibilidad: "in-stock" }),
    );
    expect(productsInStock).toHaveLength(8);
    expect(productsInStock.every((product) => product.availability.key !== "out-of-stock")).toBe(
      true,
    );
    await expect(
      listPublicProducts(parseCatalogQuery({ disponibilidad: "out-of-stock" })),
    ).resolves.toEqual([
      expect.objectContaining({
        slug: "muestra-sin-existencias",
        availability: expect.objectContaining({ key: "out-of-stock" }),
      }),
    ]);
  });

  it("CAT-I-007: combines search and filters", async () => {
    await expect(
      listPublicProducts(parseCatalogQuery({ q: "OG", marca: "OGGI", disponibilidad: "in-stock" })),
    ).resolves.toEqual([expect.objectContaining({ slug: "oggi-469" })]);
  });

  it("CAT-I-008: sorts by price ascending", async () => {
    const listed = await listPublicProducts(parseCatalogQuery({ sort: "price-asc" }));
    expect(listed.map((product) => product.priceCents)).toEqual(
      [...listed.map((product) => product.priceCents)].sort((a, b) => a - b),
    );
  });

  it("CAT-I-009: sorts by price descending", async () => {
    const listed = await listPublicProducts(parseCatalogQuery({ sort: "price-desc" }));
    expect(listed.map((product) => product.priceCents)).toEqual(
      [...listed.map((product) => product.priceCents)].sort((a, b) => b - a),
    );
  });

  it("CAT-I-010: returns an active product detail with images", async () => {
    await expect(getPublicProductBySlug("oggi-469")).resolves.toMatchObject({
      name: "OGGI 469",
      images: [{ url: "/images/products/oggi-469.png" }],
      branches: [{ name: "Salud y Vida Texcoco" }],
    });
  });

  it("CAT-I-011: returns null for an unknown or unsafe slug", async () => {
    await expect(getPublicProductBySlug("producto-que-no-existe")).resolves.toBeNull();
    await expect(getPublicProductBySlug("<script>")).resolves.toBeNull();
  });

  it("CAT-I-012: exposes branches with stock but not exact quantities", async () => {
    const product = await getPublicProductBySlug("oggi-469");
    expect(product?.branches).toEqual([
      { name: "Salud y Vida Texcoco", address: expect.any(String) },
    ]);
    expect(product).not.toHaveProperty("quantity");
  });

  it("CAT-I-013: keeps catalog seed idempotent", async () => {
    await seedDatabase();
    const row = await db.execute(
      sql`SELECT (SELECT count(*)::int FROM products) AS products, (SELECT count(*)::int FROM product_images) AS images, (SELECT count(*)::int FROM inventory) AS inventory`,
    );
    expect(row.rows[0]).toMatchObject({ products: 9, images: 8, inventory: 9 });
  });

  it("CAT-I-014: keeps SKU uniqueness protected", async () => {
    await expect(
      db.insert(products).values({
        id: randomUUID(),
        name: "SKU duplicado",
        slug: "sku-duplicado",
        description: "Prueba",
        sku: "HF525145",
        priceCents: 100,
      }),
    ).rejects.toThrow();
    await expect(
      db.select().from(products).where(eq(products.sku, "HF525145")),
    ).resolves.toHaveLength(1);
  });
});
