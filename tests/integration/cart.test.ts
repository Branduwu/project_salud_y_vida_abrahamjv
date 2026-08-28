import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/db/client";
import { cartItems, carts, inventory, products, users } from "@/db/schema";
import { getCartSummary, addCartItem, removeCartItem, updateCartItem } from "@/server/cart-service";
import { resetDatabase } from "@/db/reset";

const userA = "00000000-0000-4000-8000-000000000012";
const productId = "00000000-0000-4000-8000-000000000041";
const outOfStockId = "00000000-0000-4000-8000-000000000049";

async function secondUser() {
  const id = randomUUID();
  await db
    .insert(users)
    .values({ id, name: "Usuario B", email: `${id}@saludyvida.test`, passwordHash: "hash" });
  return id;
}

describe("persistent server cart", () => {
  beforeEach(async () => resetDatabase());

  it("CART-I-001: creates one active cart", async () => {
    await expect(addCartItem(userA, { productId, quantity: 1 })).resolves.toEqual({ ok: true });
    await expect(
      db
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userA), eq(carts.status, "active"))),
    ).resolves.toHaveLength(1);
  });
  it("CART-I-002: adds an item", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    await expect(getCartSummary(userA)).resolves.toMatchObject({
      itemCount: 1,
      items: [{ productId, quantity: 1 }],
    });
  });
  it("CART-I-003: increments the same product without duplicates", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    await addCartItem(userA, { productId, quantity: 2 });
    const summary = await getCartSummary(userA);
    expect(summary.items).toHaveLength(1);
    expect(summary.items[0]?.quantity).toBe(3);
  });
  it("CART-I-004: updates quantity", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    const item = (await getCartSummary(userA)).items[0];
    if (!item) throw new Error("item missing");
    await expect(updateCartItem(userA, { cartItemId: item.id, quantity: 2 })).resolves.toEqual({
      ok: true,
    });
  });
  it("CART-I-005: removes an item", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    const item = (await getCartSummary(userA)).items[0];
    if (!item) throw new Error("item missing");
    await removeCartItem(userA, item.id);
    await expect(getCartSummary(userA)).resolves.toMatchObject({ items: [], itemCount: 0 });
  });
  it("CART-I-006: returns an empty cart", async () =>
    await expect(getCartSummary(userA)).resolves.toMatchObject({ items: [], totalCents: 0 }));
  it("CART-I-007-009: rejects zero, negative and decimal quantities", async () => {
    for (const quantity of [0, -1, 1.5])
      await expect(addCartItem(userA, { productId, quantity })).resolves.toMatchObject({
        ok: false,
      });
  });
  it("CART-I-010: rejects quantity above stock", async () =>
    await expect(addCartItem(userA, { productId, quantity: 6 })).resolves.toMatchObject({
      ok: false,
    }));
  it("CART-I-011: rejects an exhausted product", async () =>
    await expect(
      addCartItem(userA, { productId: outOfStockId, quantity: 1 }),
    ).resolves.toMatchObject({ ok: false }));
  it("CART-I-012: rejects an inactive product", async () => {
    await db.update(products).set({ status: "inactive" }).where(eq(products.id, productId));
    await expect(addCartItem(userA, { productId, quantity: 1 })).resolves.toMatchObject({
      ok: false,
    });
  });
  it("CART-I-013 and CART-SEC-001: ignores client price authority", async () => {
    await expect(addCartItem(userA, { productId, quantity: 1, price: 1 })).resolves.toMatchObject({
      ok: false,
    });
    await addCartItem(userA, { productId, quantity: 1 });
    await expect(getCartSummary(userA)).resolves.toMatchObject({ subtotalCents: 200000 });
  });
  it("CART-I-014: reflects changed DB price", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    await db.update(products).set({ priceCents: 120000 }).where(eq(products.id, productId));
    await expect(getCartSummary(userA)).resolves.toMatchObject({ subtotalCents: 120000 });
  });
  it("CART-I-015: reports stock reduced after adding", async () => {
    await addCartItem(userA, { productId, quantity: 5 });
    await db.update(inventory).set({ quantity: 2 }).where(eq(inventory.productId, productId));
    await expect(getCartSummary(userA)).resolves.toMatchObject({
      items: [{ state: { key: "stock-reduced" } }],
    });
  });
  it("CART-I-016-017 and CART-SEC-002-003: enforces ownership", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    const item = (await getCartSummary(userA)).items[0];
    if (!item) throw new Error("item missing");
    const userB = await secondUser();
    await expect(
      updateCartItem(userB, { cartItemId: item.id, quantity: 2 }),
    ).resolves.toMatchObject({ ok: false });
    await expect(removeCartItem(userB, item.id)).resolves.toMatchObject({ ok: false });
    await expect(getCartSummary(userA)).resolves.toMatchObject({ itemCount: 1 });
  });
  it("CART-I-018: anonymous identity cannot mutate", async () =>
    await expect(addCartItem("not-a-user", { productId, quantity: 1 })).rejects.toThrow());
  it("CART-I-019: persists for the same user", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    await expect(getCartSummary(userA)).resolves.toMatchObject({ itemCount: 1 });
  });
  it("CART-I-020: database prevents duplicate cart/product rows", async () => {
    await addCartItem(userA, { productId, quantity: 1 });
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userA));
    if (!cart) throw new Error("cart missing");
    await expect(
      db.insert(cartItems).values({ cartId: cart.id, productId, quantity: 1 }),
    ).rejects.toThrow();
  });
});
