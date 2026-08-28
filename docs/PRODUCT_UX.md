# Producto, UX y dirección de diseño

## Definición del producto

Salud y Vida es una óptica local con catálogo de armazones, atención visual y sucursal física. No es únicamente un marketplace: el producto debe ayudar a descubrir armazones, conocer disponibilidad, solicitar orientación y, cuando la operación lo apruebe, confirmar una solicitud de compra o recolección.

Los usuarios principales son personas que buscan armazones, clientes que necesitan atención visual y personal de la óptica. La experiencia debe comunicar con claridad qué se compra: los datos actuales representan **armazones**, no graduación, lentes graduados, tratamientos ni una receta.

## Auditoría de la experiencia actual

| Superficie     | Estado actual  | Diagnóstico                                                                                                              |
| -------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Home           | Funcional      | Correcta técnicamente, pero su propuesta de óptica/atención visual no tiene suficiente contenido ni jerarquía comercial. |
| Catálogo       | Funcional      | Datos y filtros reales; el formulario domina en móvil y las tarjetas desperdician altura con imágenes vacías.            |
| Producto       | Funcional      | Tiene datos, disponibilidad y carrito; falta comunicar de forma visible que el precio corresponde al armazón.            |
| Login/registro | Funcional      | Accesibles y claros, pero con una apariencia de formulario utilitario más que área de cliente.                           |
| Perfil         | Base funcional | Actualmente es una pantalla técnica; debe evolucionar a área de cliente sólo cuando haya módulos reales.                 |
| Carrito        | Funcional      | Reglas server-side sólidas y estados claros; necesita una jerarquía de resumen más comercial y táctil.                   |
| Checkout       | Pausado        | Sólo existe preparación técnica de Fase 6; no debe exponerse hasta resolver reglas comerciales.                          |
| Header/footer  | Funcionales    | Evitan enlaces rotos, pero tienen poca identidad, información local y orientación de producto.                           |

### Fortalezas que se conservan

- Datos de catálogo, autenticación y carrito provienen del servidor.
- Estados de disponibilidad, empty states y validación tienen una base accesible.
- El layout ya responde en móvil, tableta y escritorio sin overflow probado.

### Problemas visuales observados

- Hero y título de catálogo consumen demasiado espacio relativo al contenido comercial.
- Filtros ocupan una columna extensa en móvil y no priorizan búsqueda/categoría.
- Product cards tienen información repetida, cuerpos desiguales y placeholders visualmente débiles.
- La escala, bordes y espaciado se sienten de prototipo genérico en lugar de óptica contemporánea.
- Header/footer no explican atención visual, sucursal o siguiente acción.

### Problemas UX y de producto observados

- El precio no comunica inequívocamente que corresponde al armazón.
- Carrito permite cantidades técnicas, pero falta decisión comercial sobre compras múltiples del mismo armazón.
- La selección de sucursal pertenece a la futura confirmación; no debe adelantarse sin decidir reserva versus descuento de stock.
- Perfil, citas, sucursales, contacto y recuperación no deben figurar como navegación hasta tener alcance aprobado.

## MVP redefinido

| Prioridad        | Capacidades                                                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Core MVP         | Inicio, catálogo de armazones, detalle honesto, búsqueda/filtros, disponibilidad, cuenta, carrito y sucursales.                     |
| Secondary        | Solicitud de compra/recolección, historial de solicitudes, citas de atención visual y administración de inventario.                 |
| Future           | Configuración de lentes graduados, variantes, receta, wishlist, direcciones/delivery, pagos y personalización.                      |
| Remove por ahora | Promociones inventadas, checkout que parezca pago, enlaces a secciones inexistentes y CRUDs administrativos sin operación definida. |

## Arquitectura de información

- Inicio: propuesta de valor, catálogo destacado, atención visual, sucursal y acciones claras.
- Lentes: catálogo y filtros.
- Detalle: armazón, disponibilidad, precio de armazón y acción apropiada.
- Carrito: selección de armazones y resumen provisional.
- Cuenta: datos mínimos, pedidos cuando estén aprobados y citas cuando existan.

La navegación no enlaza a páginas inexistentes. Citas, sucursales y nosotros se muestran sólo cuando su contenido y reglas sean aprobados.

## Inventario institucional legacy — Fase 5.6

| Elemento legacy   | Contenido encontrado                                        | ¿Sigue siendo útil?               | ¿Dato verificable?                            | Destino nuevo                          | Estado                       |
| ----------------- | ----------------------------------------------------------- | --------------------------------- | --------------------------------------------- | -------------------------------------- | ---------------------------- |
| Sucursal          | Dirección y una sede en Texcoco                             | Sí                                | Dirección presente en `branches`              | `/sucursales`                          | VERIFIED CURRENT (fuente DB) |
| Horarios          | Lunes-viernes y sábado en legacy/seed                       | Sí                                | Requiere confirmación comercial externa       | Documentación, no publicado            | LEGACY — NEEDS CONFIRMATION  |
| Teléfono          | Número mostrado en contacto legacy y seed                   | Sí                                | No hay confirmación externa                   | Documentación, no publicado            | LEGACY — NEEDS CONFIRMATION  |
| Redes             | Nombres e iconos, destinos `#`                              | No sin URL real                   | No                                            | No publicar                            | REMOVE                       |
| Contacto          | Formulario nombre/email/teléfono/mensaje                    | Sí                                | El flujo anterior era externo e inconsistente | `/contacto` + `contact_messages`       | MIGRATED / IMPROVED          |
| Nosotros          | Óptica local en Texcoco, selección y atención personalizada | Sí, con copy prudente             | Sólo identidad local y catálogo actual        | `/nosotros`                            | MIGRATED                     |
| Equipo            | Diez perfiles y biografías personales                       | No automáticamente                | Vigencia y consentimiento no confirmables     | No publicar                            | CONTENT PENDING VERIFICATION |
| Servicios médicos | Optometría, examen y atención oftalmológica                 | No sin confirmación operativa     | No                                            | No publicar como servicio              | REMOVE                       |
| Agenda de citas   | Formulario localStorage                                     | Idea futura                       | Operación no definida                         | No publicar; contacto como alternativa | NOT MIGRATED YET             |
| Mapa Leaflet      | Coordenadas en HTML legacy                                  | Sí como idea, no como dependencia | No existe coordenada en `branches`            | Enlace seguro “Cómo llegar”            | REPLACED                     |

