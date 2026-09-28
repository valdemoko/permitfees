# Auditoría final pre-publicación — Permit Fee Intelligence

**Fecha:** 2026-09-27/28
**Alcance:** producto completo (código, datos, contenido, fuentes, SEO, rendimiento, seguridad, legal, UX, responsive)
**Regla aplicada:** solo auditoría. **Ningún archivo del producto ha sido modificado.** Todos los artefactos de comprobación viven en `.tmp-audit/` (cubierto por `.gitignore` vía `.tmp-*/`).
**Etiquetas usadas:** `VERIFICADO` · `NO VERIFICADO` · `PROBLEMA` · `MEJORA RECOMENDADA` · `BLOQUEADOR`

---

## 1. Resumen ejecutivo

**Pregunta central: ¿está Permit Fee Intelligence preparado para publicarse como sitio de alta calidad y ser aceptado en AdSense?**

**Respuesta: CONDICIONADO — técnicamente muy sólido y con contenido real de alta calidad en su mayoría, pero con 3 problemas P1 que deben corregirse antes de publicar y 7 problemas P2 que conviene resolver antes de solicitar AdSense.**

Hallazgos críticos (en orden de gravedad):

1. **PROBLEMA P1 — Contacto sin configurar.** `NEXT_PUBLIC_CONTACT_EMAIL` no existe en `.env.local`; `/contact/` renderiza: *“A contact address has not been configured for this deployment yet… please treat the published figures as unverified for now.”* El sitio declara públicamente que sus cifras están sin verificar. Evidencia: `grep CONTACT .env.local` → sin resultados; captura de `/contact/` en build de producción. **Solución:** configurar `NEXT_PUBLIC_CONTACT_EMAIL=contacto.webproyectos@gmail.com`.
2. **PROBLEMA P1 — La home muestra rutas que dan 404.** El bloque PROCESS muestra `/states/texas/`, `/states/texas/houston/` (pasos 01, 02, 04) que devuelven **404** (las rutas reales son `/texas/` y `/texas/houston/`, verificadas 200). Evidencia: `src/app/page.tsx:53,58,68`; `curl /states/texas/` → 404. No son enlaces (el crawl no detecta enlaces rotos), pero son texto visible que instruye al usuario a una URL inexistente.
3. **PROBLEMA P1 — Las rutas dinámicas no se cachean.** `/` y `/states/` sirven `s-maxage=3600`, pero `/texas/`, `/texas/houston/...` sirven `Cache-Control: private, no-cache, no-store` y tardan **0,4–1,1 s en CADA petición** (p50 945 ms, p95 1.072 ms). El `revalidate=3_600` declarado no aplica porque las rutas dinámicas no tienen `generateStaticParams`. Evidencia: `curl -I /texas/` (cabeceras), crawl `.tmp-audit/sitemap-audit.json`.
4. **PROBLEMA P2 — Las 50 páginas de estado son thin** (~100–131 palabras, 1 tabla, 1 H2, sin fuentes externas ni fecha). Es el principal riesgo de calidad percibida para AdSense.
5. **PROBLEMA P2 — 9 URLs de fuentes oficiales muertas confirmadas (404)** + 2 redirecciones a contenido inválido (Nashville Legistar → `Error.aspx` ×2; Huntsville → página de *water pollution*, tema ajeno). Evidencia: `.tmp-audit/urlcheck-confirm.json`.
6. **PROBLEMA P2 — Desbordamiento horizontal en móvil ≤384 px** (scroll 367 px vs 303 px de viewport a 320 px; +24 px a 360 px, +9 px a 375 px; 0 px a 768 y 1440). Causa: cabecera `details.menu` anclada a right=367 px.
7. **PROBLEMA P2 — No existe página de Cookie Policy** (la privacy menciona "cookies" 8 veces).

Lo que sí está **verificado y es sólido**: build de producción con INDEXABLE=true → EXIT 0; crawl completo **454/454 URLs → 200, 0 títulos duplicados, 0 descripciones duplicadas, canonical autorreferencial en 454/454, H1 único en 454/454, JSON-LD válido en 454/454**; enlaces internos **0 rotos** y 0 páginas huérfanas del sitemap; `npm run check` → **112 archivos, 2.099 tests, EXIT 0**; `db:verify` → EXIT 0; **0 reglas caducadas activas, 0 reglas sin fuente, 0 huérfanos, 0 slugs duplicados**; 1.013 verificaciones (991 verified, 19 needs_review, 3 disputed — estas últimas en draft y fuera de los totales); 350 fuentes todas HTTPS y verificadas entre 2026-09-23 y 2026-09-27; robots y sitemap correctos en ambos modos (indexable y no indexable).

**No se detecta ningún P0.** No hay páginas rotas, ni errores de build, ni datos inventados, ni páginas doorway: la arquitectura editorial (puerta de puerta editorial: intro ≥240, contexto local ≥120, ≥1 fuente, verificación) cumple en las 454 páginas.

---

## 2. Inventario completo

### 2.1 Rutas de aplicación (`src/app/`) — VERIFICADO

| Ruta | Tipo | Estado |
|---|---|---|
| `/` | home estática | VERIFICADO (200, H1 único) |
| `/[state]` (50) | hub de estado dinámico | VERIFICADO (200 ×50) |
| `/[state]/[city]` (100) | hub de ciudad dinámico | VERIFICADO (200 ×100) |
| `/[state]/[city]/[permit]` (300; 297 publicados) | página de permiso | VERIFICADO (297 en sitemap, 3 draft/noindex) |
| `/states/` | directorio con mapa | VERIFICADO |
| `/about/`, `/contact/`, `/methodology/`, `/privacy/`, `/terms/` | estáticas legales/info | VERIFICADO (200) |
| `sitemap.ts`, `robots.ts` | generadores | VERIFICADO (ver §28, §29) |
| `not-found.tsx` (404), `error.tsx` | errores | VERIFICADO con reparos (ver §13) |
| `loading.tsx` | — | **AUSENTE en todo el árbol** (ver §19) |

No existen APIs públicas ni ruta `/admin/` real (robots la desautoriza preventivamente).

### 2.2 Inventario de datos (Neon Postgres, 2026-09-27) — VERIFICADO

`.tmp-audit/inventory.ts` + `inventory.log`:

| Entidad | Cantidad | Notas |
|---|---|---|
| Estados | 50 | 50 activos, slugs únicos |
| Jurisdicciones | 100 (2 por estado) | 100 activas |
| Perfiles de jurisdicción | 100 | 100 published, **0 noindex** |
| Páginas de permiso | 300 | **297 published+indexable, 3 draft/noindex** (ne/lincoln-plumbing, tx/houston-demolition, tx/houston-mechanical) |
| Fee rules | 2.606 | 2.591 active, 15 draft |
| Fuentes | 350 | todas HTTPS, `last_verified_at` 2026-09-23→27 |
| Requisitos (`permit_requirements`) | 444 | 12 jurisdicciones con 0 |
| Verificaciones | 1.013 | 991 verified, 19 needs_review, 3 disputed |
| Fee schedules | 156 | |
| Departments | 114 | |
| Counties | 93 | |

### 2.3 Componentes/librerías internas — VERIFICADO

