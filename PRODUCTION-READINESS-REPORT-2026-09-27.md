# Production Readiness Report — Permit Fee Intelligence

**Fecha:** 2026-09-27
**Alcance:** Fase 3 — preparación para publicación real, sin modificar datos de estados, ciudades, permisos, tarifas, fuentes ni contenido validado.
**Estado de indexación:** `NEXT_PUBLIC_SITE_INDEXABLE="false"` — **no se ha activado en ningún momento**.
**Publicación:** no se ha realizado ningún despliegue.
**Contexto:** auditoría (Fase 1) y corrección controlada (Fase 2) previas, verificadas en `AUDIT-REPORT-2026-09-27.md` y `AUDIT-REPORT-2026-09-27-FINAL.md`.

---

## Resumen ejecutivo

El proyecto está **técnicamente listo para desplegar** salvo por un único punto pendiente, que es una decisión del usuario y no un defecto: **el dominio definitivo todavía no se ha proporcionado** (el mensaje de esta fase traía `[INTRODUCIR AQUÍ EL DOMINIO REAL]` sin rellenar; se confirmó explícitamente *"continuar sin dominio"*). Por ello `NEXT_PUBLIC_SITE_URL` sigue siendo `https://permitfees.example` y todas las URLs absolutas derivan de ese origen hasta que se contrate el dominio.

Todo lo demás está verificado en verde: 454/454 rutas responden 200, el sitemap simulado con `INDEXABLE=true` produce exactamente las 454 páginas públicas válidas sin duplicados ni 404, robots.txt no tiene reglas contradictorias, canonicals y metadata son correctos y consistentes, la suite completa pasa (2099 tests, typecheck 0 errores, build correcto, `db:verify` 681/681), no hay secretos en el bundle del cliente y no se carga ningún script de terceros.

---

## BLOQUEANTES

Problemas que impedirían publicar.

| # | Problema | Detalle | Acción requerida |
|---|----------|---------|------------------|
| B-1 | **Dominio definitivo no configurado** | `NEXT_PUBLIC_SITE_URL="https://permitfees.example"` en `.env.local` (única referencia de configuración; decisión explícita del usuario de dejarlo para el despliegue). De él derivan: `metadataBase` (`src/app/layout.tsx`), canonical, `og:url`, JSON-LD (`Organization`/`WebSite`/`WebPage`), directiva `Sitemap:` y `Host:` de robots.txt, y las 454 URLs del sitemap. | Sustituir el placeholder por el dominio real **y** pasar `NEXT_PUBLIC_SITE_INDEXABLE="true"` **juntos**, en el mismo cambio. Como `NEXT_PUBLIC_*` se inyecta en tiempo de build, tras cambiarlo hay que **reconstruir** (no basta con reiniciar en caliente) y re-verificar sitemap/robots/canonical. |
| B-2 | **`INDEXABLE=false` activo (intencionado)** | Robots.txt sirve `Disallow: /`, el sitemap devuelve `urlset` vacío y todas las páginas emiten `noindex, follow`. Es el estado correcto *hoy*: activar la indexación con el dominio placeholder publicaría canonicals y sitemap de un dominio inexistente. | Activar `NEXT_PUBLIC_SITE_INDEXABLE="true"` únicamente en el build de producción con el dominio real ya configurado. **No se ha hecho en esta fase.** |

No se han detectado otros bloqueantes: no hay 404 en rutas publicadas, no hay secretos expuestos, no hay errores de build ni de runtime.

---

## IMPORTANTES

Problemas que deberían resolverse antes de solicitar AdSense.

