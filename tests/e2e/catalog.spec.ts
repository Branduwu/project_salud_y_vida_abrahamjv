import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

function trackUnexpectedFailures(
  page: import("@playwright/test").Page,
  options: { allowNotFound?: boolean } = {},
) {
  const consoleErrors: string[] = [];
  const uncaughtExceptions: string[] = [];
  const clientErrors: string[] = [];
  const serverErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => uncaughtExceptions.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.status() < 500 &&
      !(options.allowNotFound && response.status() === 404)
    ) {
      clientErrors.push(`${response.status()} ${response.url()}`);
    }
    if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`);
  });
  return () => {
    const unexpectedConsoleErrors = consoleErrors.filter(
      (message) => !(options.allowNotFound && message.includes("404 (Not Found)")),
    );
    expect(unexpectedConsoleErrors).toEqual([]);
    expect(uncaughtExceptions).toEqual([]);
    expect(clientErrors).toEqual([]);
    expect(serverErrors).toEqual([]);
  };
}

async function expectNoCriticalAxe(page: import("@playwright/test").Page) {
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations.filter((issue) => issue.impact === "critical")).toEqual([]);
}

async function showCatalogFilters(page: import("@playwright/test").Page) {
  if ((page.viewportSize()?.width ?? 0) <= 720) {
    await page.getByRole("button", { name: "Filtrar y ordenar" }).click();
  }
}

test("CAT-E2E-001: Home abre un producto destacado", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/");
  await page
    .getByTestId("home-highlights")
    .getByRole("link", { name: /ver .+/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/catalogo\/.+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoCriticalAxe(page);
  verify();
});

test("CAT-E2E-002: catálogo muestra tarjetas responsive", async ({ page }, testInfo) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { level: 1, name: /armazones/i })).toBeVisible();
  await expect(page.getByRole("region", { name: "Productos" })).toBeVisible();
  await expect(page.getByText("9 productos encontrados")).toBeVisible();
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).resolves.toBe(true);
  await testInfo.attach(`catalog-${testInfo.project.name}.png`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  await expectNoCriticalAxe(page);
  verify();
});

test("CAT-E2E-003: búsqueda devuelve el producto correcto", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo");
  await showCatalogFilters(page);
  await page.getByLabel("Buscar").fill("OGGI");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page).toHaveURL(/q=OGGI/);
  await expect(page.getByRole("link", { name: "OGGI 469", exact: true })).toBeVisible();
  await expect(page.getByText("1 producto encontrado")).toBeVisible();
  await expectNoCriticalAxe(page);
  verify();
});

test("CAT-E2E-004: búsqueda vacía muestra un estado claro", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo?q=sin-resultados");
  await expect(page.getByRole("heading", { name: "No encontramos resultados" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Limpiar filtros" })).toBeVisible();
  await expectNoCriticalAxe(page);
  verify();
});

test("CAT-E2E-005: filtro de categoría es compartible por URL", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo?categoria=armazones-opticos");
  await expect(page.getByLabel("Categoría")).toHaveValue("armazones-opticos");
  await expect(page.getByText("9 productos encontrados")).toBeVisible();
  verify();
});

test("CAT-E2E-006: combina búsqueda y filtro de marca", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo?q=OGGI&marca=OGGI");
  await expect(page.getByRole("link", { name: "OGGI 469", exact: true })).toBeVisible();
  await expect(page.getByText("1 producto encontrado")).toBeVisible();
  verify();
});

test("CAT-E2E-007: ordena por menor precio", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo?sort=price-asc");
  await expect(page.getByRole("link", { name: "OG 377", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "OG 377", exact: true })).toHaveAttribute(
    "href",
    "/catalogo/og-377",
  );
  verify();
});

test("CAT-E2E-008: detalle muestra datos públicos y sucursal", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo/oggi-469");
  await expect(page.getByRole("heading", { level: 1, name: "OGGI 469" })).toBeVisible();
  await expect(page.getByText("Salud y Vida Texcoco")).toBeVisible();
  await expect(page.getByText("SKU")).toBeVisible();
  await expectNoCriticalAxe(page);
  verify();
});

test("CAT-E2E-009: slug inexistente entrega 404", async ({ page }) => {
  const verify = trackUnexpectedFailures(page, { allowNotFound: true });
  await page.goto("/catalogo/producto-que-no-existe");
  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Esta página no existe." })).toBeVisible();
  verify();
});

test("CAT-E2E-010: producto agotado sigue visible y está etiquetado", async ({ page }) => {
  const verify = trackUnexpectedFailures(page);
  await page.goto("/catalogo?disponibilidad=out-of-stock");
  await expect(
    page.getByRole("link", { name: "Muestra sin existencias", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Agotado", { exact: true })).toBeVisible();
  verify();
});
