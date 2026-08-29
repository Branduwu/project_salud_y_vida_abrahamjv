import { hash } from "bcryptjs";
import { db } from "./client";
import { productionIds, setupProductionData } from "./production-data";
import { inventory, products, userRoles, users } from "./schema";

const demoIds = {
  admin: "00000000-0000-4000-8000-000000000011",
  user: "00000000-0000-4000-8000-000000000012",
  outOfStock: "00000000-0000-4000-8000-000000000049",
} as const;

/** DEV/TEST only. Deliberately includes demo identities and demo inventory. */
export async function seedDatabase() {
  const passwordHash = await getDemoPasswordHash();
  await setupProductionData();
  await db
    .insert(users)
    .values([
      { id: demoIds.admin, name: "Admin Demo", email: "admin.demo@saludyvida.test", passwordHash },
      { id: demoIds.user, name: "Usuario Demo", email: "user.demo@saludyvida.test", passwordHash },
    ])
    .onConflictDoNothing();
  await db
    .insert(userRoles)
    .values([
      { userId: demoIds.admin, roleId: productionIds.adminRole },
      { userId: demoIds.user, roleId: productionIds.userRole },
    ])
    .onConflictDoNothing();
  await db
    .insert(products)
    .values({
      id: demoIds.outOfStock,
      categoryId: productionIds.optical,
      name: "Muestra sin existencias",
      slug: "muestra-sin-existencias",
      description:
        "Producto demostrativo para comunicar disponibilidad agotada; no procede del catálogo comercial.",
      sku: "SV-DEMO-OUT-OF-STOCK",
      priceCents: 75000,
    })
    .onConflictDoNothing();
  await db
    .insert(inventory)
    .values([
      { productId: productionIds.oggi469, branchId: productionIds.branch, quantity: 5 },
      { productId: productionIds.boyLondon, branchId: productionIds.branch, quantity: 5 },
      { productId: productionIds.steveMadden, branchId: productionIds.branch, quantity: 10 },
      { productId: productionIds.og359, branchId: productionIds.branch, quantity: 2 },
      { productId: productionIds.og377, branchId: productionIds.branch, quantity: 3 },
      { productId: productionIds.og376, branchId: productionIds.branch, quantity: 19 },
      { productId: productionIds.christianSiriano, branchId: productionIds.branch, quantity: 4 },
      { productId: productionIds.cosmopolitan, branchId: productionIds.branch, quantity: 3 },
      { productId: demoIds.outOfStock, branchId: productionIds.branch, quantity: 0 },
    ])
    .onConflictDoNothing();
}

let demoPasswordHash: string | undefined;
async function getDemoPasswordHash() {
  demoPasswordHash ??= await hash("DemoOnly!2026", 12);
  return demoPasswordHash;
}