`src/components/`: `brand`, `data`, `layout`, `map`, `seo`, `ui`. `src/lib/`: `calc` (motor de cálculo), `content`, `db` (schema Drizzle: 15 tablas), `editorial` (gate), `env`, `errors`, `format`, `nav`, `seo` (`metadata.ts`, TITLE_MAX_LENGTH=65), `sources`, `time`, `dates`, `errors.ts`.

### 2.4 Herramientas/scripts existentes — VERIFICADO

`package.json`: `dev/build/start/typecheck/test/check/db:generate/db:migrate/db:push/db:studio/db:seed/db:reseed/db:verify`. `scripts/`: `seed.ts`, `verify-db.ts`, `generate-us-map.ts`, `load-env.ts`, `fix_stale.ts`.

### 2.5 Páginas legales/informativas — VERIFICADO

Existentes: about, contact, privacy, terms, methodology. **Ausente: Cookie Policy** (PROBLEMA, ver §16).

### 2.6 Raíz del repositorio (higiene de despliegue) — PROBLEMA P3

Archivos scratch sin relación con el producto en la raíz: `springfield_commercial.docx`, `springfield_ibc.pdf`, `springfield_residential.docx`, `como_calc.html`, `como_devfees.pdf`, `como_fee.pdf`, `lou_form.html`, `eng.traineddata` (5,2 MB), `scripts/fix_stale.ts`. No hay repositorio git inicializado (`fatal: not a git repository`), `.env.local` sí está en `.gitignore`. `research/` está **intencionadamente** versionado (así lo documenta `.gitignore`).

---

## 3. Estado de todas las áreas (veredicto por áreas)

| # | Área | Estado | Evidencias | Problemas | Acciones |
|---|---|---|---|---|---|
| 1 | Calidad del contenido | **MEJORA RECOMENDADA** | 454 páginas, media 1.701 palabras; páginas de permiso media 2.120 (mín 702); FAQs y worked examples en todas; gate editorial ≥240/≥120/fuente/verificación cumplido | 50 hubs de estado ~100–131 palabras; 6 páginas de permiso sin tablas; 76 páginas con <4 reglas activas | Reforzar hubs de estado con contexto específico (no relleno); añadir "qué hacer después" a páginas sin schedule |
| 2 | Calidad de datos | **VERIFICADO** | 0 caducadas activas, 0 sin fuente, 0 huérfanos, 0 slugs duplicados, 15 tablas con FKs; 15 draft fuera de publicación; tests matemáticos (2.099) | 3 reglas disputed (en draft, correcto) | Mantener el modelo de ventanas temporales; re-verify las 3 disputed con las ciudades |
| 3 | Fuentes | **MEJORA RECOMENDADA** | 350/350 HTTPS; 991 verificaciones verified recientes (≤5 días); 423 enlaces salientes a dominios oficiales | **9 fuentes 404 confirmadas**, 2 redirecciones a contenido inválido, 14 indeterminadas, 16 bloqueadas anti-bot | Reemplazar/actualizar las 9 muertas (prioridad); re-verificar 30 desde otra red |
| 4 | Utilidad real | **VERIFICADO** | Fórmula + condiciones + ejemplo worked + fuente + fecha de verificación en cada página; 6 páginas dicen honestamente "no hay schedule publicado" | Home muestra rutas 404 (P1); contacto inexistente (P1) | Corregir los 2 P1 |
| 5 | UX | **MEJORA RECOMENDADA** | Flujo home→estado→ciudad→permiso→coste→fórmula→fuente→fecha funciona (probado en navegador); 0 errores de consola; breadcrumbs; skip-link | Paths engañosos en home; contacto sin email; sin `loading.tsx` (0,4–1,1 s de espera sin UI) | P1 home/contacto; añadir loading states |
| 6 | SEO técnico | **VERIFICADO** | 454/454 200; canonical 454/454 autorreferencial; redirects 308 correctos (`/texas`→`/texas/`, `//texas//houston//`→canónico); sitemap y robots correctos en ambos modos | 404 page con canonical `/404/` y 2 metas robots (P3); favicon.ico/manifest.json 404 (P3) | Limpiar metas de la 404; añadir manifest |
| 7 | SEO on-page | **VERIFICADO** | 0 títulos >65 caracteres (tras decodificar entidades), 0 descripciones duplicadas, H1 único en 454/454, og:url correcto, JSON-LD WebPage/Breadcrumb/FAQ/Organization/WebSite válido en 454/454 | 3 títulos <30 caracteres (about/privacy/terms) | Ampliar esos 3 títulos |
| 8 | Indexación | **VERIFICADO (estructural)** | Gate: `noindex` por defecto, apertura deliberada; 3 draft/noindex correctos; 0 perfiles noindex; sitemap vacío cuando `INDEXABLE=false` | Depende del cambio de dominio (ver §30.H) | Flip post-dominio |
| 9 | Sitemap | **VERIFICADO** | 454 `<loc>` con INDEXABLE=true; `[]` con false; `db:verify` confirma que los criterios del sitemap coinciden con las rutas; todos HTTPS + trailing slash | ninguno | — |
| 10 | Search Console readiness | **CONDICIONADO** | robots.txt con `Host:` y `Sitemap:`; sin enlaces internos rotos; sin huérfanos | Móvil con scroll horizontal (señal UX); TTFB dinámico alto; sitemap aún apunta a `permitfees.example` | P1+P2 antes de enviar sitemap |
| 11 | AdSense readiness | **NO PREPARADO (condicionado)** | Contenido original y profundo en 297 páginas de permiso + 100 ciudades; fuentes oficiales verificables | Contacto declara "cifras sin verificar"; 50 hubs thin; 9 fuentes muertas; sin Cookie Policy; sin ads.txt (pendiente de ID) | §26 checklist completo |
| 12 | Legal | **MEJORA RECOMENDADA** | privacy, terms, about, contact existen y renderizan; sin cookies de terceros actualmente | Sin Cookie Policy; contacto sin email | Añadir Cookie Policy (o declarar "sin cookies" explícitamente) + email |
| 13 | Seguridad | **VERIFICADO** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, HSTS `max-age=63072000; includeSubDomains; preload`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment off); `.env.local` ignorado; sin variables servidor en cliente (verificado en build) | Sin CSP (P3; deberá abrirse para AdSense después) | Añadir CSP antes o tras AdSense |
| 14 | Performance | **MEJORA RECOMENDADA** | Home 4 ms / states 5 ms (estáticos, warm, gz); s-maxage=3600 en estáticas; crawl p50 945 ms | **Rutas dinámicas sin cache: 0,4–1,1 s cada petición**; sin `loading.tsx` | `generateStaticParams` (454 páginas conocidas) o ISR on-demand |
| 15 | Responsive | **PROBLEMA** | Sin overflow a 768 y 1440 px; tablas con scroll interno correcto | **Overflow a 320/360/375 px (+64/+24/+9 px)** por cabecera (`details.menu` right=367 px) | Corregir cabecera móvil antes de publicar |
| 16 | Accesibilidad | **NO VERIFICADO (parcial)** | `lang="en-US"`, skip-link `#main`, H1 único, jerarquía sin saltos, 0 controles sin nombre, 0 imágenes sin alt (0 imgs en home), `viewport` correcto | Sin ejecutar axe/Lighthouse, contraste, teclado completo, screen-reader | Ejecutar Lighthouse/axe en CI |
| 17 | Arquitectura | **VERIFICADO** | App Router, schema Drizzle con FKs+índices únicos, motor de cálculo con tests, gate editorial estructural, contenido en `src/content/*` tipado | Slugs mixtos `permit-cost`/`permit-fees` sin documentar (§13) | Documentar la convención |
| 18 | Herramientas/calculadoras | **MEJORA RECOMENDADA** | Worked examples con aritmética verificable y motor con 2.099 tests; sin calculadora interactiva | El usuario no puede introducir SU valoración | Ver §21 |
| 19 | Escalabilidad | **VERIFICADO (estimado)** | 454 páginas estáticas construibles; contenido en TS + DB Neon | Cada petición dinámica golpea render + DB → coste/latencia creciente con tráfico | ISR elimina el problema |
| 20 | Datos legales de contacto | **PROBLEMA P1** | ver §1 | email no configurado | `NEXT_PUBLIC_CONTACT_EMAIL=contacto.webproyectos@gmail.com` |

