import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("HOME-001: carga portada, navegación institucional y footer accesibles", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: /armazones que se sienten/i }),
  ).toBeVisible();
  await expect(page.getByTestId("home-highlights")).toHaveCount(1);
  if ((page.viewportSize()?.width ?? 0) <= 720)
    await page.getByRole("button", { name: "Abrir menú" }).click();
  await expect(page.getByRole("link", { name: "Armazones", exact: true }).last()).toHaveAttribute(
    "href",
    "/catalogo",
  );
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((issue) => issue.impact === "critical")).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
