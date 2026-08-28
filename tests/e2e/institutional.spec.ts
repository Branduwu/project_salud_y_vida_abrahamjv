import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function expectNoCriticalAxe(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((issue) => issue.impact === "critical")).toEqual([]);
}

test("INST-E2E-001: Home abre Nosotros con contenido institucional", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Conoce Salud y Vida/i }).click();
  await expect(page).toHaveURL(/\/nosotros$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoCriticalAxe(page);
});

test("INST-E2E-002: sucursales muestra datos obtenidos de la base", async ({ page }) => {
  await page.goto("/sucursales");
  await expect(page.getByText("Salud y Vida Texcoco")).toBeVisible();
  await expect(page.getByText(/San Mateo, Texcoco de Mora/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Cómo llegar" })).toHaveAttribute("target", "_blank");
  await expectNoCriticalAxe(page);
});

test("INST-E2E-003/004: contacto persiste solicitudes válidas y rechaza inválidas", async ({
  page,
}, testInfo) => {
  await page.goto("/contacto");
  await page.getByLabel("Nombre").fill("Contacto E2E");
  await page
    .getByLabel("Correo electrónico")
    .fill(`contact-${testInfo.project.name}-${Date.now()}@saludyvida.test`);
  await page.getByLabel("Mensaje").fill("Quiero consultar disponibilidad de armazones.");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByRole("status")).toContainText("Gracias");
  await page.goto("/contacto");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expectNoCriticalAxe(page);
});

test("INST-E2E-005: el menú móvil expone navegación institucional", async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) > 720, "Sólo aplica a móvil");
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("link", { name: "Nosotros" }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sucursales" }).last()).toBeVisible();
  await expect(page.getByRole("link", { name: "Contacto" }).last()).toBeVisible();
  await page.getByRole("link", { name: "Atención visual" }).last().click();
  await expect(page).toHaveURL(/\/atencion-visual$/);
});
