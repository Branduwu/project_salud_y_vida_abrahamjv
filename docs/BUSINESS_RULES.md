# Reglas de negocio

## Products

### RULE-PROD-001

- Description: el catálogo actual representa armazones; no incluye graduación, lentes graduados ni tratamientos.
- Reason: los datos legacy sólo aportan armazón, marca, SKU, precio e inventario.
- Current implementation: precio y detalle no crean configuraciones ópticas.
- Status: APPROVED.

### RULE-PROD-002

- Description: variantes de color, tamaño y material requieren un modelo explícito antes de publicarse.
- Reason: el stock debe pertenecer a la variante real.
- Current implementation: no hay variantes.
- Status: NEEDS DECISION.

## Inventory

### RULE-INV-001

- Description: inventario significa cantidad disponible por producto y sucursal activa, nunca negativa.
- Reason: permite comunicar disponibilidad sin exponer cifras al público.
- Current implementation: `inventory.quantity >= 0` y disponibilidad agregada en catálogo/carrito.
- Status: APPROVED.

### RULE-INV-002

- Description: carrito no reserva inventario.
- Reason: la reserva o descuento al confirmar depende de la operación comercial.
- Current implementation: validación al agregar y al editar; no decrementa.
- Status: APPROVED.

### RULE-INV-003

- Description: confirmar solicitud debe reservar o descontar inventario de una sucursal.
- Reason: impacta cancelaciones, atención en sucursal y pagos.
- Current implementation: infraestructura transaccional de Fase 6 pausada.
- Status: NEEDS DECISION.

## Cart

### RULE-CART-001

- Description: un usuario autenticado tiene un carrito activo persistente; cada producto aparece una sola vez.
- Reason: evita duplicados y conserva historial al cerrar un carrito futuro.
- Current implementation: índice parcial de carrito activo y unicidad cart/product.
- Status: APPROVED.

### RULE-CART-002

- Description: precio, estado y stock son autoridad de PostgreSQL.
- Reason: cliente no es fuente confiable.
- Current implementation: servicio server-side reconsulta producto e inventario.
- Status: APPROVED.

## Checkout

### RULE-CHECKOUT-001

- Description: checkout debe seleccionar una sucursal capaz de surtir todos los artículos.
- Reason: el MVP no divide un pedido entre sucursales.
- Current implementation: estructura transaccional preparada y pausada.
- Status: PROPOSED.

### RULE-CHECKOUT-002

- Description: sin pago integrado, la interfaz no debe afirmar compra o pago completados.
- Reason: transparencia comercial.
- Current implementation: checkout funcional no está expuesto.
- Status: APPROVED.

## Orders

### RULE-ORDER-001

- Description: un pedido debe mantener snapshots de nombre, SKU y precio.
- Reason: el historial no puede cambiar cuando cambia el catálogo.
- Current implementation: migración 0004 agrega SKU y referencias.
- Status: APPROVED.

### RULE-ORDER-002

- Description: el lifecycle comercial y la acción de inventario al confirmar se definen antes de habilitar pedidos.
- Reason: cancelación y pago dependen de esa decisión.
- Current implementation: Fase 6 pausada.
- Status: NEEDS DECISION.

## Appointments

### RULE-APPT-001

- Description: una cita requiere sucursal, motivo, duración y disponibilidad operativa.
- Reason: fecha/hora aisladas no representan atención óptica.
- Current implementation: esquema técnico base existe; UX no está publicada.
- Status: PROPOSED.

## Users

### RULE-USER-001

- Description: nombre, email y contraseña son suficientes para cuenta inicial; teléfono sólo si una operación concreta lo requiere.
- Reason: minimización de datos.
- Current implementation: teléfono opcional; direcciones no participan en el MVP.
- Status: APPROVED.

### RULE-USER-002

- Description: recetas, graduación y datos de salud visual pertenecen a un dominio sensible separado.
- Reason: no deben mezclarse casualmente con perfil de usuario.
- Current implementation: no se almacenan.
- Status: APPROVED.