| # | Problema | Detalle | Qué falta exactamente |
|---|----------|---------|----------------------|
| I-1 | **`ads.txt` no existe** | `public/` está vacío; no hay `/ads.txt` en la raíz. **No se ha inventado ningún publisher ID** (correcto: inventarlo invalidaría la revisión). | 1) Tener una cuenta AdSense aprobada o en revisión. 2) Desde AdSense → Configuración → Información de la cuenta, copiar el **publisher ID real** (`pub-…` de 16 dígitos). 3) Crear `public/ads.txt` con una línea: `google.com, <publisher-id>, DIRECT, f08c47fec0942fa0`. 4) Verificar que `https://<dominio>/ads.txt` devuelve 200 y texto plano. |
| I-2 | **No hay CMP ni ningún mecanismo de consentimiento** | Ver §9. Cero scripts de terceros, cero cookies, cero localStorage. Hoy no hace falta CMP porque no se carga nada que consentir. | Antes de conectar AdSense: una **CMP certificada (TCF 2.2)** si hay visitantes de EEA/Reino Unido, más Google Consent Mode v2. Si el tráfico es solo US, revisar el requisito según la política vigente. **No se ha introducido ningún CMP nuevo** (no había nada funcional que reemplazar). |
| I-3 | **No existe página de Cookie Policy** | Hay `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/methodology/` — todas 200 y enlazadas — pero **no hay `/cookie/`**. `/privacy/` sí contiene una sección "Cookies" completa y precisa (describe que hoy no se setean cookies y que con anuncios entrarán cookies de terceros con consentimiento). | Crear una ruta `/cookie/` (o confirmar que la sección de Privacy es suficiente para el revisor). Recomendación: página dedicada, es lo que los revisores de AdSense suelen buscar en el checklist. |
| I-4 | **Dirección de contacto no configurada** | `NEXT_PUBLIC_CONTACT_EMAIL` está vacía; `/contact/` muestra literalmente: *"A contact address has not been configured for this deployment yet. Until it, this site cannot receive corrections."* Una web que pide revisión editorial sin canal de contacto es una señal mala en la revisión de AdSense. | Definir `NEXT_PUBLIC_CONTACT_EMAIL` en `.env.local` (y en producción) con un buzón real que se consulte. La página ya reacciona automáticamente. |
| I-5 | **Referencias residuales al placeholder fuera de la configuración** | 0 en `src/`, 0 en `next.config.ts`, 0 en `package.json`. Permanecen: `.env.local` (1, pendiente de B-1), los dos informes de auditoría (documentación histórica, correcto), `.tmp-research/` (9 ficheros de caché de investigación) y los artefactos de build en `.next/` (se regeneran en cada build). | Al cambiar el dominio: reconstruir (limpia `.next/`) y, si se quiere el objetivo literal de "0 referencias", borrar `.tmp-research/`. Los informes de auditoría conservan la mención a propósito. |

---

## RECOMENDACIONES

Mejoras opcionales.

| # | Recomendación | Detalle |
|---|---------------|---------|
| R-1 | **`og:image` ausente** | Ninguna página emite `og:image` ni `twitter:image`; las tarjetas sociales salen sin imagen (`twitter:card: summary`). `buildMetadata()` ya soporta `imagePath`; basta con generar una imagen 1200×630 y pasarla. |
| R-2 | **`favicon.ico` devuelve 404** | Existe `src/app/icon.svg` (servido como `/icon.svg`, 200) y Next lo enlaza automáticamente en `<head>`, así que los navegadores modernos lo encuentran; solo los agentes que piden `/favicon.ico` a ciegas reciben 404. Añadir un `favicon.ico` en `public/` lo elimina. |
| R-3 | **Doble `<meta name="robots">` en la página 404** | Next emite su `noindex` por defecto en errores y `buildMetadata()` añade `noindex, follow`. Ambas coinciden en `noindex` (seguro), pero hay dos etiquetas. Cosmético; se resuelve ajustando `not-found.tsx`. |
| R-4 | **`/states/` pesa 242 KB de HTML** | Es la página más pesada (incluye el mapa de EE. UU. en SVG inline). El resto: home 46 KB, ciudad 54 KB, permiso 82 KB. JS total 903 KB en 13 ficheros. Sin urgencia; si se optimiza, mover el mapa a componente cargado bajo demanda. |
| R-5 | **TTFB de páginas dinámicas 0,57–1,15 s** | Medido en local contra Neon remoto: páginas estáticas 6–9 ms; `/texas/` y `/texas/houston/` ~0,58 s en caliente, ~1,0–1,15 s en frío. En hosting serverless junto a la base Neon debería mejorar; medir tras desplegar antes de tocar nada. |
| R-6 | **Sin cabecera CSP** | Decisión documentada en `next.config.ts` (una CSP rota es peor que ninguna; requiere estrategia de nonce). El resto de cabeceras sí están: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS con preload, `poweredByHeader: false`. |
| R-7 | **`.env.example` trae `NEXT_PUBLIC_SITE_INDEXABLE="true"` con URL localhost** | Copiar la plantilla tal cual produciría un build "indexable" apuntando a `localhost:3000`. Considerar cambiar el default de la plantilla a `"false"` para que encaje con el default seguro de `site.ts`. |
| R-8 | **No hay repositorio git** | El directorio no es un repo (`git status` → *not a git repository*), pese a existir `.gitignore`. Sin historial ni backup local de los cambios; valorar `git init` + commit antes del despliegue. |
| R-9 | **Endpoint de revalidación on-demand pendiente** | `REVALIDATE_TOKEN` está prevista en `env.ts` pero no existe aún el endpoint; la revalidación es ISR por tiempo (1 h). Opcional. |

