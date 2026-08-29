import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import {
  approvedProductionImageCount,
  approvedProductionProductCount,
  requireDatabaseUrl,
  setupProductionData,
} from "@/db/production-data";
import { truncateDatabase } from "@/db/reset";

async function counts() {
  const result = await db.execute(sql`
    SELECT
      (SELECT count(*)::int FROM roles) AS roles,
      (SELECT count(*)::int FROM categories) AS categories,
      (SELECT count(*)::int FROM products) AS products,
      (SELECT count(*)::int FROM product_images) AS images,
      (SELECT count(*)::int FROM branches) AS branches,
      (SELECT count(*)::int FROM inventory) AS inventory,
      (SELECT count(*)::int FROM users) AS users,
      (SELECT count(*)::int FROM sessions) AS sessions,
      (SELECT count(*)::int FROM carts) AS carts,
      (SELECT count(*)::int FROM cart_items) AS cart_items,
      (SELECT count(*)::int FROM orders) AS orders,
      (SELECT count(*)::int FROM order_items) AS order_items,
      (SELECT count(*)::int FROM contact_messages) AS contact_messages
  `);
  return result.rows[0] as Record<string, number>;
}

describe("production database setup", () => {
  beforeEach(async () => {
    await truncateDatabase();
  });

  it("DB-SETUP-I-001: empty migrated DB setup succeeds", async () => {
    await expect(setupProductionData()).resolves.toMatchObject({
      roles: 2,
      categories: 1,
      products: approvedProductionProductCount,
      images: approvedProductionImageCount,
      branches: 1,
      inventory: 0,
    });
  });

  it("DB-SETUP-I-002 / VERCEL-DB-008: second setup remains idempotent", async () => {
    await setupProductionData();
    const first = await counts();
    await setupProductionData();
    expect(await counts()).toEqual(first);
  });

  it("DB-SETUP-I-003: roles created", async () => {
    await setupProductionData();
    const result = await db.execute(sql`SELECT key FROM roles ORDER BY key`);
    expect(result.rows.map((row) => row.key)).toEqual(["ADMIN", "USER"]);
  });

  it("DB-SETUP-I-004: catalog initial data created", async () => {
    await setupProductionData();
    expect(await counts()).toMatchObject({
      categories: 1,
      products: approvedProductionProductCount,
      images: approvedProductionImageCount,
      inventory: 0,
    });
  });

  it("DB-SETUP-I-005: branch initial data created", async () => {
    await setupProductionData();
    const result = await db.execute(sql`SELECT name, address, phone, opening_hours FROM branches`);
    expect(result.rows).toEqual([
      {
        name: "Salud y Vida Texcoco",
        address: "San Mateo, Texcoco de Mora, Estado de México, C.P. 56170",
        phone: null,
        opening_hours: null,
      },
    ]);
  });

  it("DB-SETUP-I-006: no users created", async () => {
    await setupProductionData();
    expect((await counts()).users).toBe(0);
  });

  it("DB-SETUP-I-007: no sessions created", async () => {
    await setupProductionData();
    expect((await counts()).sessions).toBe(0);
  });

  it("DB-SETUP-I-008: no transactional data created", async () => {
    await setupProductionData();
    expect(await counts()).toMatchObject({
      carts: 0,
      cart_items: 0,
      orders: 0,
      order_items: 0,
      contact_messages: 0,
    });
  });

  it("DB-SETUP-I-009: missing DATABASE_URL fails clearly", () => {
    expect(() => requireDatabaseUrl("")).toThrow("DATABASE_URL is required to run db:setup.");
  });
});
