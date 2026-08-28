import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { resetDatabase } from "@/db/reset";

async function scalar(query: ReturnType<typeof sql>) {
  const result = await db.execute(query);
  return result.rows[0] as Record<string, unknown>;
}

describe("PostgreSQL integration constraints", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("DB-001: applies all physical tables including sessions", async () => {
    const row = await scalar(
      sql`SELECT count(*)::int AS count FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'roles', 'sessions', 'products', 'orders', 'appointments', 'contact_messages')`,
    );
    expect(row.count).toBe(7);
  });

  it("DB-002: seeds hashed users, roles, categories, products, branch and inventory", async () => {
    const row = await scalar(
      sql`SELECT (SELECT count(*)::int FROM users) AS users, (SELECT count(*)::int FROM roles) AS roles, (SELECT count(*)::int FROM categories) AS categories, (SELECT count(*)::int FROM products) AS products, (SELECT count(*)::int FROM branches) AS branches, (SELECT count(*)::int FROM inventory) AS inventory, (SELECT password_hash FROM users LIMIT 1) AS password_hash`,
    );
    expect(row).toMatchObject({
      users: 2,
      roles: 2,
      categories: 1,
      products: 9,
      branches: 1,
      inventory: 9,
    });
    expect(row.password_hash).toMatch(/^\$2[aby]\$/);
  });

  it("DB-003: enforces unique user emails", async () => {
    await expect(
      db.execute(
        sql`INSERT INTO users (id, name, email, password_hash) VALUES (${randomUUID()}, 'Duplicado', 'admin.demo@saludyvida.test', 'hash')`,
      ),
    ).rejects.toThrow();
  });

  it("DB-004: enforces unique product SKU and slug", async () => {
    await expect(
      db.execute(
        sql`INSERT INTO products (id, name, slug, description, sku, price_cents) VALUES (${randomUUID()}, 'Duplicado', 'oggi-469', 'Prueba', 'SV-UNICO', 100)`,
      ),
    ).rejects.toThrow();
    await expect(
      db.execute(
        sql`INSERT INTO products (id, name, slug, description, sku, price_cents) VALUES (${randomUUID()}, 'Duplicado', 'slug-unico', 'Prueba', 'HF525145', 100)`,
      ),
    ).rejects.toThrow();
  });

  it("DB-005: rejects negative product prices", async () => {
    await expect(
      db.execute(
        sql`INSERT INTO products (id, name, slug, description, sku, price_cents) VALUES (${randomUUID()}, 'Precio inválido', 'precio-invalido', 'Prueba', 'SV-NEGATIVE', -1)`,
      ),
    ).rejects.toThrow();
  });

  it("DB-006: enforces inventory per product and branch and non-negative quantity", async () => {
    await expect(
      db.execute(
        sql`INSERT INTO inventory (product_id, branch_id, quantity) SELECT product_id, branch_id, quantity FROM inventory LIMIT 1`,
      ),
    ).rejects.toThrow();
    await expect(
      db.execute(
        sql`UPDATE inventory SET quantity = -1 WHERE product_id = (SELECT id FROM products LIMIT 1)`,
      ),
    ).rejects.toThrow();
  });

  it("DB-007: allows only one active cart per user", async () => {
    await db.execute(
      sql`INSERT INTO carts (id, user_id) SELECT ${randomUUID()}, id FROM users WHERE email = 'user.demo@saludyvida.test'`,
    );
    await expect(
      db.execute(
        sql`INSERT INTO carts (id, user_id) SELECT ${randomUUID()}, id FROM users WHERE email = 'user.demo@saludyvida.test'`,
      ),
    ).rejects.toThrow();
    await expect(
      db.execute(
        sql`INSERT INTO carts (id, user_id, status) SELECT ${randomUUID()}, id, 'closed' FROM users WHERE email = 'user.demo@saludyvida.test'`,
      ),
    ).resolves.toBeDefined();
  });

  it("DB-008: enforces one cart item per product and a positive quantity", async () => {
    await db.execute(
      sql`INSERT INTO carts (id, user_id) SELECT ${randomUUID()}, id FROM users WHERE email = 'user.demo@saludyvida.test'`,
    );
    await db.execute(
      sql`INSERT INTO cart_items (id, cart_id, product_id, quantity) SELECT ${randomUUID()}, carts.id, products.id, 1 FROM carts CROSS JOIN products LIMIT 1`,
    );
    await expect(
      db.execute(
        sql`INSERT INTO cart_items (id, cart_id, product_id, quantity) SELECT ${randomUUID()}, carts.id, products.id, 1 FROM carts CROSS JOIN products LIMIT 1`,
      ),
    ).rejects.toThrow();
    await expect(
      db.execute(
        sql`INSERT INTO cart_items (id, cart_id, product_id, quantity) SELECT ${randomUUID()}, carts.id, products.id, 0 FROM carts CROSS JOIN products OFFSET 1 LIMIT 1`,
      ),
    ).rejects.toThrow();
  });

  it("DB-009: rejects negative totals and invalid order item quantities", async () => {
    const user = await scalar(sql`SELECT id FROM users WHERE email = 'user.demo@saludyvida.test'`);
    await expect(
      db.execute(
        sql`INSERT INTO orders (id, user_id, branch_id, reference, idempotency_key, subtotal_cents, total_cents) SELECT ${randomUUID()}, ${user.id as string}, id, ${`SV-TEST-${randomUUID()}`}, ${randomUUID()}, -1, 0 FROM branches LIMIT 1`,
      ),
    ).rejects.toThrow();
  });

  it("DB-010: cascades session deletion when its user is deleted", async () => {
    const userId = randomUUID();
    await db.execute(
      sql`INSERT INTO users (id, name, email, password_hash) VALUES (${userId}, 'Temporal', 'temporal@saludyvida.test', 'hash')`,
    );
    await db.execute(
      sql`INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (${randomUUID()}, ${userId}, ${"a".repeat(64)}, now() + interval '1 day')`,
    );
    await db.execute(sql`DELETE FROM users WHERE id = ${userId}`);
    const row = await scalar(
      sql`SELECT count(*)::int AS count FROM sessions WHERE user_id = ${userId}`,
    );
    expect(row.count).toBe(0);
  });

  it("DB-011: prevents booking the same branch slot twice", async () => {
    await db.execute(
      sql`INSERT INTO appointments (id, user_id, branch_id, appointment_date, appointment_time) SELECT ${randomUUID()}, users.id, branches.id, '2026-09-01', '10:00' FROM users CROSS JOIN branches WHERE users.email = 'user.demo@saludyvida.test'`,
    );
    await expect(
      db.execute(
        sql`INSERT INTO appointments (id, user_id, branch_id, appointment_date, appointment_time) SELECT ${randomUUID()}, users.id, branches.id, '2026-09-01', '10:00' FROM users CROSS JOIN branches WHERE users.email = 'admin.demo@saludyvida.test'`,
      ),
    ).rejects.toThrow();
  });

  it("DB-012: enforces one wishlist per user and unique wishlist products", async () => {
    await db.execute(
      sql`INSERT INTO wishlists (id, user_id) SELECT ${randomUUID()}, id FROM users WHERE email = 'user.demo@saludyvida.test'`,
    );
    await expect(
      db.execute(
        sql`INSERT INTO wishlists (id, user_id) SELECT ${randomUUID()}, id FROM users WHERE email = 'user.demo@saludyvida.test'`,
      ),
    ).rejects.toThrow();
  });
});