---

## CORRECTO

Todo lo que ya está preparado, verificado en esta fase.

### Dominio y URLs (§1)
- **Fuente única de origen:** `src/lib/site.ts` → `resolveSiteUrl()` lee `NEXT_PUBLIC_SITE_URL`, normaliza sin slash final. Todo (metadataBase, canonical, sitemap, robots, OG, JSON-LD, URLs absolutas) deriva de ahí: no hay dominios duros codificados.
- **0 referencias al placeholder en código**: `src/`, `next.config.ts`, `package.json` → 0 coincidencias.
- `absoluteUrl()` / `absoluteFileUrl()` (`src/lib/seo/urls.ts`) distinguen página (slash final) de fichero (sin slash), evitando el clásico error `Sitemap: …/sitemap.xml/`.
- `.env.example` es una plantilla segura (no contiene credenciales reales) y `.gitignore` excluye `.env.local`.

### No activar indexación (§2)
- `NEXT_PUBLIC_SITE_INDEXABLE="false"` verificado tras toda la fase. **No se ha cambiado a `true` en ninguna configuración permanente.**

### Sitemap (§3)
- **Con `INDEXABLE=false` (actual):** `/sitemap.xml` devuelve 200 con `urlset` vacío — comportamiento intencionado y seguro (no se anuncian URLs que robots.txt prohíbe). Código con comentario que lo explica.
- **Simulación local con `INDEXABLE=true` (scripts temporales, ya eliminados; sin tocar configuración):**
  - **454 URLs** = 7 estáticas (`/`, `/states/`, `/methodology/`, `/about/`, `/contact/`, `/privacy/`, `/terms/`) + 447 de datos — coincide con las páginas públicas válidas del proyecto.
  - **454/454 absolutas**, todas `https://`, todas con el origen configurado, **0 duplicados**, **0 sin slash final**, **0 con mayúsculas/espacios**, **0 con doble slash**.
  - **0 URLs que no deban indexarse**: sin `/admin`, `/api`, `/404` ni páginas fuera del gate (el sitemap usa el mismo filtro que las rutas; los tests *"sitemap uses the same criterion as the routes"* y las comprobaciones `sitemap omits …` de `db:verify` pasan).
  - **Crawl completo: 454/454 → HTTP 200**, 0 redirecciones, 0 errores.
  - 297 entradas con `lastModified` real (fechas de revisión/verificación, nunca la fecha del build).