### Datos institucionales centralizados

La dirección publicada se lee desde `branches`. Teléfono y horario existen en el modelo, pero se mantienen fuera de la interfaz pública hasta que negocio confirme que siguen vigentes. El formulario de contacto guarda nombre, correo, teléfono opcional y mensaje para responder una solicitud; una futura administración autorizada será responsable de consultarlos. Antes de producción se requiere definir retención y publicar un Aviso de Privacidad real.

## Principios UI y UX

1. Comunicar antes de decorar: precio, alcance del producto y disponibilidad deben entenderse de inmediato.
2. Una acción principal por pantalla: explorar, ver armazón, agregar o revisar carrito.
3. La atención visual debe estar presente como orientación, no como promesa médica no sustentada.
4. Formularios y estados deben explicar qué ocurrirá después.
5. El móvil es una experiencia propia: controles táctiles, listas verticales y resumen sin tablas horizontales.

## Sistema visual

| Elemento     | Decisión                                                                                                   |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Color        | Azul prusiano para confianza, verde agua para acento y blanco cálido como superficie. Contraste AA mínimo. |
| Tipografía   | Serif sobria para titulares y sans-serif legible para interfaz; escala responsive moderada.                |
| Espaciado    | Escala 4/8/12/16/24/32/48/64 px.                                                                           |
| Bordes/radio | Bordes suaves y discretos; radio 10–16 px, sin tarjetas decorativas repetidas.                             |
| Contenedor   | Máximo 72rem, márgenes laterales mínimos de 1rem.                                                          |
| Breakpoints  | 390 px móvil, 768 px tableta, 1440 px escritorio.                                                          |
| Estados      | Éxito verde, aviso ámbar, error rojo accesible; `aria-live` para feedback.                                 |
| Movimiento   | Transiciones breves sólo para foco, hover y feedback; respetar `prefers-reduced-motion`.                   |

## Semántica de carrito y checkout

El item de carrito es un armazón y cantidad solicitada, no una receta ni lentes personalizados. El precio es el precio actual de armazón. Inventario es cantidad disponible por sucursal, sin reserva en carrito.

La estructura técnica de checkout/pedido preparada en Fase 6 se conserva, pero el significado comercial de confirmar una solicitud, descontar stock o reservarlo sigue en **NEEDS DECISION**. No se debe completar su flujo hasta aprobarlo.

## Estrategia responsive

Móvil prioriza navegación simple, una columna, controles de al menos 44 px y resumen posterior a items. Tableta usa dos columnas cuando la lectura lo permite. Escritorio usa un contenedor acotado y evita líneas demasiado largas.

## Implemented design — Fase 5.5

Se implementó un sistema visual único con tokens de color, espaciado, radio, superficies, foco y movimiento reducido. La portada usa producto real y una composición editorial; catálogo, detalle, carrito, autenticación, perfil, cabecera y footer adoptan el mismo sistema.

- El menú móvil es interactivo, accesible por teclado, cierra con Escape y bloquea el desplazamiento de fondo mientras está abierto.
- El filtro de catálogo permanece compacto en móvil y conserva el formulario GET y los parámetros URL existentes.
- El detalle aclara que el precio corresponde al armazón; lentes graduados y tratamientos no se presentan como incluidos.
- No se creó checkout visual: no hay una ruta actual expuesta y simular pasos de sucursal/confirmación implicaría adelantar la Fase 6. Esta diferencia es intencional.

## Decisiones que necesito tomar

1. ¿El precio actual comunica sólo armazón? Recomendación: sí, etiquetarlo explícitamente.
2. ¿La acción principal es compra, solicitud o reserva para recolección? Recomendación: solicitud/recolección hasta integrar pago.
3. ¿Confirmar pedido descuenta, reserva o no altera stock? Recomendación: reserva con vencimiento, cuando la operación pueda gestionarla.
4. ¿Qué categorías de producto requerirán cita? Recomendación: graduados y asesoría; armazones de catálogo pueden seguir a carrito.
5. ¿Cantidad máxima por armazón? Recomendación: validar contra stock y revisar límite comercial con operación.
6. ¿MVP ofrece sólo recolección o también entrega? Recomendación: recolección primero.
7. ¿Qué servicios de cita existen realmente? Recomendación: examen visual, asesoría y ajuste, sólo tras confirmar operación.
8. ¿Se manejarán variantes reales de color/tamaño? Recomendación: modelarlas antes de publicar datos que las requieran.