---

## 4. Problemas P0 — BLOQUEADOR ABSOLUTO

**NINGUNO.** No se ha encontrado ningún defecto que impida el build, la renderización, la navegación o la exactitud estructural de los datos:

- VERIFICADO — `NEXT_PUBLIC_SITE_INDEXABLE=true npx next build` (copia en `.tmp-audit/buildcopy/`) → EXIT 0.
- VERIFICADO — crawl de las 454 URLs: 0 respuestas ≠200, 0 errores de consola.
- VERIFICADO — `npm run check` EXIT 0 (112 archivos, 2.099 tests); `npm run db:verify` EXIT 0.

---

## 5. Problemas P1 — CRÍTICO (antes de publicar)

### P1-1 · El sitio declara que sus cifras están sin verificar
- **PROBLEMA** — `NEXT_PUBLIC_CONTACT_EMAIL` no está definida en `.env.local` (solo aparece vacía en `.env.example:28`). `src/app/contact/page.tsx:31` lee la variable y, al ser vacía, renderiza: *“A contact address has not been configured for this deployment yet. Until it is, this site cannot receive corrections — please treat the published figures as unverified for now.”* (capturado en `/contact/` del build de producción).
- **Impacto** — (a) el revisor de AdSense ve una web que se desacredita a sí misma; (b) los usuarios no pueden comunicar erratas; (c) contradice el badge “VERIFIED” de las 454 páginas.
- **Solución** — definir `NEXT_PUBLIC_CONTACT_EMAIL=contacto.webproyectos@gmail.com` en `.env.local` (y en el entorno de producción).

### P1-2 · La home enseña rutas que devuelven 404
- **PROBLEMA** — `src/app/page.tsx` (líneas 53, 58, 68), bloque PROCESS, muestra como texto `/states/texas/`, `/states/texas/houston/` (pasos 01, 02 y 04). Verificado: `curl /states/texas/` → **404**; `curl /texas/` → **200**. El paso 03 muestra la ruta correcta (`/texas/houston/building-permit-cost/`), lo que hace el error aún más visible. Captura en el build de producción.
- **Impacto** — credibilidad: el usuario que copia la ruta llega a un 404; el texto “ofrece” una estructura de URL inexistente. No genera errores de rastreo (no son enlaces; crawl: 0 enlaces internos rotos).
- **Solución** — cambiar a `/texas/`, `/texas/houston/` (pasos 01/02/04).

### P1-3 · Las páginas dinámicas no se cachean (0,4–1,1 s en cada visita)
- **PROBLEMA** — VERIFICADO por cabeceras: `/` → `Cache-Control: s-maxage=3600, stale-while-revalidate=31532400`; `/texas/` → `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`. El `export const revalidate = 3_600` de las páginas dinámicas **no tiene efecto** porque las segmentaciones dinámicas no implementan `generateStaticParams` (Next solo aplica ISR a rutas estáticas generadas o a `dynamicParams` con revalidación on-demand). Tiempos del crawl: p50 945 ms, p95 1.072 ms, máx 1.922 ms **por cada petición**.
- **Impacto** — Core Web Vitals (LCP/TTFB) en móvil, coste de compute, UX perceptible en el flujo de revisión de AdSense.
- **Solución** — añadir `generateStaticParams` (los 454 slugs son conocidos y estáticos) para precargar y activar ISR con `revalidate=3600`.

---

## 6. Problemas P2 — IMPORTANTE (antes de solicitar AdSense)

### P2-1 · 50 páginas de estado son thin content
- **PROBLEMA** — media de ~100–131 palabras por hub de estado (`/texas/`, `/pennsylvania/`…), exactamente 1 tabla, 1 H2, **0 enlaces a fuentes externas, 0 marcas de fecha/verificación** (51 páginas sin marcador de fuente = los 50 estados + `/states/`; 57 sin fecha). Evidencia: `.tmp-audit/content-stats.json`.
- **Impacto** — es el principal riesgo de “contenido débil” ante AdSense y ante evaluadores humanos; 50/454 = 11 % del sitio.
- **Qué falta** — contexto específico del estado (cómo se emiten permisos a nivel estatal vs municipal, agencia estatal competente, códigos adoptados, enlaces a fuentes estatales oficiales, fechas de verificación), no relleno genérico.
- **Solución** — enriquecer los 50 con material específico y verificable; nunca con texto repetitivo.

### P2-2 · 9 fuentes oficiales muertas (404 confirmado con GET completo)
- **PROBLEMA** — de 350 fuentes comprobadas: 279 OK en primera pasada; 32 recuperadas (bloqueaban HEAD); **39 siguen fallando**: 9×404 confirmados, 16×403 (anti-bot probable), 13 `fetch failed` + 1 timeout (indeterminados). Lista 404 confirmada:
  1. `https://dhcd.baltimorecity.gov/permits`
  2. `https://www.toledo.oh.gov/business/how-to-build-in-the-city/permits/commercial-building-alteration`
  3. `https://www.annapolis.gov/DocumentCenter/View/3809/FY26-Fee-Schedule-PDF`
  4. `https://www.cityofhuntington.com/business/building-permit-fees/`
  5-7. `fairbanksalaska.us/.../building|electrical|plumbing_permit_fees.pdf` (el dominio migró a `fairbanks.gov` y ahí también 404)
  8. `https://www.warwickri.gov/building-inspection-zoning-enforcement`
  9. `https://www.littlerock.gov/city-government/city-departments/planning-and-development/`
- **Además, “200 pero contenido inválido”**: 2 URLs de Nashville Legistar redirigen a `Error.aspx` (código 200) y Huntsville `huntsvilleal.gov/development/permits/` redirige a una página de *water pollution control permits* (tema ajeno a la fuente citada). Sioux Falls redirige del fee schedule 2025 al 2026 (la fuente citada ya no es el documento enlazado).
- **Impacto** — un revisor de AdSense o un usuario que compruebe la fuente encuentra un 404: daño directo a “transparencia y originalidad”. Los enlaces salientes rotos no son error de Search Console, pero sí de calidad percibida.
- **Solución** — localizar la URL viva nueva (mismo documento) o archivar (`web.archive.org`) y actualizar la tabla `sources`; re-verificar el dato si el documento cambió.