### Robots.txt (§4)
- **Con `INDEXABLE=false` (actual):** `User-Agent: *` + `Disallow: /`, sin directiva Sitemap — coherente con el sitemap vacío y con el `noindex` de cada página. Seguro: nada se indexa ni se filtra.
- **Simulación con `INDEXABLE=true`:** `allow: /`, `disallow: ["/admin/", "/api/"]` — **sin `Disallow: /` accidental**, sin reglas contradictorias, `Sitemap: https://<origen>/sitemap.xml` (apuntando al fichero, sin slash) y `Host: <origen>` (solo hostname, como exige el formato). Cubierto por `tests/seo/robots.test.ts` (ambos modos).
- Metadata por página coherente: hoy `noindex, follow` en todas; simulado `index, follow` + `googlebot: index, follow, max-image-preview: large` con `INDEXABLE=true`.

### Canonical (§5 — muestra de 10 páginas)
Muestra: home, `/states/`, estado (`/texas/`), ciudad (`/texas/houston/`), permiso (`/texas/houston/building-permit-cost/`), artículo editorial (`/methodology/`) y las 4 legales (`/about/`, `/contact/`, `/privacy/`, `/terms/`).

| Comprobación | Resultado |
|---|---|
| HTTPS | ✅ 10/10 |
| Origen configurado (mismo para todos) | ✅ 10/10 (placeholder pendiente de B-1) |
| Canonical == URL actual exacta (path y slash final) | ✅ 10/10 |
| `og:url` idéntica al canonical | ✅ 10/10 |
| Sin dominios antiguos ni mixtos http/https | ✅ 10/10 |
| Errores de slash (doble/final ausente) | ✅ 0 |
- La home **no** tiene canonical heredada en el layout (decisión deliberada documentada en `layout.tsx`: un canonical heredado apuntando a la home es bug grave); cada página lo declara.
- Redirección 308 correcta de variantes sin slash (`/texas` → `/texas/`), garantía de una sola forma canónica.

