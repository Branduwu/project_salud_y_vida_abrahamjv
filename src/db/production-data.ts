import { sql } from "drizzle-orm";
import { db } from "./client";
import { branches, categories, productImages, products, roles } from "./schema";

/** Datos comerciales versionados, aptos para una base nueva de producción. */
export const productionIds = {
  adminRole: "00000000-0000-4000-8000-000000000001",
  userRole: "00000000-0000-4000-8000-000000000002",
  optical: "00000000-0000-4000-8000-000000000021",
  branch: "00000000-0000-4000-8000-000000000031",
  oggi469: "00000000-0000-4000-8000-000000000041",
  boyLondon: "00000000-0000-4000-8000-000000000042",
  steveMadden: "00000000-0000-4000-8000-000000000043",
  og359: "00000000-0000-4000-8000-000000000044",
  og377: "00000000-0000-4000-8000-000000000045",
  og376: "00000000-0000-4000-8000-000000000046",
  christianSiriano: "00000000-0000-4000-8000-000000000047",
  cosmopolitan: "00000000-0000-4000-8000-000000000048",
} as const;

const productionProducts = [
  {
    id: productionIds.oggi469,
    categoryId: productionIds.optical,
    name: "OGGI 469",
    slug: "oggi-469",
    description: "Rompe con lo ordinario, marca el look.",
    sku: "HF525145",
    brand: "OGGI",
    frameModel: "OG 469",
    gender: "Unisex",
    priceCents: 200000,
  },
  {
    id: productionIds.boyLondon,
    categoryId: productionIds.optical,
    name: "BOY LONDON",
    slug: "boy-london-bo-007",
    description:
      "Diseño de marco completo ovalado que da un estilo atractivo, para que expreses tu personalidad.",
    sku: "BOY-BO0",
    brand: "BOY LONDON",
    frameModel: "BO 007",
    gender: "Unisex",
    priceCents: 105000,
  },
  {
    id: productionIds.steveMadden,
    categoryId: productionIds.optical,
    name: "STEVE MADDEN",
    slug: "steve-madden-colorblends",
    description:
      "Exprésate con lentes Steven Madden, los ojos es lo primero que se observa en una persona.",
    sku: "LC1506009",
    brand: "STEVE MADDEN",
    frameModel: "Colorblends",
    gender: "Unisex",
    priceCents: 40000,
  },
  {
    id: productionIds.og359,
    categoryId: productionIds.optical,
    name: "OG 359",
    slug: "og-359",
    description: "Lente oftálmico unisex.",
    sku: "DTR564C44",
    brand: "Tous",
    frameModel: "AWS42149",
    gender: "Mujer",
    priceCents: 80000,
  },
  {
    id: productionIds.og377,
    categoryId: productionIds.optical,
    name: "OG 377",
    slug: "og-377",
    description:
      "Armazón ligero elaborado de titanio con un estilo sencillo pero vanguardista que resaltará la belleza de tus ojos.",
    sku: "567423",
    brand: "Xicu",
    frameModel: "XICU C895",
    gender: "Mujer",
    priceCents: 40000,
  },
  {
    id: productionIds.og376,
    categoryId: productionIds.optical,
    name: "OG 376",
    slug: "og-376",
    description: "Una combinación de estilo y funcionalidad.",
    sku: "RF624135",
    brand: "Oakley",
    frameModel: "3 piezas",
    gender: "Mujer",
    priceCents: 50000,
  },
  {
    id: productionIds.christianSiriano,
    categoryId: productionIds.optical,
    name: "CHRISTIAN SIRIANO",
    slug: "christian-siriano-evr21902",
    description: "Lente oftálmico para mujer Evry CHR-TTU verde.",
    sku: "PST564C44",
    brand: "Evry",
    frameModel: "EVR21902",
    gender: "Mujer",
    priceCents: 99900,
  },
  {
    id: productionIds.cosmopolitan,
    categoryId: productionIds.optical,
    name: "COSMOPOLITAN",
    slug: "cosmopolitan-dg-84578s",
    description: "Lente oftálmico para mujer Molto COS-C910 negro.",
    sku: "AW685C2",
    brand: "Molto",
    frameModel: "DG-84578S",
    gender: "Mujer",
    priceCents: 99900,
  },
] as const;

