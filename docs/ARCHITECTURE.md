# Arquitectura

Salud y Vida se reconstruye como una aplicación Next.js de un solo repositorio. Las rutas, componentes y API viven en `src/app`; las reglas de negocio vivirán en `src/server`; y el acceso PostgreSQL se concentrará en `src/db`.

Se eligió **Drizzle ORM** por su enfoque SQL-first, tipos explícitos y migraciones transparentes. El proyecto parte de cero en backend, por lo que no hay una capa ORM previa que conservar.

```text
Browser → Next.js UI → Server routes/actions → Zod + business rules → Drizzle → PostgreSQL
                         ↑
                 auth + role authorization
```

`legacy/vite-frontend` conserva el código antiguo como referencia de contenido y activos; no participa en el runtime de la aplicación nueva.

## Carrito

`src/server/cart-service.ts` concentra la creación, modificación y resumen de carritos. Las Server Actions vuelven a autenticar al usuario y sólo entregan identificadores y cantidad validada; el servicio vuelve a leer producto, precio, estado e inventario. La vista carga artículos, imágenes e inventario en lotes, sin N+1. El carrito suma el inventario de sucursales activas y no selecciona sucursal en Fase 5; **carrito no equivale a reserva de inventario** y pedidos deberá revalidar el stock definitivo.

## Autenticación y autorización

Registro y login se ejecutan mediante Server Actions. Las contraseñas se almacenan con bcrypt; cada sesión se registra en PostgreSQL con un token aleatorio que sólo se conserva como hash. El navegador recibe una cookie firmada `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Las rutas `/perfil` y `/admin` verifican la sesión en servidor; `/admin` exige el rol `ADMIN` en `user_roles`.

## Catálogo público

Las páginas `/` y `/catalogo` son Server Components. `src/server/catalog-repository.ts` concentra las consultas públicas y `src/lib/catalog.ts` normaliza parámetros URL, precio y disponibilidad; los componentes `ProductCard` y `CatalogFilters` sólo reciben datos ya preparados. La consulta lista productos, después obtiene imágenes e inventario en dos consultas por lote, evitando N+1. Los filtros usan `GET`, por lo que no requieren estado de cliente y su URL se puede compartir.