### P2-3 · Sin página de Cookie Policy
- **PROBLEMA** — no existe ruta de política de cookies; `privacy` menciona “cookies” 8 veces, `terms` 0.
- **Impacto** — checklist legal de AdSense (y futura incorporación de cookies de AdSense/analítica).
- **Solución** — añadir `/cookies/` (o una sección explícita en privacy declarando qué cookies se usan/habrán de usarse) — *recomendación, sin modificar nada en esta auditoría*.

### P2-4 · Desbordamiento horizontal en móviles ≤384 px
- **PROBLEMA** — VERIFICADO en navegador: `document.documentElement.scrollWidth` = 367 px fijo. 320 px → clientW 303 (**+64 px**); 360 px → 343 (**+24 px**, el ancho de la inmensa mayoría de Android); 375 px → 358 (**+9 px**); 768 → 0; 1440 → 0. Causa: `details.menu` (y su `nav.menu__panel` de 240 px) anclados con right=367 px — la cabecera no encoge el logo.
- **Impacto** — barra de scroll horizontal en móvil, señal UX negativa, CWV “horizontal overflow”.
- **Solución** — corregir la cabecera (`min-width:0`/flex-shrink en el logo o `right` del menú) y probar a 320/360/375.

### P2-5 · 44 páginas con convención de slug distinta (`-permit-fees` vs `-permit-cost`)
- **PROBLEMA** — 253 URLs usan `X-permit-cost` y **44 usan `X-permit-fees`** (todas de 12 jurisdicciones: bridgeport, new-haven, hilo, honolulu, lewiston, portland-me, provence, warwick, provo, salt-lake-city, burlington, montpelier — exactamente las 12 sin `permit_requirements`). No está documentado en `SEO.md` ni `CONTENT_STRATEGY.md` (grep sin resultados); los slugs se fijan a mano en `src/content/<ciudad>/index.ts`.
- **Impacto** — si no es intencional (keyword research por estado), introduce dos convenciones de URL en el mismo tipo de página; cambiarlo después de indexar exige 301s.
- **Solución** — documentar la intención ahora, o unificar antes de indexar. **NO VERIFICADO: la intención.**

### P2-6 · 6 páginas de permiso sin ninguna tabla de tarifas (y 76 con <4 reglas)
- **PROBLEMA** — 6 páginas publicadas con **0 tablas / 0 filas**: `/mississippi/jackson/{building,electrical,plumbing}-permit-cost/`, `/vermont/burlington/{electrical,plumbing}-permit-fees/`, `/west-virginia/charleston/plumbing-permit-cost/`. Además, 76 páginas con <4 reglas activas y 40 con ≤2. Jackson MS además es la única jurisdicción con 0 fee rules.
- **Matiz importante** — estas 6 páginas son **honestas**: declaran que la ciudad no publica schedule (verificado en el gate editorial y en las notas `needs_review`), no son doorway vacías: tienen 702–1.346 palabras de contexto, fuente y fecha.
- **Impacto** — aun así, son las páginas con menos “tabla que sustituye al contenido”: un evaluador puede percibirlas como poco útiles.
- **Solución** — reforzar con “qué hacer en su lugar” (cómo pedir el schedule al ayuntamiento, teléfono, formulario) en vez de eliminarlas; no recomiendo noindexarlas (responden búsquedas reales “jackson ms building permit cost”).

### P2-7 · `ads.txt` ausente (404)
- **PROBLEMA/CONDICIÓN** — `curl /ads.txt` → 404. **Es esperable**: todavía no hay ID de editor de AdSense ni dominio propio. No es un error de contenido.
- **Solución** — crear `public/ads.txt` con `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0` el día que AdSense asigne el ID (§26).

---

## 7. Mejoras P3 — NO bloquean publicación

| ID | Hallazgo | Evidencia | Acción |
|---|---|---|---|
| P3-1 | Página 404 con **2 metas `<meta name="robots">`** (`noindex` y `noindex, follow`) y `canonical` a `https://permitfees.example/404/` | `curl /this-page-does-not-exist-xyz/` | dejar una sola meta (noindex, follow) y quitar el canonical |
| P3-2 | `/favicon.ico` → 404 y `/manifest.json` → 404 (el favicon real es `icon.svg`, funciona) | `curl` | añadir `favicon.ico` redirigido/simplificado y `manifest.json` (PWAs/búsquedas) |
| P3-3 | 3 títulos <30 caracteres: “About this site \| Permit Fee” (28), “Privacy \| Permit Fee” (20), “Terms of use \| Permit Fee” (25) | `.tmp-audit/sitemap-audit.json` decodificado | ampliar a ~40-55 |
| P3-4 | Sin `loading.tsx` en todo el árbol: navegación a rutas dinámicas espera 0,4–1,1 s sin UI | glob `src/app/**/loading.tsx` → 0 | añadir skeleton (sobre todo tras aplicar P1-3) |
| P3-5 | Sin cabecera CSP (el resto de cabeceras de seguridad sí están) | `curl -I` | añadir CSP; deberá abrirse para `ads.google.com` cuando entre AdSense |
| P3-6 | Scratch de investigación en la raíz (`eng.traineddata` 5,2 MB, `springfield_*`, `como_*`, `lou_form.html`) | `ls` | limpiar antes de cualquier despliegue por carpeta |
| P3-7 | `/TEXAS/HOUSTON/` → 404 (case-sensitive) | prueba de crawl | aceptable; documentado |
| P3-8 | 12 jurisdicciones con 0 `permit_requirements` | query DB | coherente con sus páginas “sin schedule”; mantener |

---

## 8. Páginas thin detectadas

### 8.1 Grupo principal — 50 hubs de estado (gravedad: ALTA)

- **URLs:** `/alabama/` … `/wyoming/` (las 50).
- **Motivo:** ~100–131 palabras, 1 H2, 1 tabla (lista de ciudades), sin fuentes externas, sin fecha de verificación.
- **Qué falta:** texto específico del estado (agencia emisora estatal, códigos adoptados, relación estado/municipio, enlaces oficiales estatales, fecha de verificación), mínimo ~250-400 palabras útiles por estado.
- **Recomendación:** **mejorar, no eliminar** (son la capa de navegación necesaria entre home y ciudades; eliminarlas rompería la arquitectura). No consolidar (cada estado tiene sus ciudades).

### 8.2 Seis páginas de permiso sin tablas (gravedad: MEDIA)

| URL | Palabras | Motivo | Recomendación |
|---|---|---|---|
| `/mississippi/jackson/building-permit-cost/` | 1.346 | Ciudad sin schedule publicado (0 reglas) | Mejorar con “cómo obtener el schedule” (teléfono/formulario) |
| `/mississippi/jackson/electrical-permit-cost/` | 1.124 | ídem | ídem |
| `/mississippi/jackson/plumbing-permit-cost/` | 1.154 | ídem | ídem |
| `/west-virginia/charleston/plumbing-permit-cost/` | 744 | La ciudad no publica tarifas de fontanería (`needs_review` documentado) | Reforzar con pasos alternativos |
| `/vermont/burlington/electrical-permit-fees/` | 720 | sin schedule municipal localizado | ídem |
| `/vermont/burlington/plumbing-permit-fees/` | 702 | ídem | ídem |

No se recomienda eliminarlas ni noindexarlas: responden búsquedas reales y su contenido es veraz. **No son doorway pages** — cada una trata una jurisdicción+permiso concreta y declara su límite.

