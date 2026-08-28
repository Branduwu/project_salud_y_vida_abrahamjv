# Assets del catálogo

La aplicación nueva no carga el árbol completo de 16 MB del frontend legado. Sólo se copiaron ocho imágenes de producto desde `legacy/vite-frontend/public/assets/img/lentes/` hacia `public/images/products/`.

| Clasificación        | Cantidad | Decisión                                                                                                                    |
| -------------------- | -------: | --------------------------------------------------------------------------------------------------------------------------- |
| REUTILIZAR           |        8 | `01` a `08`: producto con SKU único y metadatos suficientes en el catálogo legado. Pesan 38–53 KB y miden 1600 px de ancho. |
| OPTIMIZAR            |        0 | No se recomprimieron de forma agresiva: Next Image entrega tamaños responsivos, lazy-load y formatos optimizados.           |
| REEMPLAZAR           |        0 | No se inventaron imágenes para productos con datos inconsistentes.                                                          |
| ELIMINAR DEL RUNTIME |        8 | `09` a `16`: SKU/modelo/descuento repetidos o contradictorios; se conservan sólo dentro de `legacy/` para trazabilidad.     |

También quedan fuera del runtime todas las copias duplicadas de imágenes en `legacy/public/assets/img/`, las imágenes de perfiles, el material no relacionado y el video de Power Rangers. El activo mayor, `close-up-corrective-spectacle-snellen-chart.jpg` (aprox. 3.5 MB), no se copió porque no se usa en esta fase.

Las tarjetas y el detalle usan `next/image` con dimensiones conocidas, `sizes` responsivos y `object-fit: contain`, por lo que no introducen layout shift ni descargan el catálogo legado completo.
