# Deployment

## Local

1. Inicia Docker PostgreSQL: `docker compose up -d`.
2. Copia `.env.example` a `.env` y configura una URL local de Docker.
3. Ejecuta `npm run db:migrate`.
4. Sólo para desarrollo, ejecuta `npm run db:seed`.
5. Inicia la aplicación con `npm run dev`.

La URL local usa `localhost:5433`; nunca es accesible desde Netlify.

## Test

Las pruebas usan la base aislada `saludyvida_test` mediante `TEST_DATABASE_URL`/`.env.test`. Ejecuta `npm run db:test:reset` para reiniciarla. No apuntes pruebas a desarrollo o producción.

## Production

1. Provisiona un PostgreSQL gestionado compatible con PostgreSQL estándar.
2. Crea las variables de entorno server-side en Netlify.
3. Ejecuta `npm run db:migrate` una vez, como paso explícito y controlado contra la URL de producción.
4. Despliega con Netlify.

No se ejecutan migraciones por request ni durante `next build`. No ejecutes `db:seed` en producción: el seed actual crea usuarios y catálogo demo.

## Required environment variables

| Variable              | Required build               | Required runtime                                 | Server only | Public | Default                 | Purpose                                               |
| --------------------- | ---------------------------- | ------------------------------------------------ | ----------- | ------ | ----------------------- | ----------------------------------------------------- |
| `DATABASE_URL`        | No                           | Sí, para rutas/acciones que consultan PostgreSQL | Sí          | No     | Ninguno                 | PostgreSQL gestionado o Docker local.                 |
| `AUTH_SECRET`         | No                           | Sí, para crear o verificar sesiones              | Sí          | No     | Ninguno                 | Clave de firma de cookies; mínimo 32 bytes.           |
| `TEST_DATABASE_URL`   | No                           | Sólo test/E2E                                    | Sí          | No     | Ninguno                 | Base aislada de pruebas.                              |
| `PLAYWRIGHT_BASE_URL` | No                           | Sólo E2E                                         | Sí          | No     | `http://127.0.0.1:3000` | URL del servidor bajo prueba.                         |
| `CI`                  | No                           | Sólo CI/E2E                                      | Sí          | No     | Ninguno                 | Activa reintentos y evita reutilizar el servidor E2E. |
| `NODE_ENV`            | Proporcionada por plataforma | Sí                                               | Sí          | No     | Plataforma              | Habilita cookies seguras en producción.               |

No existen variables `NEXT_PUBLIC_*` requeridas. Nunca publiques `DATABASE_URL`, `AUTH_SECRET`, credenciales, seeds demo o archivos `.env`.

## Netlify

`netlify.toml` fija `npm run build`, directorio de publicación `.next` y Node `22.14.0`. Netlify detecta Next.js y aplica su adaptador OpenNext actual automáticamente; no se instala ni fija el plugin legacy.

Server Components, Server Actions, cookies HttpOnly y rutas SSR se ejecutan en el runtime Node de Netlify. Las rutas que acceden a PostgreSQL declaran `runtime = "nodejs"` y `dynamic = "force-dynamic"`.

## Route rendering

| Ruta                                 | Clasificación               | Razón                                                                                                                                       |
| ------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                  | Dinámica con DB             | Lee catálogo y sucursales públicas.                                                                                                         |
| `/catalogo` y `/catalogo/[slug]`     | Dinámica con DB             | Consulta productos, filtros e inventario.                                                                                                   |
| `/carrito`                           | Dinámica autenticada con DB | Lee el carrito persistente de la identidad actual.                                                                                          |
| `/perfil`                            | Dinámica autenticada        | Lee la sesión server-side y los datos del perfil.                                                                                           |
| `/admin`                             | Dinámica autenticada con DB | Requiere sesión de administrador y consulta datos protegidos.                                                                               |
| `/sucursales` y `/contacto`          | Dinámica con DB             | Leen sucursales/datos de contacto; contacto además tiene una Server Action.                                                                 |
| `/login`, `/registro`, `/_not-found` | Estática                    | No requieren datos de DB durante el build.                                                                                                  |
| `/nosotros`, `/atencion-visual`      | Informativa, shell dinámico | El contenido no depende de DB; el shell compartido consciente de sesión hace dinámica a la ruta. Este arreglo no las fuerza como dinámicas. |
| `/api/health`                        | Route Handler dinámico      | Responde por request y no depende de DB.                                                                                                    |

Sólo las rutas con DB de la tabla declaran explícitamente Node runtime y `force-dynamic`; así se evita un prerender accidental de DB sin aplicar esa directiva a toda la aplicación.

## Runtime validation

El cliente PostgreSQL es lazy: importar módulos no crea pools ni lee configuración. La primera operación de DB sin `DATABASE_URL` falla en logs server-side con un mensaje claro y sin exponer la cadena de conexión. Un pool se reutiliza por instancia de runtime y se cierra explícitamente sólo en pruebas/utilidades.

## Before production

- Confirma dirección, horario, teléfono, redes y servicios institucionales.
- Define retención de `contact_messages` y publica un Aviso de Privacidad real.
- Configura logs de deploy como privados si el repositorio es público.
