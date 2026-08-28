export const catalogSortValues = ["relevance", "price-asc", "price-desc", "name"] as const;
export type CatalogSort = (typeof catalogSortValues)[number];

export const catalogAvailabilityValues = ["all", "in-stock", "out-of-stock"] as const;
export type CatalogAvailability = (typeof catalogAvailabilityValues)[number];

export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export type CatalogQuery = {
  q: string;
  category: string | null;
  brand: string | null;
  gender: string | null;
  availability: CatalogAvailability;
  sort: CatalogSort;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function normalizeText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function parseSlugFilter(value: string, maxLength = 100) {
  const normalized = normalizeText(value, maxLength);
  return /^[\p{L}\p{N}-]+$/u.test(normalized) ? normalized : null;
}

function parseOptionFilter(value: string, maxLength = 100) {
  const normalized = normalizeText(value, maxLength);
  return /^[\p{L}\p{N} .-]+$/u.test(normalized) ? normalized : null;
}

export function parseCatalogQuery(searchParams: CatalogSearchParams): CatalogQuery {
  const sort = getSingleValue(searchParams.sort);
  const availability = getSingleValue(searchParams.disponibilidad);

  return {
    q: normalizeText(getSingleValue(searchParams.q), 80),
    category: parseSlugFilter(getSingleValue(searchParams.categoria), 120),
    brand: parseOptionFilter(getSingleValue(searchParams.marca)),
    gender: parseOptionFilter(getSingleValue(searchParams.genero), 32),
    availability: catalogAvailabilityValues.includes(availability as CatalogAvailability)
      ? (availability as CatalogAvailability)
      : "all",
    sort: catalogSortValues.includes(sort as CatalogSort) ? (sort as CatalogSort) : "relevance",
  };
}

export function formatPrice(cents: number) {
  if (!Number.isInteger(cents) || cents < 0)
    throw new Error("price must be a non-negative integer in cents");
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
}

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

export function createUniqueSlug(value: string, existing: ReadonlySet<string>) {
  const base = createSlug(value) || "producto";
  let candidate = base;
  let suffix = 2;
  while (existing.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

export function getAvailability(totalQuantity: number) {
  if (!Number.isInteger(totalQuantity) || totalQuantity < 0)
    throw new Error("inventory quantity must be a non-negative integer");
  if (totalQuantity === 0) return { key: "out-of-stock" as const, label: "Agotado" };
  if (totalQuantity <= 3) return { key: "low-stock" as const, label: "Pocas unidades" };
  return { key: "in-stock" as const, label: "En stock" };
}
