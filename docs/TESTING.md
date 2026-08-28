# Testing

Las pruebas se escriben junto con cada feature. No se permiten sleeps para sincronización ni dependencias entre tests.

- `npm run test:unit`: lógica aislada.
- `npm run test:integration`: contratos contra PostgreSQL real usando `.env.test`; los archivos se ejecutan en serie porque cada caso reinicializa su base aislada.
- `npm run test:e2e`: Playwright en desktop, tablet y móvil.
- `npm run test:coverage`: cobertura de reglas de negocio.

Playwright conserva trace, captura y video al fallar. Los selectores priorizan roles, labels y texto; `data-testid` se reserva para casos estables sin alternativa semántica. La matriz incluye desktop, tablet y móvil, y axe sobre login, registro, perfil y administración.

Carrito añade CART-U-001 a CART-U-006 y CART-I-001 a CART-I-020, incluyendo ownership, entrada manipulada, precio cambiado y reducción de inventario contra PostgreSQL real.

El catálogo añade CAT-U-001 a CAT-U-006, CAT-I-001 a CAT-I-014 y CAT-E2E-001 a CAT-E2E-010. La E2E cubre listado, filtros por URL, búsqueda vacía, detalle, 404 y producto agotado en los tres viewports; axe se ejecuta en inicio, catálogo, resultado vacío y detalle. También intercepta errores de consola y respuestas HTTP 5xx en los recorridos principales.
