import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db/client";
import { branches, categories, inventory, productImages, products } from "@/db/schema";
import { getAvailability, type CatalogQuery } from "@/lib/catalog";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  brand: string | null;
  frameModel: string | null;
  gender: string | null;
  priceCents: number;
  category: { name: string; slug: string } | null;
  image: { url: string; alt: string } | null;
  availability: ReturnType<typeof getAvailability>;
};

export type PublicProductDetail = PublicProduct & {
  images: { url: string; alt: string }[];
  branches: { name: string; address: string }[];
};

export type CatalogFacets = {
  categories: { name: string; slug: string }[];
  brands: string[];
  genders: string[];
};

const activeProduct = eq(products.status, "active");

export async function getCatalogFacets(): Promise<CatalogFacets> {
  const [categoryRows, brandRows, genderRows] = await Promise.all([
    db
      .select({ name: categories.name, slug: categories.slug })
      .from(categories)
      .innerJoin(products, eq(products.categoryId, categories.id))
      .where(and(eq(categories.isActive, true), activeProduct))
      .groupBy(categories.id)
      .orderBy(asc(categories.name)),
    db
      .select({ value: products.brand })
      .from(products)
      .where(and(activeProduct, sql`${products.brand} IS NOT NULL`))
      .groupBy(products.brand)
      .orderBy(asc(products.brand)),
    db
      .select({ value: products.gender })
      .from(products)
      .where(and(activeProduct, sql`${products.gender} IS NOT NULL`))
      .groupBy(products.gender)
      .orderBy(asc(products.gender)),
  ]);

  return {
    categories: categoryRows,
    brands: brandRows.flatMap((row) => (row.value ? [row.value] : [])),
    genders: genderRows.flatMap((row) => (row.value ? [row.value] : [])),
  };
}

export async function listPublicProducts(
  query: CatalogQuery,
  limit = 48,
): Promise<PublicProduct[]> {
  const conditions = [activeProduct];
  if (query.q) {
    const pattern = `%${query.q}%`;
    conditions.push(
      or(
        ilike(products.name, pattern),
        ilike(products.brand, pattern),
        ilike(products.frameModel, pattern),
        ilike(products.sku, pattern),
      )!,
    );
  }
  if (query.category) conditions.push(eq(categories.slug, query.category));
  if (query.brand) conditions.push(eq(products.brand, query.brand));
  if (query.gender) conditions.push(eq(products.gender, query.gender));

  const hasStock = sql`EXISTS (SELECT 1 FROM ${inventory} WHERE ${inventory.productId} = ${products.id} AND ${inventory.quantity} > 0)`;
  if (query.availability === "in-stock") conditions.push(hasStock);
  if (query.availability === "out-of-stock") conditions.push(sql`NOT ${hasStock}`);

  const orderBy =
    query.sort === "price-asc"
      ? [asc(products.priceCents), asc(products.name)]
      : query.sort === "price-desc"
        ? [desc(products.priceCents), asc(products.name)]
        : query.sort === "name" || !query.q
          ? [asc(products.name)]
          : [
              sql`CASE WHEN lower(${products.name}) = lower(${query.q}) THEN 0 WHEN lower(${products.name}) LIKE lower(${`${query.q}%`}) THEN 1 ELSE 2 END`,
              asc(products.name),
            ];

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      sku: products.sku,
      brand: products.brand,
      frameModel: products.frameModel,
      gender: products.gender,
      priceCents: products.priceCents,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(...orderBy)
    .limit(Math.min(Math.max(limit, 1), 48));

  return hydrateProducts(rows);
}

export const getPublicProductBySlug = cache(
  async (slug: string): Promise<PublicProductDetail | null> => {
    if (!/^[a-z0-9-]{1,180}$/.test(slug)) return null;
    const [row] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        sku: products.sku,
        brand: products.brand,
        frameModel: products.frameModel,
        gender: products.gender,
        priceCents: products.priceCents,
        categoryName: categories.name,
        categorySlug: categories.slug,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(activeProduct, eq(products.slug, slug)))
      .limit(1);
    if (!row) return null;

    const [product] = await hydrateProducts([row]);
    if (!product) return null;
    const branchRows = await db
      .select({ name: branches.name, address: branches.address })
      .from(inventory)
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(
        and(
          eq(inventory.productId, product.id),
          eq(branches.isActive, true),
          sql`${inventory.quantity} > 0`,
        ),
      )
      .orderBy(asc(branches.name));
    const imageRows = await db
      .select({ url: productImages.url, alt: productImages.alt })
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position));

    return { ...product, images: imageRows, branches: branchRows };
  },
);

export async function getFeaturedProducts() {
  return listPublicProducts(
    { q: "", category: null, brand: null, gender: null, availability: "in-stock", sort: "name" },
    3,
  );
}

async function hydrateProducts(
  rows: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    brand: string | null;
    frameModel: string | null;
    gender: string | null;
    priceCents: number;
    categoryName: string | null;
    categorySlug: string | null;
  }>,
): Promise<PublicProduct[]> {
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const [imageRows, inventoryRows] = await Promise.all([
    db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        alt: productImages.alt,
      })
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.productId), asc(productImages.position)),
    db
      .select({ productId: inventory.productId, quantity: inventory.quantity })
      .from(inventory)
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(and(inArray(inventory.productId, ids), eq(branches.isActive, true))),
  ]);
  const firstImage = new Map<string, { url: string; alt: string }>();
  for (const image of imageRows)
    if (!firstImage.has(image.productId)) firstImage.set(image.productId, image);
  const quantities = new Map<string, number>();
  for (const stock of inventoryRows)
    quantities.set(stock.productId, (quantities.get(stock.productId) ?? 0) + stock.quantity);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sku: row.sku,
    brand: row.brand,
    frameModel: row.frameModel,
    gender: row.gender,
    priceCents: row.priceCents,
    category:
      row.categoryName && row.categorySlug
        ? { name: row.categoryName, slug: row.categorySlug }
        : null,
    image: firstImage.get(row.id) ?? null,
    availability: getAvailability(quantities.get(row.id) ?? 0),
  }));
}
