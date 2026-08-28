import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { contactMessageSchema, type ContactMessageInput } from "@/lib/contact";

const recentMessages = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export type ContactResult = { ok: true } | { ok: false; message: string };

export async function createPublicContactMessage(input: unknown): Promise<ContactResult> {
  const parsed = contactMessageSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { website, ...message } = parsed.data;
  if (website) return { ok: false, message: "No se pudo enviar la solicitud." };
  const key = message.email;
  const lastSentAt = recentMessages.get(key);
  if (lastSentAt && Date.now() - lastSentAt < RATE_LIMIT_MS) {
    return { ok: false, message: "Espera un momento antes de enviar otro mensaje." };
  }
  try {
    await db.insert(contactMessages).values(message);
    recentMessages.set(key, Date.now());
    return { ok: true };
  } catch {
    return { ok: false, message: "No pudimos enviar tu solicitud. Inténtalo nuevamente." };
  }
}

export function contactMessageFromForm(input: Omit<ContactMessageInput, "website">) {
  return { ...input, website: "" };
}
