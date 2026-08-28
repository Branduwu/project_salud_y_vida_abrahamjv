import { z } from "zod";

export const MAX_CART_QUANTITY = 99;

export const cartQuantitySchema = z
  .number()
  .int("La cantidad debe ser un número entero.")
  .min(1, "La cantidad debe ser al menos 1.")
  .max(MAX_CART_QUANTITY, `La cantidad máxima es ${MAX_CART_QUANTITY}.`);

export const cartMutationSchema = z
  .object({
    productId: z.string().uuid("Producto inválido."),
    quantity: cartQuantitySchema,
  })
  .strict();

export const cartItemMutationSchema = z
  .object({
    cartItemId: z.string().uuid("Artículo de carrito inválido."),
    quantity: cartQuantitySchema,
  })
  .strict();

export function calculateItemSubtotal(priceCents: number, quantity: number) {
  if (!Number.isSafeInteger(priceCents) || priceCents < 0) throw new Error("Precio inválido.");
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Cantidad inválida.");
  const subtotal = priceCents * quantity;
  if (!Number.isSafeInteger(subtotal)) throw new Error("Subtotal fuera de rango.");
  return subtotal;
}

export function calculateCartSubtotal(items: Array<{ priceCents: number; quantity: number }>) {
  return items.reduce(
    (total, item) => total + calculateItemSubtotal(item.priceCents, item.quantity),
    0,
  );
}

export function getCartItemState(input: { active: boolean; stock: number; quantity: number }) {
  if (!input.active) return { key: "inactive", label: "No disponible", canModify: false } as const;
  if (input.stock < 1) return { key: "out-of-stock", label: "Agotado", canModify: false } as const;
  if (input.quantity > input.stock)
    return {
      key: "stock-reduced",
      label: `Solo quedan ${input.stock} disponibles`,
      canModify: true,
    } as const;
  return { key: "available", label: "Disponible", canModify: true } as const;
}
