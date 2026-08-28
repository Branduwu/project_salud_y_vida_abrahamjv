# Test matrix

| ID               | Módulo      | Escenario                                                              | Tipo        | Prioridad | Automatizado | Resultado                                                   |
| ---------------- | ----------- | ---------------------------------------------------------------------- | ----------- | --------- | ------------ | ----------------------------------------------------------- |
| CORE-001         | Dinero      | Normalizar y calcular subtotales                                       | Unit        | P0        | Sí           | PASS (4 assertions)                                         |
| CORE-002         | Health      | Contrato de salud de API                                               | Integration | P1        | Sí           | PASS                                                        |
| HOME-001         | Home        | Header, contenido, footer y a11y                                       | E2E         | P1        | Sí           | PASS desktop/tablet/mobile                                  |
| DB-001…012       | PostgreSQL  | Esquema, seed, FKs, unicidad y checks                                  | Integration | P0        | Sí           | PASS contra `saludyvida_test`, dos ejecuciones consecutivas |
| AUTH-001…005     | Auth server | Registro, hash, login, sesión y roles                                  | Integration | P0        | Sí           | PASS contra `saludyvida_test`                               |
| AUTH-101…104     | Auth/RBAC   | Protección, registro, login/logout y permisos                          | E2E + axe   | P0        | Sí           | PASS desktop/tablet/mobile                                  |
| CAT-U-001…006    | Catálogo    | Query URL, slugs, precio en centavos y disponibilidad                  | Unit        | P0        | Sí           | PASS                                                        |
| CAT-I-001…014    | Catálogo/DB | Publicación, filtros, orden, detalle, sucursal, SKU y seed idempotente | Integration | P0        | Sí           | PASS contra `saludyvida_test`                               |
| CAT-E2E-001…010  | Catálogo    | Inicio, listado, URL, vacío, detalle, 404 y agotado con axe            | E2E         | P0        | Sí           | PASS desktop/tablet/mobile                                  |
| CART-U-001…006   | Carrito     | Cantidad, subtotales, límite y estado                                  | Unit        | P0        | Sí           | PASS                                                        |
| CART-I-001…020   | Carrito/DB  | Alta, stock, precio, persistencia, ownership y unicidad                | Integration | P0        | Sí           | PASS contra `saludyvida_test`                               |
| CART-E2E-001…010 | Carrito     | Alta, cantidad, eliminación, stock, persistencia y acceso              | E2E         | P0        | Sí           | PASS desktop/tablet/mobile                                  |
| A11Y-CART-001    | Carrito     | Axe en producto, carrito y estado vacío                                | E2E + axe   | P0        | Sí           | PASS desktop/tablet/mobile                                  |
| RESP-CART-001    | Carrito     | Sin overflow en 390, 768 y 1440 px                                     | E2E         | P1        | Sí           | PASS desktop/tablet/mobile                                  |