### 8.3 40 páginas con ≤2 reglas activas (gravedad: BAJA-MEDIA)

Presentes en `content-stats.json`; muchas son ciudades pequeñas con schedules escasos. **Recomendación:** vigilar tras publicar; si el tráfico y la cobertura de datos mejoran, ampliar reglas; no inflar texto.

### 8.4 Ciudad hub más corto

`/alaska/anchorage/` — 478 palabras (mínimo de los 100 hubs de ciudad; media 1.332). Revisar si el hub tiene tablas/fuentes (sí, 1 tabla + fuente + fecha). **Mejora recomendada, no crítica.**

---

## 9. Páginas duplicadas / repetitivas

- **VERIFICADO — 0 títulos duplicados y 0 meta-descripciones duplicadas entre 454 páginas** (crawl decodificando entidades).
- **VERIFICADO — 0 slugs duplicados en DB** (índice único `jurisdiction_permit_pages_slug_uq`) y 0 páginas huérfanas: las 454 URLs del sitemap tienen ≥1 enlace interno entrante (`.tmp-audit/links.cjs`).
- **MEJORA RECOMENDADA — similitud estructural entre hubs de estado:** al compartir plantilla y tener ~100 palabras, los 50 hubs son *textualmente* muy parecidos entre sí (solo cambian nombres y ciudades). Es el punto donde “solo cambia el nombre de la ciudad” más se acerca a ser un problema real. Mitigación: P2-1 (enriquecer cada estado con dato específico propio).
- No se han detectado páginas idénticas ni clústeres de contenido cannibalizado entre sí (`permit-cost` vs `permit-fees` no solapa: jurisdicciones disjuntas).

---

## 10. Problemas de datos

Todos comprobados contra la DB el 2026-09-27/28 con `.tmp-audit/inventory.ts` y `.tmp-audit/future.ts`:

| Comprobación | Resultado | Etiqueta |
|---|---|---|
| Reglas caducadas con status active | **0** | VERIFICADO |
| Reglas activas sin `source_id` | **0** | VERIFICADO |
| Reglas futuras (`effective_from > hoy`) | **30** — todas de Missoula MT, `2026-10-01`, con fuente Resolución 8970 (adoptada 2026-08-17) | VERIFICADO (transición FY2027 diseñada) |
| Reglas que cierran (`effective_to`) | **29**, todas Missoula `2026-10-01` — las sucesoras abren el mismo día: el motor elige por fecha | VERIFICADO |
| Slugs duplicados | 0 | VERIFICADO |
| Huérfanos / FKs rotas | 0 | VERIFICADO |
| URLs de fuentes duplicadas o no-HTTPS | 0 / 0 (350/350 HTTPS) | VERIFICADO |
| Estados/ciudades fuera de lugar (contaminación cruzada) | 0 detectado: cada fee rule lleva su `jurisdiction_id`; los cálculos de página se filtran por jurisdicción+tipo (tests de dominio incluidos en los 2.099) | VERIFICADO (por esquema+tests) |
| Distribución de estados de reglas | 2.591 active / 15 draft (los draft incluyen las disputed: nunca sumadas) | VERIFICADO |
| Verificaciones | 1.013: 991 verified, 19 needs_review, 3 disputed; fechas 2026-09-23→27 | VERIFICADO |
| Matemática de ejemplos (porcentajes, mínimos, máximos, escalones, redondeos) | 2.099 tests (incluye fixtures del motor con asserts centavo a centavo; notas `needs_review` citan verificaciones “in exact cents on all 500 rows”) + revisión visual del worked example de Houston ($400.000 de valoración con fórmulas por tramo) | VERIFICADO por suite; **NO VERIFICADO** exhaustivamente a mano en las 454 páginas |

**3 reglas `disputed` (todas en draft, jamás sumadas — correcto):**
1. Madison WI, fontanería `PLUMB-NEW-GROUP`: MGO 18.09 dice $0,10/ft² vs web de la ciudad $0,11 (Group II).
2. Dallas TX, plan review `PLAN-REVIEW-303`: schedule dice $0,46/ft² vs worksheet $0,046 (los 5 ejemplos del worksheet cuadran con 0,046).
3. Houston TX, `MIN-118.1.3`: mínimo $91,06 (Sec. 118.1.3) vs tarifa plana $47 (Sec. 118.2.1) para valoraciones ≤$7.000.

**19 `needs_review`** con notas largas y honestas (bandas de amperaje ambiguas, escaleras aplicadas a otro gremio, etc.) — esto es una **fortaleza de transparencia**, no un defecto: el límite queda visible en los datos.

**Datos que parecen placeholders/inventados:** **ninguno detectado** — cada importe trae código, condiciones, fuente y fecha; los huecos se declaran (“no published schedule”).

---

## 11. Problemas de fuentes

- **Inventario:** 350 fuentes, 100 % HTTPS, todas con `last_verified_at` entre 2026-09-23 y 2026-09-27 (0 estancadas), 0 duplicadas, 423 enlaces salientes en páginas (prácticamente todos dominios oficiales .gov/.us).
- **Liveness (2 pasadas, HEAD + GET con navegador):** 311/350 OK (88,9 %) · **9 muertas (2,6 %)** · 16 bloqueadas 403 (probable anti-bot: `codelibrary.amlegal.com` ×6, `ecode360` ×2, omaha, provo, rapidcity, casper, rcgov, louisville…) · 14 indeterminadas (timeout/TLS desde esta red: dallascityhall ×3, missoula ×3, hawaiicounty ×2, etc.). Evidencia: `.tmp-audit/urlcheck.json`, `.tmp-audit/urlcheck-confirm.json`.
- **PROBLEMA P2** — las 9 muertas (lista en P2-2).
- **PROBLEMA (contenido, no código)** — 3 redirecciones que cambian el significado: Nashville Legistar ×2 → `Error.aspx` con 200; Huntsville → página de aguas; Sioux Falls → schedule 2026 (¿el citado era 2025?).
- **NO VERIFICADO** — que el dato transcrito aparezca literalmente en el documento para el 100 % de las 350 fuentes. Sí está verificado para las 991 verificaciones `verified` mediante el procedimiento documentado en `methodology` (transcripción + notas por regla), y 22 registros de verificación detallan la lectura exacta.
- **NO VERIFICADO** — contenido de las 16 bloqueadas y 14 indeterminadas desde este entorno (re-verificar desde otra red o CI).

---

## 12. Problemas de vigencia (fechas y ventanas)

- **VERIFICADO — 0 reglas caducadas activas.** El motor usa ventanas `effective_from/effective_to` y `db:verify` lo comprueba.
- **VERIFICADO — transición fiscal de Missoula modelada correctamente:** 29 reglas FY2026 cierran 2026-10-01 y 30 reglas FY2027 (Resolución 8970, adoptada 2026-08-17) abren 2026-10-01. Hoy (2026-09-28) se muestra FY2026; el 1/10 cambiará solo. **Esto es un acierto de diseño** (la web no muestra la tarifa futura como vigente hoy ni la caducada).
- **VERIFICADO — 0 fuentes sin verificar desde 2026-09-01** (mín 2026-09-23, máx 2026-09-27).
- **MEJORA RECOMENDADA — calendario de re-verificación:** todas las verificaciones tienen ≤5 días, pero no se ha encontrado un job automático de caducidad (`fix_stale.ts` existe en `scripts/` — propósito no auditado en profundidad). Recomendación: definir política (p. ej. re-verificación trimestral por jurisdicción) y mostrarla en `methodology`.
- **NO VERIFICADO** — si alguna fuente oficial ha publicado un nuevo FY2027 schedule que aún no esté en la DB (comprobación de contenido contra 350 documentos no realizada).