const productionImages = [
  {
    productId: productionIds.oggi469,
    url: "/images/products/oggi-469.png",
    alt: "Armazón OGGI 469",
    position: 0,
  },
  {
    productId: productionIds.boyLondon,
    url: "/images/products/boy-london-bo-007.jpeg",
    alt: "Armazón BOY LONDON BO 007",
    position: 0,
  },
  {
    productId: productionIds.steveMadden,
    url: "/images/products/steve-madden-colorblends.jpeg",
    alt: "Armazón STEVE MADDEN Colorblends",
    position: 0,
  },
  {
    productId: productionIds.og359,
    url: "/images/products/og-359.jpeg",
    alt: "Armazón OG 359",
    position: 0,
  },
  {
    productId: productionIds.og377,
    url: "/images/products/og-377.jpeg",
    alt: "Armazón OG 377",
    position: 0,
  },
  {
    productId: productionIds.og376,
    url: "/images/products/og-376.jpeg",
    alt: "Armazón OG 376",
    position: 0,
  },
  {
    productId: productionIds.christianSiriano,
    url: "/images/products/christian-siriano-evr21902.jpeg",
    alt: "Armazón CHRISTIAN SIRIANO EVR21902",
    position: 0,
  },
  {
    productId: productionIds.cosmopolitan,
    url: "/images/products/cosmopolitan-dg-84578s.jpeg",
    alt: "Armazón COSMOPOLITAN DG-84578S",
    position: 0,
  },
] as const;

export type ProductionDataSummary = {
  roles: number;
  categories: number;
  products: number;
  images: number;
  branches: number;
  inventory: number;
};

export function requireDatabaseUrl(value = process.env.DATABASE_URL) {
  if (!value?.trim()) throw new Error("DATABASE_URL is required to run db:setup.");
  return value;
}

/** Inserts only non-sensitive, approved commercial data. No users or inventory are created. */
export async function setupProductionData() {
  await db.transaction(async (tx) => {
    await tx
      .insert(roles)
      .values([
        { id: productionIds.adminRole, key: "ADMIN", description: "Administración del sitio" },
        { id: productionIds.userRole, key: "USER", description: "Cliente del sitio" },
      ])
      .onConflictDoNothing();
    await tx
      .insert(categories)
      .values({
        id: productionIds.optical,
        name: "Armazones ópticos",
        slug: "armazones-opticos",
        description: "Armazones del catálogo actual de Salud y Vida.",
      })
      .onConflictDoNothing();
    await tx
      .insert(branches)
      .values({
        id: productionIds.branch,
        name: "Salud y Vida Texcoco",
        slug: "texcoco",
        address: "San Mateo, Texcoco de Mora, Estado de México, C.P. 56170",
      })
      .onConflictDoNothing();
    await tx
      .insert(products)
      .values([...productionProducts])
      .onConflictDoNothing();
    await tx
      .insert(productImages)
      .values([...productionImages])
      .onConflictDoNothing();
  });
  return validateProductionSetup();
}

export async function validateProductionSetup(): Promise<ProductionDataSummary> {
  const tables = await db.execute(
    sql`SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('roles', 'categories', 'products', 'branches')`,
  );
  if ((tables.rows[0] as { count: number }).count !== 4)
    throw new Error("db:setup validation failed: required catalog tables are missing.");
  const result = await db.execute(
    sql`SELECT (SELECT count(*)::int FROM roles) AS roles, (SELECT count(*)::int FROM categories) AS categories, (SELECT count(*)::int FROM products) AS products, (SELECT count(*)::int FROM product_images) AS images, (SELECT count(*)::int FROM branches) AS branches, (SELECT count(*)::int FROM inventory) AS inventory`,
  );
  const summary = result.rows[0] as ProductionDataSummary;
  if (
    summary.roles < 2 ||
    summary.categories < 1 ||
    summary.products < productionProducts.length ||
    summary.images < productionImages.length ||
    summary.branches < 1
  )
    throw new Error("db:setup validation failed: required production data is incomplete.");
  return summary;
}

export const approvedProductionProductCount = productionProducts.length;
export const approvedProductionImageCount = productionImages.length;
