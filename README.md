# Salud y Vida

Aplicación full-stack para una óptica, reconstruida desde el prototipo Vite legado que se conserva en `legacy/vite-frontend`.

## Stack

- Next.js + TypeScript.
- PostgreSQL + Drizzle ORM.
- Validación server-side con Zod.
- Vitest, Playwright y axe para calidad continua.

## Inicio rápido

1. Copia `.env.example` como `.env` y `.env.test.example` como `.env.test`.
2. `npm install`
3. `npm run db:generate`
4. `npm run db:migrate`
5. `npm run db:seed`
6. `npm run dev`

Docker expone PostgreSQL local en `localhost:5433`; las pruebas usan exclusivamente `saludyvida_test`.

Credenciales demo (sólo local): `admin.demo@saludyvida.test` y `user.demo@saludyvida.test`, ambas con contraseña `DemoOnly!2026`.

Consulta [arquitectura](docs/ARCHITECTURE.md), [base de datos](docs/DATABASE.md), [testing](docs/TESTING.md) y [migración](docs/MIGRATION.md).

## Catálogo público

`/catalogo` se resuelve en servidor desde PostgreSQL. Sus filtros son reproducibles por URL: `q`, `categoria`, `marca`, `genero`, `disponibilidad` (`all`, `in-stock`, `out-of-stock`) y `orden` (`relevance`, `price-asc`, `price-desc`, `name`). Cada producto publicado tiene una ruta `/catalogo/[slug]` con imágenes, ficha y sucursales con disponibilidad, sin exponer cantidades.

La trazabilidad de activos reutilizados está en [docs/ASSETS.md](docs/ASSETS.md).

## Carrito

`/carrito` requiere sesión y persiste en PostgreSQL. El navegador sólo solicita producto y cantidad: precio, estado y stock se vuelven a consultar en el servidor. Un usuario tiene a lo sumo un carrito `active`; los artículos guardan cantidad, no precio. El carrito no reserva inventario: el stock se validará nuevamente al crear un pedido.

## Calidad

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

No se considera terminada una funcionalidad sin validación server-side, pruebas pertinentes, accesibilidad básica y build verde.