---

## 13. Problemas SEO

- VERIFICADO — 454/454 canonical **autorreferencial**; 454/454 con `<meta name="robots">` presente; **0 páginas noindex dentro del sitemap**; 0 páginas del sitemap sin 200.
- VERIFICADO — títulos: **0 con >65 caracteres tras decodificar entidades HTML** (las 31 que parecían largas contenían `&amp;`/`&#x27;`; el límite de `composeTitle` funciona). 3 títulos <30 (P3-3).
- VERIFICADO — descripciones: 0 duplicadas; H1 único en 454/454; `og:url` correcto en 454/454; JSON-LD 0 inválidos / 0 ausentes (WebPage, BreadcrumbList, FAQPage — las FAQs del JSON-LD coinciden con el texto visible —, Organization, WebSite).
- VERIFICADO — redirecciones: `/texas` → 308 → `/texas/`; `//texas//houston//` → 308 → canónico; HTTPS y trailing slash consistentes en las 454.
- PROBLEMA P3 — 404 con doble meta robots y canonical a `/404/` (P3-1).
- PROBLEMA P3 — `favicon.ico` y `manifest.json` 404 (P3-2).
- MEJORA — convención mixta de slugs `permit-cost`/`permit-fees` sin documentar (P2-5).

---

## 14. Problemas Search Console

- **VERIFICADO — la estructura es compatible:** sitemap 454 URLs sanas, robots con directiva `Sitemap:`, 0 enlaces internos rotos, 0 huérfanas, 0 redirect chains internas, canonical consistentes.
- **PROBLEMA potencial (UX/posicionamiento, no error técnico):** desbordamiento móvil (P2-4) y TTFB dinámico 0,4–1,1 s (P1-3) pueden degradar señales de experiencia.
- **No hay** enlaces internos a `/states/...` (el error de la home es texto plano) → **no generarán “Errores de página” 404 en GSC**.
- **Pendiente por dominio (§30.H):** propiedad GSC, sitemap real, canonical de dominio real (hoy `permitfees.example`).
- **NO VERIFICADO** — informe de cobertura real de GSC (el sitio aún no está publicado).

---

## 15. Problemas AdSense

Enumerados con honestidad (sin blanquear):

1. **PROBLEMA P1** — `/contact/` dice literalmente “treat the published figures as unverified” (P1-1). Un revisor leyendo la home→contacto desacredita todo el sitio.
2. **PROBLEMA P2** — 50 hubs thin (11 % de páginas) — el riesgo de contenido débil número uno.
3. **PROBLEMA P2** — 9 fuentes oficiales muertas: los revisores suelen abrir 2-3 fuentes; si caen, cae la “originalidad y utilidad”.
4. **PROBLEMA P2** — sin Cookie Policy.
5. **PROBLEMA P2 (esperable)** — `ads.txt` ausente hasta tener ID.
6. **PROBLEMA P3** — favicon.ico/manifest 404 (señal de “sitio acabado”).
7. **Fortalezas a favor** (verificadas): contenido original que no existe igual en Google (transcripciones + motor de cálculo + fechas + fuentes); 297 páginas de gran profundidad (media 2.120 palabras); 0 doorway; 0 copias; navegación clara; política editorial visible en `methodology`.
8. **NO VERIFICADO** — la revisión humana de AdSense (imposible de predecir); el texto anterior describe riesgos objetivos, no garantías.

---

## 16. Problemas legales

- VERIFICADO — `/privacy/`, `/terms/`, `/about/`, `/contact/` existen, renderizan 200 y contienen texto propio.
- PROBLEMA P2 — sin Cookie Policy mientras privacy habla de cookies 8 veces (P2-3).
- PROBLEMA P1 — contacto sin canal real (P1-1).
- MEJORA — `terms` no menciona cookies ni límites de responsabilidad sobre el uso de las tarifas como estimación (revisar cláusula de “sin garantía”); **NO VERIFICADO** la suficiencia jurídica formal de los textos (requiere asesoría legal; esta auditoría no es asesoramiento jurídico).

---

## 17. Problemas UX

Flujo real simulado en navegador (build de producción INDEXABLE, 2026-09-28):

| Paso | Resultado | Etiqueta |
|---|---|---|
| 1. Entender la web al llegar | Hero claro: “What a permit costs, from the city’s own fee schedule” + cifras 50/100/297 | VERIFICADO |
| 2. Elegir ubicación | Home → “Find your state” → `/states/` con mapa y lista → estado → ciudad | VERIFICADO |
| 3. Encontrar un permiso | Hub de ciudad lista sus páginas de permiso; 0 enlaces rotos en el sitio | VERIFICADO |
| 4. Cuánto cuesta | Tabla de componentes con importes/condiciones (vista en Houston building) | VERIFICADO |
| 5. Cómo se calcula | Columna FORMULA + bloque “A worked example” con inputs y aritmética paso a paso | VERIFICADO |
| 6. Comprobar la fuente | Badges “OFFICIAL FEE SCHEDULE” + sección de fuentes con enlaces oficiales | VERIFICADO |
| 7. Cuándo se verificó | “VERIFIED SEP 2026” + “SCHEDULE AS OF 2026-09-28” | VERIFICADO |
| 8. Continuar | Breadcrumbs + enlaces a otros permisos de la ciudad | VERIFICADO |
| **FALLO** | Home muestra rutas `/states/...` 404 (P1-2); contacto sin email (P1-1) | PROBLEMA |
| Espera de navegación | 0,4–1,1 s sin indicador (`loading.tsx` ausente) | PROBLEMA P3 |
| Consola del navegador | **0 mensajes, 0 errores** en home, `/states/`, permiso, contacto | VERIFICADO |

---

## 18. Problemas responsive

Medido con `getBoundingClientRect`/`scrollWidth` en el build de producción:

| Viewport | clientW | scrollW | Overflow | Etiqueta |
|---|---|---|---|---|
| 320 px | 303 | 367 | **+64 px** | PROBLEMA |
| 360 px | 343 | 367 | **+24 px** | PROBLEMA |
| 375 px | 358 | 367 | **+9 px** | PROBLEMA |
| 768 px | 751 | 751 | 0 | VERIFICADO |
| 1440 px | 1423 | 1423 | 0 | VERIFICADO |

- Causa raíz identificada: `details.menu` (botón “Menu” de la cabecera, clase `sm:hidden`) tiene `getBoundingClientRect().right = 367` fijo, y su panel `nav.menu__panel` (240 px, absolute) también; el logo no encoge. Afecta a **todas** las páginas (layout global).
- Tablas anchas: con scroll interno correcto, sin overflow de página a ≥768 px.
- `viewport` meta correcto (`width=device-width, initial-scale=1`).
- **NO VERIFICADO:** comportamiento táctil real, landscape, y zoom 200 % (WCAG 1.4.4).

---

