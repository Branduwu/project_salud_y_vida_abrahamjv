"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { addCartItem, removeCartItem, updateCartItem } from "@/server/cart-service";

export type CartFormState = { message?: string; success?: boolean };

async function currentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

function numberFromForm(value: FormDataEntryValue | null) {
  return typeof value === "string" && /^\d+$/.test(value) ? Number(value) : Number.NaN;
}

function stateFrom(result: Awaited<ReturnType<typeof addCartItem>>): CartFormState {
  return result.ok
    ? { success: true, message: "Carrito actualizado." }
    : { message: result.message };
}

function refreshCart() {
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/catalogo/[slug]", "page");
  revalidatePath("/carrito");
}

export async function addCartItemAction(
  _: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const userId = await currentUserId();
  if (!userId) return { message: "Inicia sesión para agregar productos al carrito." };
  const result = await addCartItem(userId, {
    productId: formData.get("productId"),
    quantity: numberFromForm(formData.get("quantity")),
  });
  if (result.ok) refreshCart();
  return stateFrom(result);
}

export async function updateCartItemAction(
  _: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const userId = await currentUserId();
  if (!userId) return { message: "Inicia sesión para modificar el carrito." };
  const result = await updateCartItem(userId, {
    cartItemId: formData.get("cartItemId"),
    quantity: numberFromForm(formData.get("quantity")),
  });
  if (result.ok) refreshCart();
  return stateFrom(result);
}

export async function removeCartItemAction(
  _: CartFormState,
  formData: FormData,
): Promise<CartFormState> {
  const userId = await currentUserId();
  if (!userId) return { message: "Inicia sesión para modificar el carrito." };
  const result = await removeCartItem(userId, formData.get("cartItemId"));
  if (result.ok) refreshCart();
  return stateFrom(result);
}
