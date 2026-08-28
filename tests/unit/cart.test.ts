import { describe, expect, it } from "vitest";
import {
  calculateCartSubtotal,
  calculateItemSubtotal,
  cartQuantitySchema,
  getCartItemState,
  MAX_CART_QUANTITY,
} from "@/lib/cart";

describe("cart helpers", () => {
  it("CART-U-001: validates integer quantities", () => {
    expect(cartQuantitySchema.safeParse(1).success).toBe(true);
    expect(cartQuantitySchema.safeParse(0).success).toBe(false);
    expect(cartQuantitySchema.safeParse(-1).success).toBe(false);
    expect(cartQuantitySchema.safeParse(1.5).success).toBe(false);
  });
  it("CART-U-002: calculates an item subtotal in cents", () => {
    expect(calculateItemSubtotal(105000, 2)).toBe(210000);
  });
  it("CART-U-003: calculates a cart subtotal in cents", () => {
    expect(
      calculateCartSubtotal([
        { priceCents: 40000, quantity: 2 },
        { priceCents: 99900, quantity: 1 },
      ]),
    ).toBe(179900);
  });
  it("CART-U-004: caps absurd quantities", () => {
    expect(cartQuantitySchema.safeParse(MAX_CART_QUANTITY).success).toBe(true);
    expect(cartQuantitySchema.safeParse(MAX_CART_QUANTITY + 1).success).toBe(false);
  });
  it("CART-U-005: keeps money as safe integer cents", () => {
    expect(() => calculateItemSubtotal(1.5, 1)).toThrow();
    expect(() => calculateItemSubtotal(Number.MAX_SAFE_INTEGER, 2)).toThrow();
  });
  it("CART-U-006: maps inactive and stock states", () => {
    expect(getCartItemState({ active: false, stock: 5, quantity: 1 }).key).toBe("inactive");
    expect(getCartItemState({ active: true, stock: 0, quantity: 1 }).key).toBe("out-of-stock");
    expect(getCartItemState({ active: true, stock: 2, quantity: 3 }).key).toBe("stock-reduced");
  });
});