## 19. Problemas performance

- VERIFICADO — estáticas: home 4 ms, `/states/` 5 ms (warm, gzip), `Cache-Control: s-maxage=3600, stale-while-revalidation`.
- **PROBLEMA P1** — dinámicas: `private, no-cache, no-store` en cada respuesta; 0,4–1,1 s por petición (p50 945 / p95 1.072 / máx 1.922 ms); el ISR declarado no aplica sin `generateStaticParams` (P1-3).
- PROBLEMA P3 — sin `loading.tsx` durante esas esperas.
- NO VERIFICADO — Lighthouse/CWV de campo (el sitio no está publicado); valores de laboratorio solo.

---

## 20. Problemas de seguridad

- VERIFICADO — cabeceras en respuestas reales: `X-Content-Type-Options: nosniff` · `X-Frame-Options: DENY` · `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` · `Referrer-Policy: strict-origin-when-cross-origin` · `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`.
- VERIFICADO — `.env.local` en `.gitignore`; variables de servidor (DB) no expuestas al cliente (build con `NEXT_PUBLIC_*` revisado).
- VERIFICADO — robots desautoriza `/api/` y `/admin/` (aunque no existen rutas reales de esas áreas hoy).
- MEJORA P3 — sin CSP (habrá que abrirla para AdSense: `https://ads.google.com`, `https://pagead2.googlesyndication.com`, etc.).
- NO VERIFICADO — pentest/audit de dependencias (`npm audit` no ejecutado en esta auditoría), rate-limiting (no aplica: sin APIs públicas).

---

## 21. Herramientas/calculadoras potenciales (que aporten valor real)

1. **Calculadora interactiva por ciudad** (recomendada — mayor impacto): introducir valoración de obra + tipo → total con desglose. El motor (`src/lib/calc`) y las condiciones ya existen y están testadas; hoy el worked example es estático. Convierte 297 páginas en herramientas.
2. **Comparador “mismo proyecto, dos ciudades”** (segunda prioridad): p. ej. casa unifamiliar de $250k en Houston vs Dallas con las fuentes de cada una. Aporta lo que el usuario ya hace a mano.
3. **Rastreador de cambios de tarifas** (“qué cambió desde tu última visita”, RSS/`what's new`): refuerza el diferencial de frescura (solo si se automatiza la re-verificación, §12).

No recomiendo ninguna otra hasta que las tres anteriores (o la primera) estén hecha: el valor está en los datos, no en más superficie.

---

## 22. Funcionalidades que NO merece la pena añadir

- **Blog con artículos genéricos** (“what is a building permit”) — competencia saturada, riesgo de contenido IA percibido, diluye el foco.
- **Comentarios/foros/cuentas de usuario** — coste de moderación y spam enorme para un sitio de datos.
- **Multi-idioma** — las fuentes y el público son US; traducción artificial no aporta.
- **PDFs descargables de cada página** — sin demanda demostrada; coste de mantenimiento.
- **Expandir a counties/states nuevos sin schedule real** — iría contra el principio editorial del sitio (puerta de puerta).
- **Pop-ups, newsletters emergentes, chatbots** — perjudican UX y revisión de AdSense.
- **Precios medios/estimaciones “aproximadas”** — destruiría la propuesta de valor (el sitio existe precisamente para no inventar cifras).

---

## 23. Checklist pre-publicación (antes de poner `INDEXABLE=true` y apuntar el dominio)

- [ ] **P1-1** — `NEXT_PUBLIC_CONTACT_EMAIL=contacto.webproyectos@gmail.com` en `.env.local` y en producción → verificar `/contact/` muestra el mailto.
- [ ] **P1-2** — corregir rutas del bloque PROCESS en `src/app/page.tsx` (líneas 53/58/68) → verificar que el texto muestra `/texas/` y `/texas/houston/`.
- [ ] **P1-3** — `generateStaticParams` (o ISR on-demand) en las rutas dinámicas → verificar `Cache-Control` cacheable y TTFB <200 ms en `/texas/`.
- [ ] **P2-4** — corregir cabecera móvil → verificar `scrollWidth == clientWidth` a 320/360/375 px.
- [ ] **P2-2** — reemplazar/actualizar las 9 fuentes 404 + Nashville Legistar ×2 + Huntsville + Sioux Falls.
- [ ] **P2-1** — plan de enriquecimiento de los 50 hubs de estado (mínimo: fuente oficial estatal + fecha + contexto específico).
- [ ] **P2-3** — página/sección de Cookie Policy.
- [ ] **P2-5** — decidir y documentar la convención `permit-cost` vs `permit-fees`.
- [ ] **P1/P3** — limpiar scratch de la raíz (`eng.traineddata`, `springfield_*`, `como_*`, `lou_form.html`).
- [ ] P3-1 (metas de la 404), P3-2 (favicon/manifest), P3-3 (3 títulos cortos), P3-4 (`loading.tsx`).
- [ ] Re-ejecutar: `npm run check` (EXIT 0), `npm run db:verify` (EXIT 0), `next build` (EXIT 0), crawl 454×200.

## 24. Checklist post-dominio

- [ ] Comprar dominio y apuntar DNS + HTTPS.
- [ ] `NEXT_PUBLIC_SITE_URL=https://<dominio>` y **`NEXT_PUBLIC_SITE_INDEXABLE="true"`**.
- [ ] Reconstruir y verificar: `robots.txt` muestra `Host: <dominio>` + `Sitemap: https://<dominio>/sitemap.xml`; sitemap con 454 URLs del dominio real.
- [ ] Verificar canonical = dominio real en las 454.
- [ ] `public/ads.txt` con el ID de AdSense (§26).
- [ ] Redirección 301 global desde cualquier dominio antiguo (si aplica).
- [ ] Limpieza de `permitfees.example` en metadatos y content (grep) → 0 apariciones.
- [ ] GSC + sitemap (§25).

## 25. Checklist Search Console

- [ ] Añadir propiedad (prefijo de URL `https://<dominio>/`), verificar (DNS o meta).
- [ ] Enviar sitemap `https://<dominio>/sitemap.xml` → esperar “Descubierto” sin errores.
- [ ] Revisar “Cobertura” a los 7 días: 0 errores, páginas indexadas ≈ 454.
- [ ] “Inspección de URL” de `/`, `/texas/`, `/texas/houston/building-permit-cost/` → “Puede indexarse”.
- [ ] Core Web Vitals: vigilar TTFB de rutas dinámicas (post P1-3).
- [ ] “Problemas de manual actions”: 0.
- [ ] Buscar `site:<dominio>` a los 7-14 días.

## 26. Checklist AdSense

- [ ] Todos los P1 y P2 de §23 resueltos (especialmente contacto, fuentes muertas, hubs thin, cookies).
- [ ] Contenido legal completo: privacy, terms, about, **cookies**, contacto funcional.
- [ ] Calidad por página: 0 páginas sin H1/fuente/fecha (verificado), hubs de estado mejorados.
- [ ] `ads.txt` con `google.com, pub-…, DIRECT, f08c47fec0942fa0`.
- [ ] Solicitar ingreso en AdSense **desde el dominio real**.
- [ ] Colocar el script de AdSense (abrir CSP, §20) en `layout` cuando se apruebe.
- [ ] Esperar revisión; si rechaza por “contenido thin”, reforzar los 50 hubs (P2-1) y re-solicitar.
- [ ] Tras aprobación: configurar anuncios respetuosos (sin above-the-fold intrusivo; sitio es tabular → evitar romper tablas con anuncios inline).