### Metadata (§6)
- **title:** compuesto con `composeTitle()`, truncado en 65 caracteres con corte en palabra y `…` visible en runtime (ej. `"Houston building permit cost: how the fee is… | Permit Fee"` = 58). Los títulos fuente largos **se truncan correctamente en runtime, por lo que no se han reescrito.**
- **description:** normalizada con `normalizeSeoDescription()`/`composeDescription()` a ≤165 caracteres (medido: 143–158 en la muestra). Las descripciones fuente largas tampoco se han tocado.
- **robots:** única etiqueta `noindex, follow` en páginas normales (ver R-3 para la 404), consistente con robots.txt.
- **Open Graph:** `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `og:type` presentes y correctos. Sin `og:image` (ver R-1).
- **Twitter/X:** `twitter:card`, `twitter:title`, `twitter:description` correctos.
- **JSON-LD:** home = `WebPage` + `Organization` + `WebSite`; página de permiso = `WebPage` + `BreadcrumbList` + `FAQPage` + `Organization` + `WebSite`. Todos con URLs absolutas bajo el origen configurado; `@id`/`url` consistentes. Serializado como `application/ld+json` (el único `<script>` del proyecto — no hay ningún script de terceros).
- Sin `keywords` (ignorado por buscadores, decisión deliberada).

### Legal y confianza (§7)
- `/about/`, `/contact/`, `/privacy/`, `/terms/` → **200**, canonical correcto, `noindex` actual esperado.
- **Enlaces:** About y Methodology en la navegación primaria del header; Contact, Privacy y Terms en el panel secundario y en las tres columnas del footer (`src/lib/nav.ts`, fuente única). Enlaces verificados en el HTML renderizado.
- **No hay 404** en ninguna página legal.
- **Cookie Policy no existe** → ver I-3. No se ha añadido texto legal genérico.
- Footer con los tres disclaimers de `site.ts` (independencia, estimación, no es asesoramiento legal) en todas las páginas.

### Ads.txt (§8)
- **No existe.** No se ha creado ni inventado publisher ID. Requisitos exactos documentados en I-1.

### CMP / consentimiento (§9)
- **Proveedor: ninguno.** No hay CMP instalada.
- **Dónde está implementado:** en ninguna parte — verificación por grep en `src/`: 0 coincidencias de `adsense`, `gtag`, `googletagmanager`, `analytics`, `clarity`, `hotjar`, `onetrust`, `cookiebot`, `cookieyes`, `axeptio`, etc.
- **Qué cookies/servicios controla:** no hay cookies que controlar — `document.cookie` vacío en el navegador, 0 usos de `localStorage`/`sessionStorage` en el código.
- **Analytics/ads antes o después del consentimiento:** no se carga analytics ni ads **en ningún momento** (antes, durante o después). El único `<script>` del sitio es el JSON-LD.
- **Scripts previos al consentimiento:** ninguno. `/privacy/` lo declara con precisión ("This site sets no cookies of its own. A cookie banner would therefore be theatre at this point").
- **No se ha introducido CMP nueva** (no había ninguna funcional que reemplazar). Ver I-2 para el requisito al conectar AdSense.

### Performance (§10)
- **Build de producción limpio:** `next build` sin warnings, 12 páginas estáticas generadas, rutas dinámicas con ISR 1 h.
- **Errores JS / hydration:** 0 en consola recorriendo home, `/states/`, página de ciudad y página de permiso en el servidor de producción (`next start`, puerto 3100). Únicos `ERR_ABORTED` = prefetches RSC cancelados por navegación (comportamiento normal).
- **Requests fallidos:** 0. Fuentes (4 woff2 de `next/font`, auto-hospedadas, sin CDN externo) → todas 200; chunks → todos 200.
- **Tiempos:** estáticas TTFB 6–9 ms; dinámicas 0,57–1,15 s en local contra Neon remoto (ver R-5).
- **APIs:** no existen endpoints (`src/app/api` no existe); todo es HTML + RSC, sin llamadas de red fallidas.
- **Páginas pesadas:** solo `/states/` destaca (242 KB, ver R-4).

### Seguridad de producción (§11)
- **Sin secretos en el frontend:** grep en `.next/static` (bundle del cliente) de `postgres://`, `postgresql://`, `DATABASE_URL`, `REVALIDATE_TOKEN` → **0 coincidencias**. `src/lib/env.ts` está marcado `server-only` (importarlo desde un cliente es error de build) y valida con zod.
- **Logs:** `src/lib/errors.ts` aplica `redactSecrets()` sobre `DATABASE_URL`, `PGPASSWORD`, `REVALIDATE_TOKEN`, `NEON_*`, etc. antes de imprimir. `console.log` no existe en `src/`; solo 2 `console.error` controlados.
- **Endpoints públicos:** no hay API, no hay `/admin`, no hay autenticación, no hay formularios — superficie de ataque mínima.
- **Credenciales:** `DATABASE_URL` presente solo en `.env.local` (valor **no revelado en este informe**), gitignored, nunca en `.env.example` ni en documentación (grep de `postgres://`/`neon.tech` en `*.md` → 0).
- **Cabeceras:** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara/micrófono/geolocalización/pago deshabilitados), `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Powered-By` eliminado.
- **CSP:** ausente por decisión documentada (ver R-6).

### Prueba final (§12)
| Prueba | Resultado |
|---|---|
| `npm test` (vitest) | ✅ **2099/2099** tests, 112 archivos, 0 fallos |
| `npm run typecheck` | ✅ **0 errores** |
| `npm run build` | ✅ correcto, 0 warnings |
| `npm run db:verify` | ✅ **681/681** comprobaciones de base de datos |
| Comprobación de rutas | ✅ **454/454 → HTTP 200**, 0 errores |
| Comprobación de sitemap | ✅ actual: vacío por diseño; simulado `INDEXABLE=true`: 454 URLs absolutas, 0 dupes, 0 no-indexables |
| Comprobación de robots | ✅ actual: `Disallow: /` coherente; simulado: crawlable, sin `Disallow: /` accidental, sitemap al origen correcto, sin reglas contradictorias |
| `INDEXABLE` | ✅ sigue en `"false"` (verificado al cierre) |
| Servidor de prueba de producción (puerto 3100) | ✅ levantado, verificado y **detenido** |

