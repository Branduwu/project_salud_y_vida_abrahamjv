export function toCents(value: number | string): number {
  const parsed = typeof value === "string" ? Number(value.trim()) : value;
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("amount must be a non-negative finite number");
  }

  return Math.round(parsed * 100);
}

export function calculateLineSubtotal(unitPriceCents: number, quantity: number): number {
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new Error("unit price must be a non-negative integer in cents");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("quantity must be a positive integer");
  }

  return unitPriceCents * quantity;
}

export function calculateOrderTotal(lineSubtotals: readonly number[]): number {
  if (lineSubtotals.some((subtotal) => !Number.isInteger(subtotal) || subtotal < 0)) {
    throw new Error("line subtotals must be non-negative integers in cents");
  }

  return lineSubtotals.reduce((total, subtotal) => total + subtotal, 0);
}
