"use client";

import { useActionState } from "react";
import { addCartItemAction, type CartFormState } from "@/app/actions/cart";

export function AddToCartForm({ productId, disabled }: { productId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState<CartFormState, FormData>(addCartItemAction, {});
  return (
    <form action={action} className="add-to-cart-form">
      <input name="productId" type="hidden" value={productId} />
      <label>
        Cantidad
        <input
          defaultValue={1}
          disabled={disabled || pending}
          min={1}
          name="quantity"
          type="number"
        />
      </label>
      <button className="button button-primary" disabled={disabled || pending} type="submit">
        {pending ? "Agregando…" : disabled ? "No disponible" : "Agregar al carrito"}
      </button>
      <p aria-live="polite" className={state.success ? "form-success" : "form-error"}>
        {state.message}
      </p>
    </form>
  );
}
