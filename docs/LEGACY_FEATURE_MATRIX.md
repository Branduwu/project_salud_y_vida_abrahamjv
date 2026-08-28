# Legacy feature matrix

| Legacy page                   | Legacy purpose          | New route      | Current status | Business relevance | Migration decision            | Notes                                               |
| ----------------------------- | ----------------------- | -------------- | -------------- | ------------------ | ----------------------------- | --------------------------------------------------- |
| `index.html`                  | Inicio y promoción      | `/`            | MIGRATED       | Alta               | MIGRATED                      | Catálogo y contenido institucional DB-backed.       |
| `catalogo.html`               | Explorar productos      | `/catalogo`    | MIGRATED       | Alta               | MIGRATED                      | Filtros y disponibilidad del servidor.              |
| `busqueda.html`               | Buscar catálogo         | `/catalogo?q=` | MERGED         | Alta               | MERGED                        | La búsqueda pertenece al catálogo.                  |
| `carrito-compras.html`        | Carrito                 | `/carrito`     | MIGRATED       | Alta               | MIGRATED                      | Persistente y validado en servidor.                 |
| `contactos.html`              | Contacto externo        | `/contacto`    | IMPROVED       | Alta               | REPLACED                      | Persiste en PostgreSQL; sin FormSubmit.             |
| `sucursal.html`               | Dirección y Leaflet     | `/sucursales`  | IMPROVED       | Alta               | REPLACED                      | Datos DB-backed y enlace de ubicación, sin Leaflet. |
| `pag-nosotros.html`           | Identidad/equipo        | `/nosotros`    | MIGRATED       | Media              | MIGRATED                      | No se migran perfiles personales sin confirmar.     |
| `agenda-cita.html`            | Citas localStorage      | —              | PENDING        | Alta               | NOT MIGRATED YET              | Fase 6 permanece pausada.                           |
| `personaliza-lentes.html`     | Personalización         | —              | PENDING        | Media              | NOT MIGRATED YET              | Requiere variantes, receta y reglas.                |
| `login-registro.html`         | Inicio de sesión        | `/login`       | REPLACED       | Alta               | REPLACED                      | Auth server-side separada.                          |
| `registrousuario.html`        | Registro                | REPLACED       | Alta           | REPLACED           | Sólo datos mínimos aprobados. |
| `olvidelacontra.html`         | Recuperación            | —              | PENDING        | Media              | NOT MIGRATED YET              | Requiere flujo seguro de correo.                    |
| `mi-perfil.html`              | Perfil y wishlist local | `/perfil`      | PARTIAL        | Media              | MERGED                        | Wishlist pendiente de modelo real.                  |
| `perfildelusuarionew.html`    | Perfil con dirección    | `/perfil`      | REPLACED       | Baja               | REMOVED INTENTIONALLY         | Direcciones no son parte del MVP.                   |
| `admin.html`                  | Administración maqueta  | `/admin`       | PARTIAL        | Media              | NOT MIGRATED YET              | RBAC existe; operación no está aprobada.            |
| `form-creacionproductos.html` | Alta de producto        | —              | PENDING        | Media              | NOT MIGRATED YET              | Requiere administración operativa.                  |

## Conteo

- Legacy pages: 16
- Migrated: 4
- Replaced: 4
- Merged: 2
- Pending: 5
- Removed intentionally: 1

Los conteos describen decisión de migración, no autorizan las funcionalidades pendientes.
