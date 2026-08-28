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
2. Configura `DATABASE_URL` en un entorno controlado para tareas operativas.
3. Ejecuta `npm run db:migrate` una vez, como paso explícito y controlado contra la URL de producción.
4. Crea o promueve el primer administrador de forma controlada con `npm run admin:create`.
5. Configura los secretos runtime en la plataforma de despliegue y despliega.

No se ejecutan migraciones por request ni durante `next build`. No ejecutes `db:seed` en producción: el seed actual crea usuarios y catálogo demo.

## Required environment variables

| Variable                   | Required build               | Required runtime                                 | Server only | Public | Default                 | Purpose                                               |
| -------------------------- | ---------------------------- | ------------------------------------------------ | ----------- | ------ | ----------------------- | ----------------------------------------------------- |
| `DATABASE_URL`             | No                           | Sí, para rutas/acciones que consultan PostgreSQL | Sí          | No     | Ninguno                 | PostgreSQL gestionado o Docker local.                 |
| `AUTH_SECRET`              | No                           | Sí, para crear o verificar sesiones              | Sí          | No     | Ninguno                 | Clave de firma de cookies; mínimo 32 bytes.           |
| `TEST_DATABASE_URL`        | No                           | Sólo test/E2E                                    | Sí          | No     | Ninguno                 | Base aislada de pruebas.                              |
| `PLAYWRIGHT_BASE_URL`      | No                           | Sólo E2E                                         | Sí          | No     | `http://127.0.0.1:3000` | URL del servidor bajo prueba.                         |
| `CI`                       | No                           | Sólo CI/E2E                                      | Sí          | No     | Ninguno                 | Activa reintentos y evita reutilizar el servidor E2E. |
| `NODE_ENV`                 | Proporcionada por plataforma | Sí                                               | Sí          | No     | Plataforma              | Habilita cookies seguras en producción.               |
| `ADMIN_BOOTSTRAP_EMAIL`    | No                           | Sólo `admin:create`                              | Sí          | No     | Ninguno                 | Correo del administrador a crear o promover.          |
| `ADMIN_BOOTSTRAP_NAME`     | No                           | Sólo al crear mediante `admin:create`            | Sí          | No     | Ninguno                 | Nombre del nuevo administrador.                       |
| `ADMIN_BOOTSTRAP_PASSWORD` | No                           | Sólo al crear mediante `admin:create`            | Sí          | No     | Ninguno                 | Contraseña temporal; no se pasa por argumentos.       |

No existen variables `NEXT_PUBLIC_*` requeridas. Nunca publiques `DATABASE_URL`, `AUTH_SECRET`, credenciales, seeds demo o archivos `.env`.

## First production administrator

`npm run admin:create` es una herramienta CLI server-side: no existe endpoint HTTP, Server Action ni ruta pública para crear o promover administradores. Debe ejecutarse sólo desde una consola o job controlado que ya tenga acceso a la base remota.

1. Provisiona PostgreSQL gestionado y configura `DATABASE_URL` en el entorno controlado.
2. Ejecuta `npm run db:migrate` contra esa base.
3. Inyecta temporalmente `ADMIN_BOOTSTRAP_EMAIL` y ejecuta `npm run admin:create` para promover una cuenta existente. Esta operación es idempotente.
4. Si la cuenta aún no existe, inyecta además `ADMIN_BOOTSTRAP_NAME` y `ADMIN_BOOTSTRAP_PASSWORD` mediante un gestor de secretos o variables temporales de la sesión; después ejecuta el mismo comando. La contraseña nunca se pasa como argumento de shell, no se imprime y no debe guardarse en `.env` ni en Netlify.
5. Elimina las tres variables temporales del entorno controlado y despliega la aplicación.

El comando crea los roles de sistema `ADMIN` y `USER` si la base recién migrada aún no los contiene; crea una cuenta nueva o agrega `ADMIN` a una cuenta existente. Repetirlo no duplica la asignación por la llave primaria de `user_roles`.

Nunca ejecutes `db:seed` en producción: crea usuarios y productos demo.

## Vercel

### Project setup

La recomendación es crear un proyecto Vercel **nuevo** para la aplicación actual, por ejemplo `salud-y-vida`. El proyecto `vite-frontend` se conserva sin borrar hasta que el nuevo deployment esté validado.

