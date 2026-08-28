import { z } from "zod";

const optionalPhone = z
  .string()
  .trim()
  .max(30, "El teléfono es demasiado largo.")
  .transform((value) => value || undefined)
  .optional();

export const contactMessageSchema = z
  .object({
    name: z.string().trim().min(2, "Escribe tu nombre.").max(120, "El nombre es demasiado largo."),
    email: z.string().trim().toLowerCase().pipe(z.email("Escribe un correo válido.")),
    phone: optionalPhone,
    message: z
      .string()
      .trim()
      .min(10, "Escribe un mensaje de al menos 10 caracteres.")
      .max(2000, "El mensaje no puede superar 2000 caracteres."),
    website: z.string().max(0, "Solicitud rechazada."),
  })
  .strict();

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export function parseContactFormData(formData: FormData) {
  return contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
    website: formData.get("website") ?? "",
  });
}
