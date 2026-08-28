import { describe, expect, it } from "vitest";
import { calculateLineSubtotal, calculateOrderTotal, toCents } from "@/lib/money";

describe("money rules", () => {
  it("normalizes decimal values to integer cents", () => {
    expect(toCents("1999.995")).toBe(200000);
    expect(toCents(0)).toBe(0);
  });

  it("calculates a product subtotal using integer cents", () => {
    expect(calculateLineSubtotal(129900, 2)).toBe(259800);
  });

  it("rejects invalid quantities", () => {
    expect(() => calculateLineSubtotal(129900, 0)).toThrow("quantity");
  });

  it("calculates the sum of validated line subtotals", () => {
    expect(calculateOrderTotal([129900, 25000, 99])).toBe(154999);
  });
});
