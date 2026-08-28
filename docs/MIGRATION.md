# Migration log

## Fase 0 — Baseline

- Legado preservado en `legacy/vite-frontend`.
- Assets, contenido de productos, branding, sucursal y equipo: **pendientes de clasificación individual**.
- Video no relacionado y assets duplicados: **candidatos a eliminación, no eliminados**.
- Vulnerabilidades heredadas documentadas antes de sustituir el runtime Vite.

## Fase 1 — Arquitectura

| OLD                           | NEW                           | STATUS                 |
| ----------------------------- | ----------------------------- | ---------------------- |
| Vite + JavaScript             | Next.js + TypeScript          | Reemplazado            |
| `localStorage.usuarios`       | `users` PostgreSQL            | Pendiente de migración |
| `localStorage.citas`          | `appointments` PostgreSQL     | Pendiente de migración |
| `localStorage.items`          | products/categories/inventory | Pendiente de migración |
| Navbar/footer por `innerHTML` | Componentes React             | Migrado parcialmente   |

## Fase 2 — Persistencia

| OLD                              | NEW                                                     | STATUS                           |
| -------------------------------- | ------------------------------------------------------- | -------------------------------- |
| Arrays de productos hardcodeados | `products`, `categories`, `product_images`, `inventory` | Migrado al esquema y seed demo   |
| Datos de sucursal embebidos      | `branches`                                              | Migrado al esquema y seed demo   |
| Citas locales                    | `appointments` con slot único por sucursal              | Migrado al esquema; UI pendiente |

La migración y el seed se verificaron físicamente en PostgreSQL 16. Las pruebas DB-001 a DB-012 se ejecutaron dos veces de forma consecutiva sobre `saludyvida_test`.

## Fase 3 — Autenticación y RBAC

| OLD                           | NEW                                                                | STATUS  |
| ----------------------------- | ------------------------------------------------------------------ | ------- |
| Contraseñas en `localStorage` | bcrypt en PostgreSQL                                               | Migrado |
| Estado de login local         | sesión PostgreSQL + cookie firmada `HttpOnly`                      | Migrado |
| Admin sólo visible en UI      | autorización de servidor para `/perfil` y `/admin` por rol `ADMIN` | Migrado |

Registro, login, logout y controles RBAC fueron validados en integración y E2E con axe en desktop, tablet y móvil.

## Fase 4 — Catálogo

| Legado                                                    | Destino nuevo                                                       | Decisión                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `localStorage.items`                                      | PostgreSQL: `products`, `categories`, `product_images`, `inventory` | El catálogo público consulta datos persistidos en servidor.                                   |
| 16 objetos de `catalogo.js`                               | 8 productos publicados                                              | Se reutilizaron únicamente los registros 01–08: sus SKU y metadatos eran coherentes y únicos. |
| Registros 09–16 con SKU/modelo duplicado o contradictorio | No migrados                                                         | Se descartaron para no publicar inventario de procedencia ambigua.                            |
| Stock embebido en JavaScript                              | `inventory` por sucursal                                            | La UI expone disponible, pocas existencias o agotado; nunca cantidades.                       |
| Campo `descuento: 5` sin precio anterior verificable      | No migrado                                                          | No se inventaron promociones ni precios tachados.                                             |
| Imágenes de lentes 01–08                                  | `public/images/products`                                            | Reutilizadas y servidas por `next/image`; el resto no entra al runtime.                       |

El seed también incluye `Muestra sin existencias`, un fixture no legado, marcado como tal y sin imagen, para cubrir el estado público de producto agotado.

## Fase 5 — Carrito

| Modelo previo                          | Cambio                                | Motivo                                                                        |
| -------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| Un carrito único histórico por usuario | Un único carrito `active` por usuario | Permite cerrar el carrito en una fase futura sin romper la integridad actual. |
| `cart_items` sin precio                | Se conserva sin precio                | El resumen usa siempre el precio actual validado de `products`.               |
| Inventario por sucursal                | Stock total de sucursales activas     | MVP sin selector de sucursal; no hay reserva de inventario.                   |