---

## 27. Verificación final de rutas

**Etiqueta global: VERIFICADO** (build con `INDEXABLE=true`, 2026-09-28, `.tmp-audit/crawl.cjs`)

| Comprobación | Resultado |
|---|---|
| 454 rutas del sitemap responden | **454/454 → 200** |
| Rutas estáticas (home, states, about, contact, methodology, privacy, terms) | 200 |
| Rutas dinámicas (50 estados, 100 ciudades, 297 permisos) | 200 |
| 3 páginas draft/noindex fuera del sitemap | VERIFICADO (no aparecen) |
| Redirect trailing slash (`/texas` → `/texas/`) | 308 → 200 |
| Doble slash (`//texas//houston//`) | 308 → canónico |
| 404 inexistente | renderiza `not-found` con noindex (reparos P3-1) |
| `/favicon.ico`, `/manifest.json`, `/ads.txt` | 404 (P3-2 / P2-7) |
| Errores de consola | 0 |

## 28. Verificación final de sitemap

**Etiqueta global: VERIFICADO**

- `curl /sitemap.xml` (INDEXABLE=true): **454 `<loc>`**; todos HTTPS, con trailing slash, 0 noindex, 0 sin 200, 0 duplicados.
- Con `INDEXABLE=false` (modo actual del proyecto): sitemap devuelve **URL set vacío** — VERIFICADO en servidor dev :3000.
- `npm run db:verify` (EXIT 0) confirma que los criterios de inclusión del sitemap coinciden con las rutas servidas (297 páginas publicadas + 100 hubs + 50 estados + 7 estáticas/directorio).

## 29. Verificación final de robots

**Etiqueta global: VERIFICADO**

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Host: permitfees.example
Sitemap: https://permitfees.example/sitemap.xml
```

- Modo INDEXABLE=true: el texto anterior (comprobado por curl).
- Modo INDEXABLE=false (estado actual): `Disallow: /` y sitemap vacío — la web noindexada mientras no se publique. VERIFICADO.
- `Host:` y `Sitemap:` apuntan al placeholder `permitfees.example` — correcto hasta el cambio de dominio (§24).

---

## 30. Conclusión — decisión de publicación

### A. ¿Listo técnicamente para publicar?
**CONDICIONADO.** El build, crawl, tests, DB, sitemap y robots están en verde (evidencias en §4, §27-29). Condición: resolver P1-1 (email), P1-2 (rutas 404 de la home) y P1-3 (cacheo). P2-4 (móvil) debería resolverse el mismo día.

### B. ¿Listo para comenzar la indexación?
**CONDICIONADO.** Estructuralmente sí (454 URLs sanas, canonical, robots, sitemap, 0 enlaces rotos). Requiere: dominio real + `INDEXABLE=true` + envío en GSC + los P1 resueltos (indexar una home con rutas 404 de texto y un contacto que dice “sin verificar” es contraproducente).

### C. ¿Contenido que deba mejorarse antes?
- **Los 50 hubs de estado** (`/alabama/` … `/wyoming/`): ~100-131 palabras → enriquecer con dato estatal específico, fuente oficial y fecha (P2-1).
- **Las 6 páginas sin tablas** (jackson ×3, burlington ×2, charleston-wv plumbing): añadir “cómo obtener el schedule” (P2-6).
- `/alaska/anchorage/` (478 palabras) y las 40 páginas con ≤2 reglas: vigilar.
- **Nunca** con texto genérico: si no hay dato específico, el hueco honesto actual es mejor que el relleno.

### D. ¿Páginas a eliminar/noindexar?
**Ninguna.** Las 3 draft/noindex (lincoln plumbing, houston demolition, houston mechanical) ya están correctamente fuera. No se han detectado doorway pages ni duplicados. Las 6 páginas sin schedule **responden búsquedas reales y declaran su límite: mantener**.

### E. ¿Falta alguna herramienta importante?
Solo dos con valor real (§21): (1) **calculadora interactiva** por ciudad sobre el motor existente; (2) **comparador entre ciudades**. Nada más ahora.

### F. Problemas que puedan causar errores en Search Console
1. TTFB 0,4–1,1 s en dinámicas → posible CWV “LCP/TTFB” en rojo (P1-3).
2. Overflow horizontal en móvil → UX/CWV (P2-4).
3. Tras publicar, si algún enlace saliente se confunde… no aplica: **0 enlaces internos rotos y 0 huérfanas** verificados → no habrá errores 404 en GSC por estructura interna (el error de la home es texto, no enlace).
4. Sitemap/canonical apuntando a `permitfees.example` si se indexa antes del cambio de dominio → evitar con §24.

### G. Algo que perjudique la calidad percibida para AdSense
1. El texto de contacto: “treat the published figures as unverified” (P1-1) — el mayor daño potencial.
2. 50 hubs thin = 11 % de páginas (P2-1).
3. Fuentes oficiales que caen al hacer clic (9×404 + 3 redirecciones inválidas) (P2-2).
4. Sin Cookie Policy (P2-3).
5. Desbordamiento móvil y carga lenta en dinámicas (P2-4, P1-3).
6. `favicon.ico`/`manifest.json` 404 — impresión de sitio inacabado (P3-2).

### H. Qué queda pendiente SOLO por no tener todavía el dominio
Separado con claridad:
1. `NEXT_PUBLIC_SITE_URL` real y `NEXT_PUBLIC_SITE_INDEXABLE="true"` (hoy `false` **a propósito**).
2. Canonical, `Host:` y `Sitemap:` del robots con el dominio real (hoy `permitfees.example`).
3. `public/ads.txt` con el ID de AdSense.
4. Propiedad de Search Console + envío de sitemap + `site:` indexing.
5. Certificado HTTPS y 301 global si hay dominio anterior.
6. Script de AdSense (y apertura de CSP) tras aprobación.

**Nada de esto es un defecto del producto** — todo lo estructural ya está verificado.

---

### Límites de esta auditoría (NO VERIFICADO — por transparencia)

- Lighthouse/CWV de campo, axe/contraste/teclado/screen-reader completos (solo revisión básica de a11y: `lang`, skip-link, H1, jerarquía, labels — todo OK).
- Que cada uno de los 350 documentos contenga literalmente el dato transcrito (verificado en las 991 verificaciones `verified` por el procedimiento del proyecto, no reproducido íntegramente).
- 16 fuentes bloqueadas anti-bot y 14 indeterminadas de red (re-verificar desde otra red).
- Revisión humana de AdSense y asesoría jurídica formal.
- Comportamiento bajo carga concurrente y coste de Neon a tráfico real.

**Artefactos de evidencia (todos en `.tmp-audit/`, temporales):** `inventory.log`, `sitemap-audit.json`, `content-stats.json`, `urlcheck.json`, `urlcheck-confirm.json`, `build.log`, `crawl.cjs`, `links.cjs`, `content.cjs`, capturas de navegador (home, `/states/`, `/texas/houston/building-permit-cost/`, `/contact/`, 320-1440 px).

**Fin de la auditoría. No se ha modificado ningún archivo del producto.**