---

## CAMBIOS REALIZADOS

Solo cambios de configuración necesarios para preparar producción.

**No ha habido ningún cambio de configuración ni de código permanente.** En concreto:

- `.env.local`: **sin modificar** (sigue `INDEXABLE="false"` y el placeholder, por la decisión "continuar sin dominio").
- Ningún fichero de `src/`, `scripts/` (permanentes), `public/`, `next.config.ts`, `package.json` ni `tests/` ha sido alterado.
- Se crearon **scripts temporales de verificación** (`scripts/tmp-p3/sitemap-sim.ts`, `crawl.ts`, `meta-sim.ts`) para simular `INDEXABLE=true` sin tocar la configuración, junto con sus salidas (`urls.txt`, `crawl-results.json`) y un log del servidor de prueba. **Todos han sido eliminados al terminar** (`scripts/` queda con sus 5 ficheros originales).
- Se levantó un servidor de producción temporal (`next start` en el puerto 3100) para las mediciones de §10/§12 y **se detuvo**; el servidor de desarrollo original (puerto 3000) sigue en pie con la configuración intacta.

---

## CAMBIOS NO REALIZADOS

Confirmación explícita de que **no** se ha modificado nada de lo siguiente:

| Elemento | Estado |
|---|---|
| Estados (50) | ✅ **sin modificar** |
| Ciudades / jurisdicciones | ✅ **sin modificar** |
| Permisos / páginas de permiso (46 registros `permit_page` añadidos en Fase 2, ya cerrada) | ✅ **sin modificar en esta fase** |
| Tarifas / `fee_rules` (2606) | ✅ **sin modificar** |
| Fuentes (`sources`, 350) | ✅ **sin modificar** |
| Reglas verificadas (`verifications`, 1013) | ✅ **sin modificar** |
| Contenido validado (research, seeds, prosa) | ✅ **sin modificar** |
| `NEXT_PUBLIC_SITE_INDEXABLE` | ✅ **sigue en `"false"` — no se activó `true`** |
| Dominio / placeholder | ✅ **no sustituido (dominio no proporcionado; decisión del usuario)** |
| Despliegue / publicación | ✅ **no realizado** |
| Títulos y descripciones largos en seeds | ✅ **no reescritos** (se truncan correctamente en runtime, verificado) |
| Texto legal | ✅ **no se ha añadido texto legal genérico** (no se creó Cookie Policy sin necesidad confirmada) |
| `ads.txt` | ✅ **no creado** (sin publisher ID real) |
| CMP | ✅ **no introducida** (no había ninguna funcional que reemplazar) |
| Tests / typecheck / build | ✅ suite completa en verde tras la fase, sin regresiones |

---

## Checklist de puesta en marcha (cuando haya dominio)

1. Contratar el dominio.
2. Editar `.env.local` (o las variables del hosting): `NEXT_PUBLIC_SITE_URL="https://<dominio>"` **y** `NEXT_PUBLIC_SITE_INDEXABLE="true"` (ambos juntos).
3. Reconstruir (`npm run build`) — `NEXT_PUBLIC_*` se inyecta en build, no en runtime.
4. Re-verificar: `curl https://<dominio>/robots.txt` (allow + sitemap), `…/sitemap.xml` (454 URLs con el dominio nuevo), canonical de una muestra, y grep de `permitfees.example` → 0 tras reconstruir.
5. Resolver I-1 (`ads.txt` con el publisher ID real), I-2 (CMP si aplica), I-3 (Cookie Policy), I-4 (`NEXT_PUBLIC_CONTACT_EMAIL`).
6. Solicitar AdSense.

---

*Generado el 2026-09-27. Fases 1–2 previas: `AUDIT-REPORT-2026-09-27.md`, `AUDIT-REPORT-2026-09-27-FINAL.md`.*
