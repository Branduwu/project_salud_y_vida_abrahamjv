"use server";

import { parseContactFormData } from "@/lib/contact";
import { createPublicContactMessage } from "@/server/contact-service";

export type ContactFormState = { status?: "success" | "error"; message?: string };

export async function contactAction(
  _: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = parseContactFormData(formData);
  if (!parsed.success)
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const result = await createPublicContactMessage(parsed.data);
  return result.ok
    ? { status: "success", message: "Gracias. Te responderemos por correo." }
    : { status: "error", message: result.message };
}
