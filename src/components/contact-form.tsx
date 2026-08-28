"use client";

import { useActionState } from "react";
import { contactAction, type ContactFormState } from "@/app/actions/contact";

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    contactAction,
    {},
  );
  return (
    <form action={formAction} className="contact-form" noValidate>
      <label>
        Nombre
        <input autoComplete="name" name="name" required maxLength={120} />
      </label>
      <label>
        Correo electrónico
        <input autoComplete="email" name="email" type="email" required />
      </label>
      <label>
        Teléfono <span className="field-optional">(opcional)</span>
        <input autoComplete="tel" name="phone" type="tel" maxLength={30} />
      </label>
      <label>
        Mensaje
        <textarea name="message" required rows={5} maxLength={2000} />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="privacy-note">Usaremos tus datos únicamente para responder tu solicitud.</p>
      {state.message ? (
        <p
          className={state.status === "success" ? "form-success" : "form-error"}
          role={state.status === "success" ? "status" : "alert"}
        >
          {state.message}
        </p>
      ) : null}
      <button className="button button-primary" disabled={pending} type="submit">
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
