import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { branches, cartItems, carts, inventory, productImages, products } from "@/db/schema";
import {
  calculateCartSubtotal,
  calculateItemSubtotal,
  cartItemMutationSchema,
  cartMutationSchema,
  getCartItemState,
} from "@/lib/cart";

export type CartResult = { ok: true } | { ok: false; message: string };

export type CartSummary = {
  items: Array<{
    id: string;
    productId: string;
    name: string;
    slug: string;
    image: { url: string; alt: string } | null;
    quantity: number;
    priceCents: number;
    subtotalCents: number;
    state: ReturnType<typeof getCartItemState>;
  }>;
  itemCount: number;
  subtotalCents: number;
  totalCents: number;
};

const activeCart = eq(carts.status, "active");

async function activeCartForUser(userId: string) {
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(and(eq(carts.userId, userId), activeCart))
    .limit(1);
  return cart ?? null;
}

async function getOrCreateActiveCart(userId: string) {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);
    if (existing) return existing;

    const [created] = await tx
      .insert(carts)
      .values({ userId, status: "active" })
      .onConflictDoNothing()
      .returning({ id: carts.id });
    if (created) return created;

    const [concurrent] = await tx
      .select({ id: carts.id })
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, "active")))
      .limit(1);
    if (!concurrent) throw new Error("No fue posible crear el carrito activo.");
    return concurrent;
  });
}

async function productStock(productId: string) {
  const [product] = await db
    .select({ id: products.id, status: products.status, priceCents: products.priceCents })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  if (!product) return { ok: false as const, message: "El producto no existe." };
  if (product.status !== "active")
    return { ok: false as const, message: "Este producto ya no está disponible." };

  const stockRows = await db
    .select({ quantity: inventory.quantity })
    .from(inventory)
    .innerJoin(branches, eq(inventory.branchId, branches.id))
    .where(and(eq(inventory.productId, productId), eq(branches.isActive, true)));
  const stock = stockRows.reduce((total, row) => total + row.quantity, 0);
  if (stock < 1) return { ok: false as const, message: "Este producto está agotado." };
  return { ok: true as const, product, stock };
}

function invalidMessage(error: unknown) {
  return error instanceof Error ? error.message : "Datos de carrito inválidos.";
}

export async function getCartSummary(userId: string): Promise<CartSummary> {
  const cart = await activeCartForUser(userId);
  if (!cart) return { items: [], itemCount: 0, subtotalCents: 0, totalCents: 0 };

  const rows = await db
    .select({
      id: cartItems.id,
      productId: products.id,
      name: products.name,
      slug: products.slug,
      priceCents: products.priceCents,
      status: products.status,
      quantity: cartItems.quantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(asc(cartItems.createdAt));
  if (!rows.length) return { items: [], itemCount: 0, subtotalCents: 0, totalCents: 0 };

  const productIds = rows.map((row) => row.productId);
  const [images, stockRows] = await Promise.all([
    db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        alt: productImages.alt,
      })
      .from(productImages)
      .where(and(inArray(productImages.productId, productIds), eq(productImages.position, 0))),
    db
      .select({ productId: inventory.productId, quantity: inventory.quantity })
      .from(inventory)
      .innerJoin(branches, eq(inventory.branchId, branches.id))
      .where(and(inArray(inventory.productId, productIds), eq(branches.isActive, true))),
  ]);
  const imageByProduct = new Map(images.map((image) => [image.productId, image]));
  const stockByProduct = new Map<string, number>();
  for (const row of stockRows)
    stockByProduct.set(row.productId, (stockByProduct.get(row.productId) ?? 0) + row.quantity);

  const items = rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    name: row.name,
    slug: row.slug,
    image: imageByProduct.get(row.productId) ?? null,
    quantity: row.quantity,
    priceCents: row.priceCents,
    subtotalCents: calculateItemSubtotal(row.priceCents, row.quantity),
    state: getCartItemState({
      active: row.status === "active",
      stock: stockByProduct.get(row.productId) ?? 0,
      quantity: row.quantity,
    }),
  }));
  const subtotalCents = calculateCartSubtotal(items);
  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotalCents,
    totalCents: subtotalCents,
  };
}

export async function getCartItemCount(userId: string) {
  const cart = await activeCartForUser(userId);
  if (!cart) return 0;
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));
  return row?.count ?? 0;
}

export async function addCartItem(userId: string, input: unknown): Promise<CartResult> {
  const parsed = cartMutationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: invalidMessage(parsed.error.issues[0]) };
  const product = await productStock(parsed.data.productId);
  if (!product.ok) return product;
  const cart = await getOrCreateActiveCart(userId);
  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, parsed.data.productId)))
    .limit(1);
  const nextQuantity = (existing?.quantity ?? 0) + parsed.data.quantity;
  if (nextQuantity > product.stock)
    return { ok: false, message: `Solo hay ${product.stock} disponibles.` };
  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: nextQuantity, updatedAt: new Date() })
      .where(eq(cartItems.id, existing.id));
  } else {
    try {
      await db
        .insert(cartItems)
        .values({ cartId: cart.id, productId: parsed.data.productId, quantity: nextQuantity });
    } catch (error) {
      if (isUniqueViolation(error)) return addCartItem(userId, input);
      throw error;
    }
  }
  return { ok: true };
}

export async function updateCartItem(userId: string, input: unknown): Promise<CartResult> {
  const parsed = cartItemMutationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: invalidMessage(parsed.error.issues[0]) };
  const cart = await activeCartForUser(userId);
  if (!cart) return { ok: false, message: "No existe un carrito activo." };
  const [item] = await db
    .select({ productId: cartItems.productId })
    .from(cartItems)
    .where(and(eq(cartItems.id, parsed.data.cartItemId), eq(cartItems.cartId, cart.id)))
    .limit(1);
  if (!item) return { ok: false, message: "No puedes modificar este artículo." };
  const product = await productStock(item.productId);
  if (!product.ok) return product;
  if (parsed.data.quantity > product.stock)
    return { ok: false, message: `Solo hay ${product.stock} disponibles.` };
  await db
    .update(cartItems)
    .set({ quantity: parsed.data.quantity, updatedAt: new Date() })
    .where(and(eq(cartItems.id, parsed.data.cartItemId), eq(cartItems.cartId, cart.id)));
  return { ok: true };
}

export async function removeCartItem(userId: string, cartItemId: unknown): Promise<CartResult> {
  const parsed = cartItemMutationSchema.pick({ cartItemId: true }).safeParse({ cartItemId });
  if (!parsed.success) return { ok: false, message: invalidMessage(parsed.error.issues[0]) };
  const cart = await activeCartForUser(userId);
  if (!cart) return { ok: false, message: "No existe un carrito activo." };
  const deleted = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, parsed.data.cartItemId), eq(cartItems.cartId, cart.id)))
    .returning({ id: cartItems.id });
  return deleted[0] ? { ok: true } : { ok: false, message: "No puedes eliminar este artículo." };
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
