# Base de datos

La base de datos objetivo es PostgreSQL. Drizzle gestionará el esquema y migraciones desde `src/db/schema.ts` hacia `drizzle/`.

La configuración local se define con `DATABASE_URL` en `.env`; no se versionan credenciales reales. `.env.test` apunta exclusivamente a `saludyvida_test`. Las tablas aprobadas son: usuarios/roles/sesiones/direcciones, productos/categorías/imágenes/inventario/sucursales, carritos/pedidos, citas, favoritos y mensajes de contacto.

Para iniciar desde cero: `docker compose up -d postgres`, `npm run db:migrate` y `npm run db:seed`. El contenedor se expone localmente en `5433` para no interferir con un PostgreSQL existente en `5432`; el script de inicio crea también `saludyvida_test` en un volumen nuevo. La migración inicial está en `drizzle/`; los seeds crean únicamente identidades y productos ficticios. Los tests de integración usan una base aislada y datos reproducibles: `npm run db:test:migrate`, `npm run db:test:reset` y `npm run test:integration`.

La migración, el seed y la verificación física se ejecutaron contra PostgreSQL 16 local. La suite de integración comprueba doce restricciones de esquema y cinco contratos de autenticación contra la base de pruebas.

## Carrito persistente

La migración `0003_tough_bloodstorm` agrega `carts.status` (`active`/`closed`), sustituye la unicidad absoluta de usuario por un índice único parcial para un único carrito activo y conserva la unicidad `(cart_id, product_id)`. `cart_items` guarda sólo `product_id` y `quantity`; el precio actual se toma de `products.price_cents` en cada lectura. No se reserva ni descuenta inventario al añadir: se valida el total de sucursales activas en ese momento y se volverá a validar en checkout.

## Catálogo público

La migración `0002_wonderful_diamondback` añade la unicidad de posición por producto en `product_images`, permitiendo varias imágenes ordenadas sin duplicados y manteniendo la migración no destructiva. El precio se almacena siempre como entero `price_cents`; el formateo MXN ocurre únicamente en la capa de presentación. No existe un campo de descuento porque el legado no aportó precio anterior comprobable.

El seed reproducible carga una categoría, una sucursal, nueve productos activos, ocho imágenes y nueve registros de inventario: ocho artículos verificados del legado y un fixture agotado para pruebas. Los productos inactivos no se incluyen en las consultas públicas. La disponibilidad se deriva de inventario activo por sucursal y se muestra como estado, no como cantidad.
