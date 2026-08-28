import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

async function logout(page: import("@playwright/test").Page) {
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
  }
  await page.getByRole("button", { name: "Salir" }).click();
}

test("AUTH-101: protege perfil y muestra formularios accesibles", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Ingresa a tu cuenta" })).toBeVisible();
  await expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (issue) => issue.impact === "critical",
    ),
  ).toEqual([]);

  await page.goto("/registro");
  await expect(page.getByRole("heading", { name: "Crea tu cuenta" })).toBeVisible();
  await expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (issue) => issue.impact === "critical",
    ),
  ).toEqual([]);
});

test("AUTH-102: registro, sesión HttpOnly y logout", async ({ page }, testInfo) => {
  const email = `e2e-${testInfo.project.name}-${Date.now()}@saludyvida.test`;
  await page.goto("/registro");
  await page.getByLabel("Nombre completo").fill("Cuenta E2E");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña").fill("CorrectHorseBattery1!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/perfil$/);
  await expect(page.getByRole("heading", { name: "Hola, Cuenta E2E" })).toBeVisible();
  expect(
    (await page.context().cookies()).find((cookie) => cookie.name === "salud_y_vida_session")
      ?.httpOnly,
  ).toBe(true);
  await expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (issue) => issue.impact === "critical",
    ),
  ).toEqual([]);

  await logout(page);
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/login$/);
});

test("AUTH-103: credenciales inválidas no crean sesión", async ({ page }) => {
  await login(page, "admin.demo@saludyvida.test", "incorrecta");
  await expect(page.getByText("Correo o contraseña inválidos.", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("AUTH-104: RBAC bloquea a USER y autoriza a ADMIN", async ({ page }) => {
  await login(page, "user.demo@saludyvida.test", "DemoOnly!2026");
  await expect(page).toHaveURL(/\/perfil$/);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/perfil$/);

  await logout(page);
  await login(page, "admin.demo@saludyvida.test", "DemoOnly!2026");
  await expect(page).toHaveURL(/\/perfil$/);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Panel de administración" })).toBeVisible();
  await expect(
    (await new AxeBuilder({ page }).analyze()).violations.filter(
      (issue) => issue.impact === "critical",
    ),
  ).toEqual([]);
});
