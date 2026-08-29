# ✅ Checklist: Deploy en Vercel

## 1. **Preparación Local** ✓ COMPLETO

- [x] Proyecto Next.js compila sin errores
- [x] TypeScript valida correctamente
- [x] Build de producción funciona: `npm run build`
- [x] Variables de entorno documentadas en `.env.example`
- [x] Vercel.json configurado correctamente

## 2. **En Vercel Dashboard**

### Paso 1: Crear Proyecto Vercel
- [ ] Ve a https://vercel.com/dashboard
- [ ] Click en "Add New" → "Project"
- [ ] Selecciona el repositorio: `project_salud_y_vida_abrahamjv`
- [ ] **Root Directory**: `.` (raíz del repositorio)
- [ ] **Framework**: Next.js (detectado automáticamente)
- [ ] Click en "Deploy"

### Paso 2: Configurar Base de Datos (Neon)
Después del primer deploy (puede fallar sin BD, es normal):

- [ ] En el Dashboard del proyecto, ve a "Settings"
- [ ] Abre "Integrations" o busca "Neon" en Marketplace
- [ ] Click en "Add Integration" → Neon
- [ ] Sigue las instrucciones para crear cuenta en Neon
- [ ] Neon **inyectará automáticamente** `DATABASE_URL` en variables de entorno

### Paso 3: Configurar Variables de Entorno
En el Dashboard de Vercel → Settings → Environment Variables:

- [ ] `AUTH_SECRET`: Genera 32 bytes aleatorios
  ```bash
  # En PowerShell local (NO en Vercel):
  [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).Guid + (New-Guid).Guid)) | Select-Object -First 32
  ```
  O simplemente: `openssl rand -base64 32`
  Copiar el valor en Vercel bajo "Production"

- [ ] Asegúrate que `DATABASE_URL` fue inyectada por Neon (debería estar ahí)

### Paso 4: Deploy
- [ ] Click en "Redeploy" (o push a main si está en CI/CD)
- [ ] Observa el build log:
  - Debe ver: `npm run build:vercel`
  - Dentro: `db:setup` ejecutándose
  - Luego: `next build`
  - Finaliza con ✓ sin errores

Si el build falla por `DATABASE_URL` no configurada:
- Verifica que Neon está integrado
- En Settings → Environment Variables, confirma que `DATABASE_URL` aparece

## 3. **Crear Primer Administrador**

IMPORTANTE: Solo hacer esto UNA VEZ, cuando Vercel está en production y BD lista.

**Opción A: Desde Vercel CLI (Recomendado)**
```bash
# En tu terminal local (con acceso a variables):
npm i -g vercel
vercel env pull .env.production.local
# Edita .env.production.local y añade:
# ADMIN_BOOTSTRAP_EMAIL=tu@email.com
# ADMIN_BOOTSTRAP_NAME="Tu Nombre"
# ADMIN_BOOTSTRAP_PASSWORD="TuContraseña123!"

npm run admin:create
```

**Opción B: Desde Neon Console**
- Ve a Neon Dashboard
- Abre la consola SQL
- Ejecuta el script que está en `src/db/production-data.ts` manualmente

## 4. **Verificación Post-Deploy**

- [ ] Visita tu URL de Vercel (ej: https://salud-y-vida.vercel.app)
- [ ] Página de inicio carga sin errores
- [ ] `/catalogo` muestra productos (si se creó admin y BD)
- [ ] `/login` es accesible
- [ ] `/admin` requiere autenticación

## 5. **Troubleshooting**

### Build falla: "Production database is not configured"
**Causa**: `DATABASE_URL` no está en variables de entorno
**Solución**: 
- Verifica que Neon está integrado en Settings
- Redeploy después de integrar Neon

### Página blanca o 500 error
**Causa**: BD no migrada correctamente
**Solución**:
- Revisa logs de build en Vercel (Build Logs tab)
- Verifica que `db:setup` ejecutó sin errores
- Si persiste, redeploy forzado

### AUTH_SECRET cambió, sesiones no funcionan
**NUNCA hagas esto en producción**. Auth_SECRET debe ser el mismo siempre:
- No regeneres AUTH_SECRET entre deploys
- Si debes hacerlo, todos los usuarios se deslogean

## 6. **Comandos Útiles**

```bash
# Ver logs locales de build
npm run build:vercel

# Verificar sin BD (fallaría en Vercel):
npm run build

# Probar variables de entorno localmente
vercel env pull .env.local

# Ver status de integración Neon
vercel integration list
```

## 7. **Importante: NO hacer en Vercel**

- ❌ `npm run db:seed` - Crea datos demo, solo para local
- ❌ Cambiar `AUTH_SECRET` entre deploys
- ❌ Usar `.env` local en producción
- ❌ Ejecutar `db:reset` en producción

---

**Estado actual**: ✅ Proyecto listo para Vercel. Solo falta integrar Neon y configurar AUTH_SECRET.
