import { hash } from "bcryptjs";
import { db } from "./client";
import {
  branches,
  categories,
  inventory,
  productImages,
  products,
  roles,
  userRoles,
  users,
} from "./schema";

const ids = {
  adminRole: "00000000-0000-4000-8000-000000000001",
  userRole: "00000000-0000-4000-8000-000000000002",
  admin: "00000000-0000-4000-8000-000000000011",
  user: "00000000-0000-4000-8000-000000000012",
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
  outOfStock: "00000000-0000-4000-8000-000000000049",
} as const;

export async function seedDatabase() {
  const passwordHash = await getDemoPasswordHash();

  await db
    .insert(roles)
    .values([
      { id: ids.adminRole, key: "ADMIN", description: "Administración demo" },
      { id: ids.userRole, key: "USER", description: "Cliente demo" },
    ])
    .onConflictDoNothing();
  await db
    .insert(users)
    .values([
      { id: ids.admin, name: "Admin Demo", email: "admin.demo@saludyvida.test", passwordHash },
      { id: ids.user, name: "Usuario Demo", email: "user.demo@saludyvida.test", passwordHash },
    ])
    .onConflictDoNothing();
  await db
    .insert(userRoles)
    .values([
      { userId: ids.admin, roleId: ids.adminRole },
      { userId: ids.user, roleId: ids.userRole },
    ])
    .onConflictDoNothing();
  await db
    .insert(categories)
    .values({
      id: ids.optical,
      name: "Armazones ópticos",
      slug: "armazones-opticos",
      description: "Armazones del catálogo histórico de Salud y Vida.",
    })
    .onConflictDoNothing();
  await db
    .insert(branches)
    .values({
      id: ids.branch,
      name: "Salud y Vida Texcoco",
      slug: "texcoco",
      address: "San Mateo, Texcoco de Mora, Estado de México, C.P. 56170",
      phone: "555-235-9687",
      openingHours: "Lunes a viernes 09:00-20:00; sábado 09:00-14:30",
    })
    .onConflictDoNothing();
  await db
    .insert(products)
    .values([
      {
        id: ids.oggi469,
        categoryId: ids.optical,
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
        id: ids.boyLondon,
        categoryId: ids.optical,
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
        id: ids.steveMadden,
        categoryId: ids.optical,
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
        id: ids.og359,
        categoryId: ids.optical,
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
        id: ids.og377,
        categoryId: ids.optical,
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
        id: ids.og376,
        categoryId: ids.optical,
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
        id: ids.christianSiriano,
        categoryId: ids.optical,
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
        id: ids.cosmopolitan,
        categoryId: ids.optical,
        name: "COSMOPOLITAN",
        slug: "cosmopolitan-dg-84578s",
        description: "Lente oftálmico para mujer Molto COS-C910 negro.",
        sku: "AW685C2",
        brand: "Molto",
        frameModel: "DG-84578S",
        gender: "Mujer",
        priceCents: 99900,
      },
      {
        id: ids.outOfStock,
        categoryId: ids.optical,
        name: "Muestra sin existencias",
        slug: "muestra-sin-existencias",
        description:
          "Producto demostrativo para comunicar disponibilidad agotada; no procede del catálogo histórico.",
        sku: "SV-DEMO-OUT-OF-STOCK",
        brand: null,
        frameModel: null,
        gender: null,
        priceCents: 75000,
      },
    ])
    .onConflictDoNothing();
  await db
    .insert(productImages)
    .values([
      {
        productId: ids.oggi469,
        url: "/images/products/oggi-469.png",
        alt: "Armazón OGGI 469",
        position: 0,
      },
      {
        productId: ids.boyLondon,
        url: "/images/products/boy-london-bo-007.jpeg",
        alt: "Armazón BOY LONDON BO 007",
        position: 0,
      },
      {
        productId: ids.steveMadden,
        url: "/images/products/steve-madden-colorblends.jpeg",
        alt: "Armazón STEVE MADDEN Colorblends",
        position: 0,
      },
      {
        productId: ids.og359,
        url: "/images/products/og-359.jpeg",
        alt: "Armazón OG 359",
        position: 0,
      },
      {
        productId: ids.og377,
        url: "/images/products/og-377.jpeg",
        alt: "Armazón OG 377",
        position: 0,
      },
      {
        productId: ids.og376,
        url: "/images/products/og-376.jpeg",
        alt: "Armazón OG 376",
        position: 0,
      },
      {
        productId: ids.christianSiriano,
        url: "/images/products/christian-siriano-evr21902.jpeg",
        alt: "Armazón CHRISTIAN SIRIANO EVR21902",
        position: 0,
      },
      {
        productId: ids.cosmopolitan,
        url: "/images/products/cosmopolitan-dg-84578s.jpeg",
        alt: "Armazón COSMOPOLITAN DG-84578S",
        position: 0,
      },
    ])
    .onConflictDoNothing();
  await db
    .insert(inventory)
    .values([
      { productId: ids.oggi469, branchId: ids.branch, quantity: 5 },
      { productId: ids.boyLondon, branchId: ids.branch, quantity: 5 },
      { productId: ids.steveMadden, branchId: ids.branch, quantity: 10 },
      { productId: ids.og359, branchId: ids.branch, quantity: 2 },
      { productId: ids.og377, branchId: ids.branch, quantity: 3 },
      { productId: ids.og376, branchId: ids.branch, quantity: 19 },
      { productId: ids.christianSiriano, branchId: ids.branch, quantity: 4 },
      { productId: ids.cosmopolitan, branchId: ids.branch, quantity: 3 },
      { productId: ids.outOfStock, branchId: ids.branch, quantity: 0 },
    ])
    .onConflictDoNothing();
}

let demoPasswordHash: string | undefined;

async function getDemoPasswordHash() {
  demoPasswordHash ??= await hash("DemoOnly!2026", 12);
  return demoPasswordHash;
}
