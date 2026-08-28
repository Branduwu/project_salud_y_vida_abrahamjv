import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Salud y Vida | Óptica",
    template: "%s | Salud y Vida",
  },
  description: "Óptica moderna: armazones, atención visual y citas en línea.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es-MX">
      <body>{children}</body>
    </html>
  );
}
