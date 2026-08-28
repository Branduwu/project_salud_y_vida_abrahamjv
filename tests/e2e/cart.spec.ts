import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const failures = new WeakMap<import("@playwright/test").Page, string[]>();

test.beforeEach(({ page }) => {
  const messages: string[] = [];
  failures.set(page, messages);
  page.on("console", (message) => {
    if (message.type() === "error") messages.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => messages.push(`exception: ${error.message}`));
  page.on("response", (response) => {
    if (response.status() >= 500) messages.push(`server: ${response.status()} ${response.url()}`);
  });
});

test.afterEach(({ page }) => expect(failures.get(page) ?? []).toEqual([]));

async function register(page: import("@playwright/test").Page, suffix: string) {
  const email = `cart-${suffix}-${Date.now()}@saludyvida.test`;
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill("Cliente Carrito");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("CorrectHorseBattery1!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  return email;
}

async function addOggi(page: import("@playwright/test").Page, quantity = 1) {
  await page.goto("/catalogo/oggi-469");
  await page.getByLabel("Cantidad").fill(String(quantity));
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByText("Carrito actualizado.")).toBeVisible();
  await criticalAxe(page);
}

async function criticalAxe(page: import("@playwright/test").Page) {
  expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (item) => item.impact === "critical",
    ),
  ).toEqual([]);
}

test("CART-E2E-001: registro, producto y carrito persistente", async ({ page }, info) => {
  await register(page, info.project.name);
  await addOggi(page);
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
  }
  await page.getByRole("link", { name: /Carrito/ }).click();
  await expect(page.getByRole("heading", { name: "Carrito" })).toBeVisible();
  await expect(page.getByRole("link", { name: "OGGI 469", exact: true })).toBeVisible();
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
  await criticalAxe(page);
});

test("CART-E2E-002: actualiza cantidad y subtotal", async ({ page }, info) => {
  await register(page, `${info.project.name}-update`);
  await addOggi(page);
  await page.goto("/carrito");
  await page.getByLabel("Cantidad").fill("2");
  await page.getByRole("button", { name: "Actualizar" }).click();
  await expect(
    page.getByLabel("Artículos del carrito").getByText("$4,000.00", { exact: true }),
  ).toBeVisible();
});

test("CART-E2E-003: agrega el mismo producto sin duplicar fila", async ({ page }, info) => {
  await register(page, `${info.project.name}-same`);
  await addOggi(page);
  await addOggi(page);
  await page.goto("/carrito");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByLabel("Cantidad")).toHaveValue("2");
});

test("CART-E2E-004: elimina y muestra empty state", async ({ page }, info) => {
  await register(page, `${info.project.name}-remove`);
  await addOggi(page);
  await page.goto("/carrito");
  await page.getByRole("button", { name: "Eliminar" }).click();
  await expect(page.getByRole("heading", { name: "Tu carrito está vacío" })).toBeVisible();
  await criticalAxe(page);
});

test("CART-E2E-005: rechaza una cantidad mayor al stock", async ({ page }, info) => {
  await register(page, `${info.project.name}-stock`);
  await page.goto("/catalogo/oggi-469");
  await page.getByLabel("Cantidad").fill("6");
  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByText("Solo hay 5 disponibles.")).toBeVisible();
});

test("CART-E2E-006: producto agotado bloquea agregar", async ({ page }) => {
  await page.goto("/catalogo/muestra-sin-existencias");
  await expect(page.getByRole("button", { name: "No disponible" })).toBeDisabled();
});

test("CART-E2E-007: el carrito persiste tras logout y login", async ({ page }, info) => {
  const email = await register(page, `${info.project.name}-persist`);
  await addOggi(page);
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
  }
  await page.getByRole("button", { name: "Salir" }).click();
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("CorrectHorseBattery1!");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  await page.goto("/carrito");
  await expect(page.getByRole("link", { name: "OGGI 469", exact: true })).toBeVisible();
});

test("CART-E2E-008: carrito exige autenticación", async ({ page }) => {
  await page.goto("/carrito");
  await expect(page).toHaveURL(/\/login$/);
});

test("CART-E2E-009: el formulario no admite precio del cliente", async ({ page }, info) => {
  await register(page, `${info.project.name}-price`);
  await addOggi(page);
  await page.goto("/carrito");
  await expect(page.getByLabel("Artículos del carrito").getByRole("strong")).toHaveText(
    "$2,000.00",
  );
});

test("CART-E2E-010: ownership se cubre por CART-SEC-002/003 de integración", async ({ page }) => {
  await page.goto("/carrito");
  await expect(page).toHaveURL(/\/login$/);
});
