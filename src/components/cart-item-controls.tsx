"use client";

import { useActionState } from "react";
import { removeCartItemAction, type CartFormState, updateCartItemAction } from "@/app/actions/cart";

export function CartItemControls({
  itemId,
  quantity,
  canModify,
}: {
  itemId: string;
  quantity: number;
  canModify: boolean;
}) {
  const [updateState, updateAction, updating] = useActionState<CartFormState, FormData>(
    updateCartItemAction,
    {},
  );
  const [removeState, removeAction, removing] = useActionState<CartFormState, FormData>(
    removeCartItemAction,
    {},
  );
  return (
    <div className="cart-item-controls">
      <form action={updateAction}>
        <input name="cartItemId" type="hidden" value={itemId} />
        <label>
          Cantidad
          <input
            defaultValue={quantity}
            disabled={!canModify || updating}
            min={1}
            name="quantity"
            type="number"
          />
        </label>
        <button className="button button-secondary" disabled={!canModify || updating} type="submit">
          {updating ? "Actualizando…" : "Actualizar"}
        </button>
      </form>
      <form action={removeAction}>
        <input name="cartItemId" type="hidden" value={itemId} />
        <button className="text-button" disabled={removing} type="submit">
          {removing ? "Eliminando…" : "Eliminar"}
        </button>
      </form>
      <p aria-live="polite" className="form-error">
        {updateState.message && !updateState.success
          ? updateState.message
          : removeState.message && !removeState.success
            ? removeState.message
            : ""}
      </p>
    </div>
  );
}