| Ajuste            | Valor                                      |
| ----------------- | ------------------------------------------ |
| Repository        | `Branduwu/project_salud_y_vida_abrahamjv`  |
| Production Branch | `main`                                     |
| Root Directory    | `.` o vacío/default (raíz del repositorio) |
| Framework Preset  | `Next.js`                                  |
| Install Command   | automático / `npm install`                 |
| Build Command     | automático / `npm run build`               |
| Output Directory  | automático, sin override                   |
| Node.js Version   | `22.x`                                     |

No crear `vercel.json`: Next.js se detecta automáticamente desde el `package.json` raíz y una configuración adicional podría ocultar el error de Root Directory. En particular, no configures `dist`, `.next`, Vite ni `legacy/vite-frontend` como salida o directorio de build.

Vercel sólo selecciona versiones mayores de Node; `package.json` fija `22.x` para Vercel y `.nvmrc` conserva `22.14.0` para desarrollo local y Netlify. Vercel aplicará el parche de Node 22 disponible y soportado por la plataforma.

### Environment and production database

Configura exclusivamente estas variables runtime permanentes en Vercel para Production (y Preview sólo si esa preview cuenta con una DB aislada):

| Variable       | Required | Secret | Notes                                                 |
| -------------- | -------- | ------ | ----------------------------------------------------- |
| `DATABASE_URL` | Sí       | Sí     | URL de PostgreSQL gestionado, nunca `localhost:5433`. |
| `AUTH_SECRET`  | Sí       | Sí     | Secreto de firma de al menos 32 bytes.                |

No configures como secretos permanentes `TEST_DATABASE_URL`, `PLAYWRIGHT_BASE_URL`, `CI` ni `ADMIN_BOOTSTRAP_*`. La aplicación usa PostgreSQL estándar mediante `DATABASE_URL`; no está ligada a Neon, Supabase ni Railway.

Para generar `AUTH_SECRET` en una estación controlada sin persistirlo en el repositorio, ejecuta `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` y guarda sólo el resultado en el gestor de secretos de Vercel.

`pg.Pool` se inicializa de forma lazy y se reutiliza por instancia runtime; no abre conexiones durante import ni build. En serverless cada instancia puede tener su propio pool, por lo que una futura carga alta puede requerir un proveedor con pooling o proxy de conexiones. No se cambia esa arquitectura hasta medir el proveedor y la carga reales.

Las rutas con DB declaran runtime Node y no Edge: `/`, `/catalogo`, `/catalogo/[slug]`, `/carrito`, `/perfil`, `/admin`, `/sucursales` y `/contacto`. Server Components, Server Actions, cookies HttpOnly, auth y RBAC son compatibles con ese runtime.

### Deployment order

1. Crea PostgreSQL gestionado y obtiene su `DATABASE_URL`.
2. En un entorno controlado configura temporalmente `DATABASE_URL`.
3. Ejecuta `npm run db:migrate`.
4. Ejecuta `npm run admin:create` con las variables temporales `ADMIN_BOOTSTRAP_*` necesarias.
5. Elimina `ADMIN_BOOTSTRAP_*` del entorno controlado.
6. Configura `DATABASE_URL` y `AUTH_SECRET` en Vercel.
7. Despliega desde `main`.
8. No ejecutes `npm run db:seed`.

Las migraciones no se ejecutan durante import, `next build`, request ni deploy automáticamente.

### Production smoke test

- Pública: `/`, `/catalogo`, un producto, `/nosotros`, `/sucursales`, `/contacto`, `/atencion-visual`.
- Auth: `/registro`, `/login`, sesión y `/perfil`.
- DB: lectura de catálogo/sucursal y un único mensaje de contacto identificado como prueba.
- RBAC: ADMIN real puede abrir `/admin`; un USER es redirigido/bloqueado.
- Logs: revisar errores de conexión, variables faltantes, auth, 500, timeouts y agotamiento de pool sin exponer secretos.

No crear pedidos de prueba. Elimina el mensaje de contacto sólo mediante una herramienta administrativa segura cuando exista.

### Rollback

Si un deployment falla, reviértelo desde Vercel al deployment sano anterior. No borres ni reinicies la base, no ejecutes seed y no deshagas migraciones destructivamente. Revisa primero compatibilidad de migración, variables runtime y logs; aplica una migración correctiva explícita sólo si es necesaria.

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
