import { z } from "zod";
import { calculateCartSubtotal, calculateItemSubtotal } from "@/lib/cart";

export const checkoutInputSchema = z
  .object({
    branchId: z.string().uuid("Sucursal inválida."),
    idempotencyKey: z.string().uuid("Confirmación inválida."),
  })
  .strict();

export function createOrderReference(random = crypto.randomUUID()) {
  return `SV-${random.replaceAll("-", "").slice(0, 16).toUpperCase()}`;
}

export function calculateOrderTotals(items: Array<{ unitPriceCents: number; quantity: number }>) {
  const subtotalCents = calculateCartSubtotal(
    items.map((item) => ({ priceCents: item.unitPriceCents, quantity: item.quantity })),
  );
  return { subtotalCents, totalCents: subtotalCents };
}

export { calculateItemSubtotal };
