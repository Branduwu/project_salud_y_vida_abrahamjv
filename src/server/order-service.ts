import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { branches, cartItems, carts, inventory, orderItems, orders, products } from "@/db/schema";
import { calculateOrderTotals, checkoutInputSchema, createOrderReference } from "@/lib/order";

type CheckoutResult =
  { ok: true; reference: string } | { ok: false; code: string; message: string };

async function activeCart(userId: string) {
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
    .limit(1);
  return cart ?? null;
}

export async function getCheckoutBranches(userId: string) {
  const cart = await activeCart(userId);
  if (!cart) return [];
  const items = await db
    .select({ productId: cartItems.productId, quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));
  if (!items.length) return [];
  const rows = await db
    .select({
      id: branches.id,
      name: branches.name,
      address: branches.address,
      productId: inventory.productId,
      quantity: inventory.quantity,
    })
    .from(branches)
    .innerJoin(inventory, eq(branches.id, inventory.branchId))
    .where(
      and(
        eq(branches.isActive, true),
        inArray(
          inventory.productId,
          items.map((item) => item.productId),
        ),
      ),
    );
  return [
    ...new Map(
      rows.map((row) => [row.id, { id: row.id, name: row.name, address: row.address }]),
    ).values(),
  ].filter((branch) =>
    items.every((item) =>
      rows.some(
        (row) =>
          row.id === branch.id && row.productId === item.productId && row.quantity >= item.quantity,
      ),
    ),
  );
}

export async function createOrderFromCart(userId: string, input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutInputSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, code: "INVALID_BRANCH", message: "Datos de checkout inválidos." };
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ reference: orders.reference })
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.idempotencyKey, parsed.data.idempotencyKey)))
      .limit(1);
    if (existing[0]) return { ok: true, reference: existing[0].reference };
    const [cart] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);
    if (!cart) return { ok: false, code: "EMPTY_CART", message: "Tu carrito está vacío." };
    const items = await tx
      .select({
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        name: products.name,
        sku: products.sku,
        priceCents: products.priceCents,
        status: products.status,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id))
      .orderBy(asc(cartItems.productId));
    if (!items.length) return { ok: false, code: "EMPTY_CART", message: "Tu carrito está vacío." };
    const [branch] = await tx
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, parsed.data.branchId), eq(branches.isActive, true)))
      .limit(1);
    if (!branch)
      return { ok: false, code: "BRANCH_UNAVAILABLE", message: "La sucursal no está disponible." };
    if (items.some((item) => item.status !== "active"))
      return {
        ok: false,
        code: "PRODUCT_INACTIVE",
        message: "Hay un producto no disponible en tu carrito.",
      };
    const locked = await tx.execute(
      sql`SELECT product_id, quantity FROM inventory WHERE branch_id = ${branch.id} AND product_id IN ${items.map((item) => item.productId)} FOR UPDATE`,
    );
    const stock = new Map(locked.rows.map((row) => [String(row.product_id), Number(row.quantity)]));
    const insufficient = items.find((item) => (stock.get(item.productId) ?? 0) < item.quantity);
    if (insufficient)
      return {
        ok: false,
        code: "INSUFFICIENT_STOCK",
        message: `La sucursal no puede surtir ${insufficient.name}.`,
      };
    const totals = calculateOrderTotals(
      items.map((item) => ({ unitPriceCents: item.priceCents, quantity: item.quantity })),
    );
    const reference = createOrderReference();
    const [order] = await tx
      .insert(orders)
      .values({
        userId,
        branchId: branch.id,
        reference,
        idempotencyKey: parsed.data.idempotencyKey,
        status: "confirmed",
        ...totals,
      })
      .returning({ id: orders.id });
    if (!order) throw new Error("Order creation failed");
    await tx.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        unitPriceCents: item.priceCents,
        quantity: item.quantity,
        subtotalCents: item.priceCents * item.quantity,
      })),
    );
    for (const item of items)
      await tx.execute(
        sql`UPDATE inventory SET quantity = quantity - ${item.quantity}, updated_at = now() WHERE branch_id = ${branch.id} AND product_id = ${item.productId} AND quantity >= ${item.quantity}`,
      );
    await tx
      .update(carts)
      .set({ status: "closed", updatedAt: new Date() })
      .where(eq(carts.id, cart.id));
    return { ok: true, reference };
  });
}
