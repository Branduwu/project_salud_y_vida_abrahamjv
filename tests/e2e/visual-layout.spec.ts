import { expect, test } from "@playwright/test";

test("VISUAL-002: navegación y filtros se adaptan sin desbordamiento", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
  await page.goto("/catalogo");
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("link", { name: "Armazones", exact: true }).last()).toBeVisible();
    await page.getByRole("button", { name: "Cerrar menú" }).click();
    await page.getByRole("button", { name: "Filtrar y ordenar" }).click();
  }
  await expect(page.getByLabel("Buscar")).toBeVisible();
});
