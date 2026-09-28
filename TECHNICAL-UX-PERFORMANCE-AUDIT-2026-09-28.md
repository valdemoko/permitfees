# TECHNICAL-UX-PERFORMANCE-AUDIT-2026-09-28

**Proyecto:** Permit Fee Intelligence
**Fecha:** 2026-09-28
**Alcance:** funcionamiento, estabilidad, errores, UX, responsive, rendimiento, accesibilidad, seguridad, arquitectura, APIs, base de datos (runtime), experiencia real.
**Fuera de alcance (auditorías paralelas):** calidad editorial, revisión de fuentes, SEO on-page, AdSense/contenido.

> **Regla aplicada:** `VERIFICADO — evidencia` / `PROBLEMA — evidencia — impacto — recomendación` / `NO VERIFICADO`.
> No se ha modificado ningún archivo del producto. Los scripts de diagnóstico se crearon en `/tmp` (fuera del proyecto) y **fueron eliminados al terminar**. Servidores de prueba (puertos 3000 y 3005) **detenidos**.
> Único artefacto nuevo: este informe.

---

## 1. Resumen ejecutivo

- **BUILD: OK** — `next build` (Next 16.3.6 / Turbopack) compila en 3.9 s + TS 6.2 s, genera 12 páginas estáticas, **0 errores y 0 warnings**.
- **TYPESCRIPT: OK** — `tsc --noEmit` exit 0, 0 errores con `strict` + `noUncheckedIndexedAccess`.
- **TESTS: OK** — 112 archivos / **2099 tests: 2099 passed, 0 failed, 0 skipped** (19.9 s), incluidas 4 suites de integración contra PostgreSQL real.
- **CRAWL: 457/457 rutas 200** (7 estáticas + robots/sitemap/icon + 50 estados + 100 ciudades + 297 páginas de permiso). **33 rutas inválidas → 404 correctos. 0 × 500.**
- **Estabilidad:** test de carga local 120 peticiones / 10 concurrentes → **120 × 200, 0 errores, avg 0.90 s, máx 1.62 s.**
- **Problemas reales detectados:** 3 P1, 9 P2, 7 P3. **0 P0.**

El sitio **funciona**: nada se rompe, nada devuelve 500, nada tiene stack trace, no hay errores de consola ni de hidratación. Los problemas están en **rendimiento de las rutas de datos (caché ISR que no se aplica)**, en el **comportamiento ante caída de la base de datos (404 masivo)** y en **tres defectos visibles de UX** (header desbordado en 320/360 px, rutas falsas en la home, texto ilógico en el directorio).

---

## 2. Arquitectura

| Capa | Tecnología | Versión | Evidencia |
|---|---|---|---|
| Framework | Next.js App Router (Turbopack) | 16.3.6 | `package.json`, salida de build |
| React | React | 19.3.0 | `package.json` |
| Lenguaje | TypeScript `strict` + `noUncheckedIndexedAccess` | 5.9.3 | `tsconfig.json` |
| Estilos | CSS propio en `globals.css` (2715 líneas) + Tailwind 4.3.3 (postcss) | 4.3.3 | `src/app/globals.css`, `postcss.config.mjs` |
| DB | PostgreSQL (Neon) vía Drizzle ORM + `@neondatabase/serverless` (driver HTTP stateless) | 0.45.3 / 1.1.0 | `src/lib/db/client.ts` |
| Validación | Zod | 4.6.5 | `src/lib/env.ts`, `src/lib/calc/schemas.ts` |
| Tests | Vitest | 5.0.1 | `vitest.config.ts` |
| Hosting | **Sin `vercel.json`, sin `.vercel`** → despliegue Vercel por defecto | — | `ls vercel.json` → no existe |
| Node | `engines >=20.9.0` (ejecutado con v24.14.1) | — | `package.json` |

**Estructura real:**

- **Rutas:** 7 estáticas (`/`, `/states`, `/methodology`, `/about`, `/contact`, `/privacy`, `/terms`) + 3 dinámicas (`/[state]`, `/[state]/[city]`, `/[state]/[city]/[permit]`) + `robots.ts` + `sitemap.ts`.
- **Sin API routes** (`find src -name route.ts` → 0). **Sin middleware** (0). **Sin `loading.tsx`** (0). **Un solo `error.tsx`** (raíz).
- **4 componentes client** de 37 `.tsx`: `app/error.tsx`, `layout/brand-link`, `layout/site-nav`, `map/map-interaction`. El resto es servidor.
- **Capa de datos:** `src/lib/db/queries.ts` (665 líneas), todas las queries envueltas en `safeQuery` con fallback. Todas las queries son **lectura** (el sitio no escribe en DB).
- **Motor de cálculo:** `src/lib/calc/*` (engine, money, conditions, schemas) con 14 suites de tests propias.
- **Contenido:** directorios `src/content/<ciudad>/` con `index.ts` + `fee-rules.ts` (seeds; la web renderiza desde la DB, no desde estos archivos).
- **Servicios externos en runtime:** ninguno bloqueante (ver §33).
- **Variables de entorno:** `.env.local` presente (no versionado), `.env.example` como plantilla.

**VERIFICADO — arquitectura server-first, sin dependencias externas en runtime, sin superficie de API.**

---

## 3. Build

`rm -rf .next && npm run build`:

```
✓ Compiled successfully in 3.9s
✓ Running TypeScript ... Finished in 6.2s
✓ Generating static pages (12/12) in 854ms
○ / (Revalidate 1h)  ○ /about ○ /contact ○ /methodology ○ /privacy ○ /terms
○ /states (Revalidate 1h)  ○ /robots.txt  ○ /sitemap.xml (Revalidate 1h)
ƒ /[state]  ƒ /[state]/[city]  ƒ /[state]/[city]/[permit]
BUILD_EXIT:0
```

- Errores: **0**. Warnings relevantes: **0**.
- Server/client boundaries: correctos (`server-only` en `env.ts`, `db/client.ts`, `db/queries.ts`; build comment indica que detecta fugas).
- Prerender: 12 estáticas OK; las 3 dinámicas SSR on-demand.
- Metadata/assets: sin errores de metadata en build.

**Observación (importante, ver §27):** la columna *Revalidate* **solo aparece en `/`, `/states` y `/sitemap.xml`**. Las tres rutas dinámicas **no muestran revalidate** a pesar de declarar `export const revalidate = 3_600`.

**BUILD OK — PERO la ISR prometida en las rutas de datos no se está aplicando (P1, §27).**

---

## 4. TypeScript

- `npm run typecheck` → **exit 0, 0 errores**.
- Configuración exigente: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`.
- No se detectaron `any` implícitos ni `@ts-ignore` en el camino crítico (queries, rutas, motor de cálculo).
- Riesgos de `null/undefined` gestionados explícitamente: `getDb(): Database | null`, `?? null` en todas las lecturas de fila, `row ?? null`.

**VERIFICADO — typecheck limpio.**

---

## 5. Tests

```
Test Files  112 passed (112)
Tests       2099 passed (2099)
Failed      0    Skipped 0    Duration 19.91s
```

- Suites de **integración con PostgreSQL real**: `houston`, `dallas`, `phoenix`, `scottsdale` (migración, seed, reglas almacenadas, páginas publicadas, sitemap, gate editorial) — **todas pasan**.
- Suites de **cálculo**: 14 archivos (money, minimums, rate tables, per-thousand, rounding…).
- Suites de **contenido/seed**: ~70 archivos.
- Suites de **SEO/gates**: `metadata`, `robots`, `slugs`, `status-codes`, `urls`, `editorial/gate`.
- Suites de **seguridad**: `tests/lib/security.test.ts` (redacción de secretos) — pasa.

**Áreas sin cobertura (importante):**

- **0 tests de componente/UI** (no hay React Testing Library ni Playwright).
- **0 tests de ruta/HTTP** (nadie verifica que `/texas/` devuelva 200 o que `/no-existe/` devuelva 404 en el servidor real).
- **0 tests de responsive, accesibilidad ni rendimiento.**
- Fragilidad: las suites de integración dependen de una DB Neon viva (`tests/setup-env.ts` la carga desde `.env.local`); en CI sin credenciales **se saltarán sin fallar**, dando una falsa sensación de verde.

**VERIFICADO — 2099/2099. COBERTURA DE UI/RUTAS/RENDER: NO VERIFICADO (no existen).**

---

## 6. Crawl funcional

Recorrido completo sobre `next start` (producción), descubriendo URLs desde `/states/` → estados → ciudades → permisos:

| Grupo | Nº | Resultado |
|---|---|---|
| Estáticas (`/`, `/states/`, `/methodology/`, `/about/`, `/contact/`, `/privacy/`, `/terms/`) | 7 | **7 × 200** |
| `robots.txt`, `sitemap.xml`, `icon.svg` | 3 | **3 × 200** |
| Estados `/[state]/` | 50 | **50 × 200** |
| Ciudades `/[state]/[city]/` | 100 | **100 × 200** |
| Permisos `/[state]/[city]/[permit]/` | 297 | **297 × 200** |
| **Total** | **457** | **457 × 200 — 0 errores funcionales** |

Contenido verificado por muestreo: H1 único por página, breadcrumbs, tablas con `caption`, JSON-LD (5 bloques en la página de permiso), canonical, badges de verificación, cifras monetarias presentes.

**Nota (configuración, no bug):** con `NEXT_PUBLIC_SITE_INDEXABLE="false"`, `robots.txt` devuelve `Disallow: /` y `sitemap.xml` devuelve un `urlset` vacío (0 URLs). Es el comportamiento **diseñado** para despliegues no indexables (`src/app/robots.ts`, `src/app/sitemap.ts`). No se ha tocado.

**No existen** rutas de categorías, guías, herramientas, blog ni cookie-policy (`find` → 0). El 404 es real y enlaza a salida.

**CRAWL OK — 457/457.**

---

## 7. Errores de consola

Durante la navegación real (home → directorio → estado → ciudad → permiso):

- `console.error`: **0**
- `console.warn`: **0**
- Errores de hidratación / React: **0**
- Failed resources (JS/CSS/fuentes): **0**
- Errores de API/CORS: **0** (no hay APIs ni peticiones cross-origin)
- Único hallazgo: peticiones RSC de *prefetch* abortadas → `net::ERR_ABORTED` (decenas, ver §8). **Clasificación: benigno** (abortadas por el router al navegar; no son errores de red reales).

**VERIFICADO — consola limpia. Clasificación: 0 críticos, 0 importantes, 1 benigno.**

---

## 8. Network

- **Códigos 4xx/5xx en el recorrido:** ninguno sobre recursos del propio sitio.
- **`/favicon.ico` → 404** (no existe; solo `app/icon.svg`). Los navegadores lo piden por defecto. **P3.**
- **Prefetch masivo en `/states/`:** la página tiene 218 enlaces internos; en una sola carga se emitieron **~40+ peticiones `?_rsc=` de ~1.4 KB con duraciones de 251–924 ms** (70 recursos en total). Son prefetches del router de Next hacia rutas dinámicas. **No es un loop**, pero sí tráfico innecesario y carga al servidor/DB. **P2.**
- **Requests duplicadas/colgantes:** ninguna; ninguna superó el timeout de 30 s.
- **Imágenes:** ninguna (no hay `<img>` ni assets en `public/`).
- **Fuentes:** 4 preloads de woff2, todas 200.
- **Scripts externos:** ninguno.

**VERIFICADO — sin errores de red funcionales. PREFETCH EN DIRECTORIO: P2 (volumen).**

---

## 9. Base de datos — runtime

**Conexión y cliente**

- `@neondatabase/serverless` HTTP (**stateless**): no mantiene pool, correcto para plan gratuito y para serverless (`src/lib/db/client.ts`).
- Cliente memoizado por proceso (`cachedClient`), creado en primera uso.
- `getDb()` devuelve `null` si no hay `DATABASE_URL` → todo degrada.

**Manejo de errores**

- **Todas** las queries pasan por `safeQuery(label, run, fallback)` → `catch` + `logSafeError` (redacción de secretos) + fallback. **Ninguna query puede provocar un 500.**
- `redactSecrets()` elimina connection strings, passwords y tokens antes de loguear (`src/lib/errors.ts`, con test propio).

**N+1 / consultas repetidas**

- **No hay N+1.** Los listados usan `Promise.all` con 2–3 queries y agrupan en JS (`listStateDirectory`, `listJurisdictionSummaries`). Los `permitPageCount` se resuelven con **una sola query** de todas las páginas publicadas, no por ciudad.
- Por página: estado = 2 queries; ciudad = 4; permiso = 4 + 1 opcional (`inArray` de fuentes). Sin bucles sobre filas.

**Comportamiento con datos ausentes (pruebas reales)**

| Caso | Comportamiento | Veredicto |
|---|---|---|
| Estado inexistente | `getStateBySlug → null → notFound()` → **404** | VERIFICADO |
| Ciudad inexistente | `getJurisdictionContext → null → notFound()` → **404** | VERIFICADO |
| Permiso inexistente | `getPermitPageDetail → null → notFound()` → **404** | VERIFICADO |
| Jurisdicción sin páginas de permiso | `permitPages.length === 0` → mensaje propio en la hub | VERIFICADO |
| Sin fuentes (`sourceIds` vacío) | `sources: []`, secciones omitidas sin romper | VERIFICADO |
| Sin tarifas activas / horario expirado | `totalRuleCount` distinto del activo → gate editorial distingue "expired" de "no publicado" | VERIFICADO (código + tests) |
| `example` JSONB corrupto | `parseWorkedExample` → `null`, se omite la sección | VERIFICADO |
| **DB caída / inaccesible** | **`safeQuery` → fallback `null/[]` → TODAS las rutas de datos devuelven 404** | **PROBLEMA (P1, §11)** |

**Simulación real de caída** (servidor de diagnóstico con `DATABASE_URL` apuntando a un puerto muerto):

```
/                       → 200  (ISR HIT, caché)
/states/                → 200  (ISR HIT, caché)
/texas/                 → 404  ← página existente devuelta como inexistente
/texas/houston/building-permit-cost/ → 404  ← idem
/about/                 → 200  (estática)
Log servidor: [db] (query "getStateBySlug" failed) … redactado, sin credenciales
```

**No hay transacciones** (solo lecturas). **Concurrencia:** sin pool ni estado, sin bloqueos posibles.

**Veredicto DB runtime:**

- Queries, errores, degradación, ausencia de N+1: **VERIFICADO — correcto.**
- **Caída de DB → 404 masivo: PROBLEMA — evidencia arriba — impacto (Google puede deindexar páginas existentes durante un incidente; el usuario ve "no existe" en vez de un error recuperable; `error.tsx` queda inalcanzable) — recomendación: distinguir "dato ausente" (404) de "fallo de lectura" (error/503 + reintento), por ejemplo con un resultado tipado `NotFound | Error` en `safeQuery`.**

---

## 10. APIs

**No existen endpoints.** `find src -name "route.ts"` → 0. `/api/*`, `/health`, `/admin`, `/search` → **404** (además están en `RESERVED_ROOT_SLUGS`, así que ninguna ruta dinámica puede capturarlos).

Métodos HTTP probados:

| Petición | Resultado | Veredicto |
|---|---|---|
| `POST /` | 405 | Correcto |
| `DELETE /states/` | 405 | Correcto |
| `OPTIONS /` | 405 | Correcto |
| **`PUT /texas/`** | **200 (renderiza la página)** | **P3 — los métodos no-GET no se rechazan en rutas dinámicas** |

- Autenticación/validación/parámetros: **N/A**.
- Payloads gigantes, IDs inválidos, SQL injection: **sin superficie** (no hay endpoints que acepten entrada).
- No se expone stack trace ni información sensible en ninguna respuesta (verificado en 33 cuerpos 404 y 457 cuerpos 200: 0 coincidencias de `Error:` / `at … (`).

**VERIFICADO — sin APIs. Anomalía menor: `PUT` → 200 (P3).**

---

## 11. Rutas dinámicas

| Caso | URL | Resultado esperado | Real |
|---|---|---|---|
| Estado válido | `/texas/` | 200 | **200** |
| Estado inexistente | `/not-a-state/`, `/zzzz/` | 404 | **404** |
| Ciudad válida | `/texas/houston/` | 200 | **200** |
| Ciudad inexistente | `/texas/notacity/` | 404 | **404** |
| Permiso válido | `/texas/houston/building-permit-cost/` | 200 | **200** |
| Permiso inexistente | `/texas/houston/notapermit/` | 404 | **404** |
| Combinación inválida (ruta estática usada como estado) | `/states/texas/` | 404 | **404** |
| Slug reservado | `/admin/`, `/api/`, `/search/` | 404 | **404** |
| Mayúsculas | `/Texas/`, `/Texas/Houston/` | redirigir o 404 | **404** (sin normalizar) |
| Sin barra final | `/texas/houston` | 308 | **308 → `/texas/houston/`** |
| Query string | `.../building-permit-cost?foo=bar` | 308 conservando query | **308 conserva `?foo=bar`** |
| Slug corrupto / `<script>` | `/texas/houston/%3Cscript%3E/` | 404 | **404** |
| Ruta profunda | `/a/b/c/d/e/` | 404 | **404** |
| Path traversal | `/../../etc/passwd` | normalizar | **308 → `/etc/passwd/` → 404** |
| `%00`, `/undefined`, `/null` | — | 404 | **308 → 404** |
| `/favicon.ico` | — | servir | **404 (asset ausente)** |

**Nunca** se produjo 500, pantalla blanca, error React ni stack trace.

**VERIFICADO — comportamiento de rutas correcto. P3: mayúsculas sin redirección; P3: favicon 404.**

---

## 12. Error handling

- **`not-found.tsx`:** real, estado 404, H1 propio, dos CTAs de salida y texto útil. **VERIFICADO.**
- **`error.tsx` (raíz):** existe, oculta `error.message` (solo digest), ofrece `reset()`. **PERO es inalcanzable para el fallo que dice cubrir**: los fallos de DB se absorben en `safeQuery` y se convierten en `404`, así que el bloque de error **nunca se disuta por una caída de base de datos**. **P3 (código muerto en la práctica) / ligado al P1 de §9.**
- **`loading.tsx`: 0.** No hay ningún estado de carga. Las rutas de datos tardan **0.26–0.88 s** (medido) y durante ese tiempo **no hay feedback visual** de navegación. **P2.**
- **Error boundaries anidados:** ninguno (solo el raíz). Un fallo en una sección concreta tumbaría la ruta entera.
- **Fallback de DB no configurada:** las páginas estáticas y la home siguen funcionando; la home omite las cifras de cobertura (`hasCoverage`). **VERIFICADO.**
- **API failures:** N/A.

**Veredicto: degradación "controlada" pero con dos defectos: 404 en vez de error (P1) y ausencia total de estados de carga (P2).**

---

## 13. UX — recorridos reales

### Recorrido A — "¿Cuánto cuesta un permiso en una ciudad?"
Home → **"Find your state"** → `/states/` → clic en Texas → `/texas/` → tabla de jurisdicciones → Houston → `/texas/houston/` → tabla de permisos → "Houston building permit cost".
**5 clicks, 5 páginas, 0 errores, 0 roturas.** La página de permiso desglosa fórmula, componentes, ejemplo trabajado, fuentes y verificación.
**Fricciones:** (a) la home enseña rutas falsas `/states/texas/` que dan 404; (b) entre 0.3–0.9 s de espera sin indicador de carga.

### Recorrido B — "Encontrar una ciudad concreta"
`/states/` lista **las 100 ciudades agrupadas bajo su estado + mapa interactivo** → 2 clicks máximo desde el directorio, 3 desde home.
**Sin buscador** (no existe, §14). Fricción: en móvil hay que recorrer 100 entradas sin filtro ni índice alfabético.

### Recorrido C — "Cuánto cuesta un permiso eléctrico"
Mismo camino; en la hub de la ciudad existe "Houston electrical permit cost" junto a building/plumbing. **Funciona en 5 clicks.**

### Recorrido D — "No sé qué permiso necesito"
Existe la sección "What we cover" (home) y "Common questions" + "What you need before applying" (página de permiso).
**Fricción real:** no hay ninguna ruta guiada que lleve de "quiero remodelar mi cocina" al permiso correcto; el usuario debe adivinar el tipo de permiso. *No se evalúa aquí si debe existir una herramienta nueva (auditoría de Calidad/AdSense).*

### Recorrido E — "Comprobar de dónde sale una tarifa"
Página de permiso → secciones "Source and verification" + "Official sources" con badge "Official fee schedule", fecha "Verified Sep 2026" y enlaces a las fuentes oficiales. **VERIFICADO — el origen del número está a un scroll.**
Fricción técnica: 1 de las 4 fuentes externas de Houston (`hpwoltest.houstontx.gov`) **no respondió** en la prueba (000 = timeout/conexión). **NO VERIFICADO — requiere reintentar desde otra red.**

### Recorrido F — "Volver atrás y consultar otra ciudad"
Breadcrumbs en las 3 jerarquías (Home › Texas › Houston), header sticky con nav persistente, enlaces "Other permits in Houston" al pie de cada permiso. **Funciona.**
**Fricción:** no hay "volver al listado de ciudades del estado" más allá del breadcrumb; y el botón de navegador nativo sí funciona pero re-renderiza (0.26–0.88 s sin loader).

**Veredicto UX: los 6 recorridos se completan sin bloqueo. Fricciones: 2 defectos de contenido visible (P2) + ausencia de loading (P2) + ausencia de buscador en el directorio (nota).**

---

## 14. Navegación

- **Header:** marca + nav primario (3 destinos) + panel `<details>` en móvil. Sticky, con `aria-current="page"`, y el panel se cierra automáticamente al navegar (`useEffect` sobre `pathname`).
- **Footer:** 3 `nav` con `aria-label` (Browse / Site / Legal), 6 enlaces, 3 avisos legales, copyright.
- **Breadcrumbs:** `nav aria-label="Breadcrumb"` en estado, ciudad y permiso. **VERIFICADO.**
- **Enlaces rotos:** **0** en los 457 documentos (crawl completo).
- **Páginas sin salida:** ninguna; el 404 tiene 2 CTAs.
- **Loops:** ninguno.
- **Redundancia deliberada:** el mapa y la lista del directorio enlazan a los mismos 50 estados (duplicado intencionado y aceptable).
- **Falso enlace:** las 4 rutas mostradas en "How it works" de la home son texto plano y **3 de ellas no existen** (§39).

**VERIFICADO — navegación coherente. Defecto de contenido: P2.**

---

## 15. Búsqueda

**No existe buscador en el sitio.** `find`/`grep` no localizan componente de búsqueda, ruta `/search` (reservada → 404) ni indexación client-side.
**Sección N/A.** Único hallazgo relacionado: el directorio `/states/` es la única "superficie de búsqueda" y no tiene filtro ni orden.

---

## 16. Filtros

**No existen filtros** (ni por estado, ciudad, permiso, categoría, precio ni tipo). La única clasificación es la agrupación estática por estado y la tabla de la hub.
**Sección N/A.**

---

## 17. Tablas

Tablas auditadas: `Jurisdictions in Texas…`, `Permit pages for…`, `Fee components for a building permit` (10×4), `Inputs used for this example` (2×2), `Fee components` (3×3).

- **Responsive:** cada `<table>` vive dentro de un contenedor con `overflow-x: auto`. Medido a 320/375/390 px: tabla de 1056 px dentro de un contenedor de 269 px → **la tabla hace scroll dentro de su caja y NO rompe el layout** (`document.scrollWidth` no crece por la tabla). **VERIFICADO.**
- **Encabezados:** `<thead>` + `Th` con `scope` semántico y `caption` visible o `captionVisible={false}` donde corresponde. **VERIFICADO.**
- **Números:** clase `.tnum` (`tabular-nums`) en todas las celdas numéricas, `align="right"` en columnas de cifras. **VERIFICADO.**
- **Unidades:** cantidades y moneda en el mismo cuerpo de tabla; sin cortes de contenido detectados.
- **Móvil legible:** sí, salvo que la tabla de 4 columnas con 10 filas exija scroll horizontal continuo (comportamiento estándar y aceptable).

**TABLAS OK.**

---

## 18. Formularios

**No existen formularios.** `grep "<form"` → 0. El componente `src/components/ui/form.tsx` (input/select/label) **no se importa en ningún sitio** (0 referencias) → código muerto (P3).
`/contact/` no tiene formulario: solo texto y, si `NEXT_PUBLIC_CONTACT_EMAIL` estuviera configurado, un enlace `mailto:`.

**Sección N/A — pero ver §13/P1: hoy no hay forma alguna de contactar.**

---

## 19. Herramientas / calculadoras existentes

**No hay herramientas interactivas ni calculadoras en el sitio** (0 inputs, 0 client components de cálculo). Todo el cálculo es **server-side en el render**: `src/lib/calc/engine.ts` produce el desglose que se imprime en la página.

- **Validación/cálculo/resultado:** cubierta por **14 suites de tests unitarios** del motor (money, mínimos, tablas de tarifas, bases por mil, redondeo, ejemplos trabajados) → **2099 tests pasan, incluidos los ejemplos "to the cent"**.
- Inputs, unidades, decimales, reset, valores extremos, móvil: **N/A (sin UI interactiva).**
- Verificación aritmética visible en página: `$47.00 / $1,000`, `$5.36` coherentes con la tabla mostrada.

**VERIFICADO (motor) — N/A (UI de herramientas).**

---

## 20. Responsive

Mediciones reales (Chromium, `document.documentElement.scrollWidth` vs `clientWidth`, con detectores de elemento desbordado):

| Viewport | ¿Overflow horizontal? | Evidencia |
|---|---|---|
| **320 px** | **SÍ** | `scrollWidth 367 > clientWidth 303` → **+64 px** (culpable: `details.menu`, botón "Menu", `right=367`) |
| **360 px** | **SÍ** | `scrollWidth 367 > clientWidth 343` |
| **375 px** | Límite | `scrollWidth 367 > clientWidth 358` en escritorio (scrollbar clásica de 17 px); en móvil real (scrollbar overlay) cabe con **8 px de margen** |
| **390 px** | No | `scrollWidth 373 == clientWidth 373`; tablas hacen scroll interno |
| 464 px | No | `scrollWidth 447 < 464` |
| **414 / 768 / 1024 / 1280 / 1440 px** | **NO VERIFICADO** (sin medición en navegador) — revisión de CSS: media queries en 40/48/56/62/72 rem, contenedores `max-width`, sin anchos fijos que hintieran de romper | `grep "@media" globals.css` |

**PROBLEMA — evidencia arriba — impacto: scroll horizontal (y posible "pinch-zoom" obligatorio) en todo teléfono con viewport ≤366 px, que incluye 320 px (iPhone SE 1) y 360 px (Android muy común) — recomendación: que `.brand__name` pueda truncar/encogerse (`min-width:0` + `text-overflow: ellipsis`) o reducir el nombre de marca en pantallas estrechas.** Causa raíz medida: `.brand__name { white-space: nowrap }` (≈253 px) + gap 16 px + botón de menú 82 px + padding 32 px ⇒ se necesitan ~383 px.

**PROBLEMA P2.**

---

## 21. Mobile first

- **Navegación móvil:** panel `<details>/<summary>` **sin JavaScript para abrir** (correcto), cerrado automáticamente tras navegar, con `aria-label`. **VERIFICADO.**
- **Tablas:** scroll interno, no rompen el layout. **VERIFICADO.**
- **Búsqueda / selectores / filtros:** N/A (no existen).
- **Fuentes:** 16 px mínimo en cuerpo; sin texto ilegible detectado a 320–390 px.
- **Espacios:** sin solapes detectados entre 320 y 390 px.
- **Táctil — PROBLEMA:** en `/states/` se detectaron **137 elementos interactivos con dimensión <24 px**, incluidos paths del mapa de **5×8 px, 8×8 px** y enlaces de breadcrumb de **35×20 px**. Por debajo del mínimo recomendado de 44×44 px. Mitigación parcial: debajo del mapa existe la lista textual completa.
- **Header desbordado en ≤366 px** (ver §20).

**PROBLEMA P2 (header) + P3 (targets táctiles).**

---

## 22. Accesibilidad

**VERIFICADO:**

- HTML semántico: `header`, `main#main`, `footer`, 5 `nav` con `aria-label`, `ol/ul/dl` donde corresponde.
- **Un solo `<h1>`** por página y jerarquía de headings sin saltos (home: H1 → H2 → H3; ninguna página con H1 duplicado).
- **Skip link** `a.skip-link[href="#main"]` presente en todas las páginas.
- `lang="en-US"` en `<html>`.
- Etiquetas ARIA: `aria-label` en el resumen del menú y **en los 50 paths del mapa** ("Texas: permit fees published"), `aria-current="page"` en la nav activa.
- Tablas con `<caption>` (accesible incluso cuando es visualmente oculta).
- `:focus-visible` global con anillo (`boxShadow: var(--ring)`) y reglas específicas para el mapa (`.map__link:focus-visible`).
- `prefers-reduced-motion` contemplado (3 bloques).
- Utilidad `.visually-hidden`.
- `target="_blank"` → 2/2 con `rel="nofollow noopener"` (verificado en navegador: 0 sin `noopener`).
- Sin `alt` ausente (0 imágenes).

**NO VERIFICADO:**

- **Contraste de colores** — no se midió ningún ratio (requiere herramienta de contraste).
- **Navegación por teclado completa** — el foco del preview no era fiable (`document.hasFocus() === false`), así que el recorrido Tab completo **no se pudo validar**. La existencia de estilos `:focus-visible` no garantiza que todos los elementos sean enfocables.
- **Lectores de pantalla / aria-live** — no probados.

**PROBLEMA P3:** targets táctiles <24 px (§21).
**Contraste y teclado: NO VERIFICADO — requiere medición específica.**

---

## 23. Imágenes

- **`<img>` en todo el sitio: 0.** `public/` está **vacío** (0 bytes).
- Imágenes rotas: **0** (no hay).
- Dimensiones/formatos/lazy loading/layout shift: **N/A** — no hay imágenes, por tanto **no existe CLS por imágenes**.
- Único asset gráfico: `src/app/icon.svg` (favicon) servido con `?hash` → 200.
- **Ausencias relevantes:** no hay imagen social (`og:image`) ni asset promocional. **P3** (el SEO lo tratará su auditoría; técnicamente el asset no existe).
- **`/favicon.ico` → 404** (los navegadores lo piden igualmente). **P3.**

**VERIFICADO — sin imágenes problemáticas; 0 KB de peso gráfico.**

---

## 24. Fuentes

- **3 familias** (Besley display, Archivo body, IBM Plex Mono figures) cargadas con `next/font/google`.
- **Auto-alojadas por `next/font`** (`@font-face` inline + ficheros en `/_next/static/media/`): **sin CDN en runtime, sin dependencia de Google en tiempo de ejecución.** **VERIFICADO.**
- `display: "swap"` → **FOUT posible pero no FOIT** (el texto nunca queda invisible esperando la fuente). Elección correcta para LCP.
- **15 ficheros `.woff2`, 201 KB en total**; **4 preloads** por página (~90 KB: 35.7 + 34.1 + 9.8 + 9.8 KB).
- Subconjuntos `latin` solamente → sin descargar glifos innecesarios.
- Bloqueo de render: el CSS (11 KB gz) sí es render-blocking (normal); las fuentes van por preload + swap.

**VERIFICADO — patrón de fuentes correcto. Sin problemas detectados.**

---

## 25. CSS

- **1 único fichero:** `src/app/globals.css`, **2715 líneas, 56 KB (11 KB gzip)** servido como una hoja.
- Estilos duplicados: no se detectaron bloques repetidos relevantes; Tailwind 4 se usa solo como base postcss (el diseño es CSS propio con variables).
- Reglas conflictivas: no detectadas; `!important` no aparece en las zonas revisadas.
- **Overflow:** `overflow-x: auto` correcto en wrappers de tabla (línea 782); `overflow: hidden` puntual en 5 sitios (recortes de layout intencionados).
- Media queries: `40rem (640px)`, `48rem`, `56rem`, `62rem`, `72rem` + `prefers-reduced-motion`. **No hay breakpoint que cubra <40rem para el header**, que es justo donde ocurre el desbordamiento de §20.
- Componentes que rompen en determinados tamaños: **el header por debajo de 367 px** (§20).

**Sin refactors realizados. Un problema real: P2 (header ≤366 px).**

---

## 26. JavaScript

- **Totales del build:** 599 KB de JS (raw) en chunks; CSS 56 KB.
- **Chunks principales:** 224 KB + 162 KB + 110 KB + 28 KB + 26 KB (raw) → **72 + 45 + 39 + 8 + 8 KB gzip ≈ 140 KB gz para la home**, más runtime de React 19.
- **Componentes client: 4 de 37** (`error`, `brand-link`, `site-nav`, `map-interaction`). **El resto del sitio es 100 % servidor.** **VERIFICADO — arquitectura muy buena.**
- **JS innecesario:** no se detectó. No hay librerías pesadas (0 dependencias de UI/gráficos/mapas: el mapa US es SVG propio).
- **Hydration:** 0 errores.
- **Listeners/re-renders:** el único `useEffect` de la app cierra el menú en cada cambio de ruta (barato).
- **Rendimiento de red del JS:** en la home se cargaron 7 scripts async (~140 KB gz) → aceptable.
- **Coste real identificado:** no es el JS, es el **prefetch RSC** (§8).

**VERIFICADO — sin problemas de JS de impacto real.**

---

## 27. Rendimiento

> Métricas medidas **en local sobre `next start` con DB remota**. No son méricas de producción.

**TTFB por tipo de página (repetido, "caliente")**

| Ruta | TTFB/total | Caché |
|---|---|---|
| `/` (estática ISR) | **0.004–0.006 s** | `x-nextjs-cache: HIT`, `s-maxage=3600, stale-while-revalidate=31532400` |
| `/about/` | ~0.005 s | `x-nextjs-cache: HIT`, `s-maxage=31536000` |
| `/texas/` (dinámica) | **0.26–0.36 s** | **`Cache-Control: private, no-cache, no-store`** |
| `/texas/houston/` (dinámica) | **0.50 s** | idem |
| `/texas/houston/building-permit-cost/` (dinámica) | **0.87–0.88 s** | idem, idéntico en 5 peticiones seguidas |

**PROBLEMA P1 — La ISR declarada no se aplica en las rutas de datos.**
*Evidencia:* (1) la tabla del build no muestra columna *Revalidate* para `/[state]`, `/[state]/[city]`, `/[state]/[city]/[permit]`, aunque los tres exportan `revalidate = 3_600`; (2) sus respuestas llevan `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate` y **no** `x-nextjs-cache`; (3) 5 peticiones consecutivas tardan 0.87 s **todas** (si hubiera caché, la 2ª–5ª serían ~50 ms).
*Impacto:* **cada visita = render SSR + 3–5 queries a Neon remoto**. En Vercel: TTFB de ~0.5–1 s en producción real, consumo de funciones innecesario, y el CDN sirve siempre `no-store` (los usuarios no se benefician de la copia en caché). Con 297 páginas, ningún crawler ni usuario recibe la versión cacheada.
*Causa:* **NO VERIFICADO** — requiere reproducir con `next build` + inspección de la config de segmento (posible incompatibilidad del `revalidate` exportado con el modo de render en Next 16). **No se ha modificado nada.**

**Tamaño HTML (raw / gzip)**

| Página | raw | gzip |
|---|---|---|
| `/` | 46.0 KB | **8.7 KB** |
| **`/states/`** | **242.8 KB** | **51.8 KB** ← página más pesada |
| `/texas/` | 31.1 KB | 8.1 KB |
| `/texas/houston/` | 54.9 KB | 12.9 KB |
| `/texas/houston/building-permit-cost/` | 82.2 KB | 16.6 KB |
| `/methodology/` | 38.9 KB | 8.1 KB |
| `/about` `/contact` `/privacy` `/terms` | 28–31 KB | 6.0–6.7 KB |

**Carga de recursos (home, navegador):** TTFB 9 ms, DCL 31 ms, load 119 ms, **FCP 121 ms**, 15 recursos, ~52 KB de transferencia HTML. Local y en caché: **no representativo de producción**.

**LCP / CLS / INP: `NO VERIFICADO — requiere medición en producción`** (no se ejecutó Lighthouse ni campo data).

---

## 28. Páginas pesadas

| Página | Peso HTML (raw) | Problema |
|---|---|---|
| **`/states/`** | **242.8 KB (51.8 KB gz)** | Mapa SVG de 50 estados inline + lista de 100 ciudades + 50 estados en el mapa. Además dispara **~40 prefetches RSC (1.4 KB c/u, 251–924 ms)**. **P2** |
| `/new-york/buffalo/building-permit-cost/` | 175.7 KB | Desglose + fuentes + FAQ |
| `/oklahoma/tulsa/electrical-permit-cost/` | 165.9 KB | ídem |
| `/colorado/westminster/building-permit-cost/` | 156.2 KB | ídem |
| `/florida/miami-dade/building-permit-cost/` | 154.3 KB | ídem |
| resto de páginas de permiso | 66–152 KB | 14 páginas > 100 KB |

- **Estados/ciudades ligeras** (29–55 KB): bien.
- **Requests por página:** home 15; `/states/` ~70.
- **Datos:** la home y el directorio hacen 3 queries; sin N+1.

**P2: `/states/` por peso + prefetch. P3: páginas de permiso de 150 KB+ (aceptable si se confirma compresión en el hosting).**

---

## 29. Seguridad frontend

- **Secretos en el bundle cliente: 0.** Verificado por grep sobre `.next/static`:
  - `DATABASE_URL` → 0 apariciones.
  - Host real de la DB → **0 apariciones** en `.next/static`.
  - Password real de la DB → **0 apariciones** en `.next/static`.
  - `REVALIDATE_TOKEN` / `process.env.*` en chunks cliente → 0.
  - `postgres://` en cliente → 0. En HTML de la home → 0.
- **Protecciones estructurales:** `server-only` en `env.ts`, `db/client.ts`, `db/queries.ts` → importarlos desde un client component rompe el build.
- **`NEXT_PUBLIC_*`:** solo `NEXT_PUBLIC_SITE_URL` (placeholder `https://permitfees.example`) e `INDEXABLE` quedan inline; ambos son públicos por diseño.
- **XSS:** 0 entradas de usuario. Los 2 usos de `dangerouslySetInnerHTML` son (a) JSON-LD serializado (`serializeJsonLd`, con test de seguridad) y (b) la descripción del componente dice explícitamente que `editorial-text` **no** lo usa y escapa por React.
- **`localStorage` / `sessionStorage` / `document.cookie`: 0 usos.**
- **Endpoints administrativos:** `/admin/` → 404 y reservado en `RESERVED_ROOT_SLUGS`.
- **Bundle no contiene credenciales: VERIFICADO.**

---

## 30. Seguridad backend

- **Superficie de entrada: 0 endpoints.** No hay autenticación, no hay CORS que configurar, no hay rate limiting que aplicar (no se acepta ninguna petición de escritura).
- **SQL injection:** todas las queries son **Drizzle parametrizado** (`eq`, `and`, `inArray`); **no hay una sola cadena SQL concatenada** en `queries.ts`. Los parámetros de ruta llegan como bind params (`params: texas,1` visible en el log, parametrizado). **VERIFICADO.**
- **Información de errores:** `logSafeError` redacta connection strings, passwords y tokens antes de loguear; `error.tsx` **no** renderiza `error.message`. Verificado en el log de la simulación de caída: aparece la query y los parámetros, **nunca la credencial**.
- **Exposición de DB:** ninguna respuesta HTTP contiene datos de conexión (verificado contra HTML y chunks).
- **Validación de entrada:** `isReservedSlug()` antes de tocar la DB en las 3 rutas; `checkSlug()`/`normalizeSlug()` en la capa de escritura (no expuesta).
- **Payloads gigantes / entradas malformadas:** sin endpoints, imposible.
- **CORS:** no configurado (N/A). **`poweredByHeader: false`** → no filtra versión. **VERIFICADO.**

**VERIFICADO — sin vulnerabilidades detectables. Superficie reducida a render de rutas.**

---

## 31. Headers

Comprobados con `curl -sI` en `/` y en rutas dinámicas:

| Header | Estado | Evidencia |
|---|---|---|
| `X-Content-Type-Options: nosniff` | **Presente** | cabecera en todas las respuestas `/:path*` |
| `X-Frame-Options: DENY` | **Presente** | ídem |
| `Referrer-Policy: strict-origin-when-cross-origin` | **Presente** | ídem |
| `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` | **Presente** | ídem |
| `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | **Presente** | ídem |
| **`Content-Security-Policy`** | **AUSENTE** | decisión documentada en `next.config.ts` (requiere nonce) y en ROADMAP fase 2. **P2 antes de AdSense.** |
| `X-XSS-Protection` | Ausente | Obsoleto/no recomendado → **OK** |
| COOP/CORP/`Cross-Origin-Embedder-Policy` | Ausentes | Baja prioridad |
| `Cache-Control` dinámico | `private, no-cache, no-store` | ver §27 |

**Nota:** HSTS con `preload` emitido en local es inocuo; en producción es correcto.
**P2: ausencia de CSP (reconocida por el propio proyecto).**

---

## 32. Cookies

- `Set-Cookie` en respuestas de `/` y `/texas/houston/`: **0**.
- `document.cookie` en navegador: **vacío**.
- Cookies de terceros: **ninguno** (no hay scripts de terceros).
- Cookies generadas accidentalmente: **ninguna**.
- Uso de `document.cookie`/`localStorage` en el código: **0**.

**VERIFICADO — el sitio no instala ninguna cookie. No se necesita CMP por dependencias propias (decisión de contenido/AdSense, fuera de alcance).**

---

## 33. Servicios externos

| Servicio | Dónde | Dependencia de render | Impacto si falla |
|---|---|---|---|
| **Google Fonts (`next/font`)** | build time (descarga y auto-aloja) | **Ninguna en runtime** | Ninguno: los woff2 se sirven del propio origen; con `display:swap` el texto se ve con la fallback |
| Fuentes oficiales (municode, houstontx.gov, houstonpublicworks.org) | enlaces salientes `<a>` | Ninguna | El enlace no abre; **1 de 4 no respondió en la prueba** (`hpwoltest.houstontx.gov` → 000) — **NO VERIFICADO, reintentar** |
| Mapa / gráficos externos | **No existen** (SVG propio) | — | — |
| Analytics / ads / CDN | **No existen hoy** | — | — |
| Base de datos Neon | servidor | **Alta en las rutas de datos** | §9/§11 |

**VERIFICADO — el sitio no depende de ningún tercero para renderizar.**

---

## 34. Resiliencia / offline

| Fallo simulado | Comportamiento observado | Veredicto |
|---|---|---|
| **DB no accesible** (servidor de diagnóstico con URL muerta) | Páginas de datos → **404**; estáticas y home servidas desde ISR; log redactado | **PROBLEMA (P1)** — degradación controlada pero **semánticamente incorrecta** y sin posibilidad de reintentar (el `error.tsx` no llega a dispararse) |
| Fuente externa caída | Solo un enlace roto en el texto | OK |
| Imagen caída | N/A (no hay imágenes) | OK |
| DB lenta | TTFB crece (0.87 s ya incluye DB remota); sin timeout explícito configurado en el cliente | **P3 — sin timeout/circuit breaker declarado** |
| Conexión lenta del usuario | HTML gzip 6–52 KB + ~140 KB de JS; sin loader durante los 0.3–0.9 s de SSR | **P2 (falta loading)** |
| Sin `DATABASE_URL` (clone limpio) | Todo degrada a páginas editoriales sin datos | VERIFICADO OK |

**No hay pantalla roja ni stack trace en ningún escenario probado.** La pantalla "roja" posible es un 404 donde debería haber contenido.

---

## 35. Vercel / despliegue

- **`vercel.json`: no existe.** Sin cron, sin funciones personalizadas, sin headers propios de Vercel (los de `next.config.ts` se aplican igualmente en Vercel).
- **Build command / output:** los por defecto de Next (`next build`), sin `output: "export"` ni `standalone` declarado.
- **Runtime:** `engines.node >= 20.9.0` → Vercel usará su Node actual (20+). **VERIFICADO.**
- **Variables en Vercel:** **NO VERIFICADO — no hay evidencia de qué variables están definidas en el proyecto de Vercel** (no hay `.vercel/` en el repo).
- **Límites de riesgo:** al no funcionar la ISR (§27), **cada petición a una de las 297 páginas de permiso invoca una función + 3–5 queries**. Con tráfico real esto traduce en coste/latencia; con el plan hobby es el principal riesgo de escala.
- **Revalidación on-demand:** `REVALIDATE_TOKEN` está validado en `env.ts` pero **no existe endpoint** (`/api/revalidate` → 404). **P3 (config muerta).**

---

## 36. Variables de entorno

| Variable | Estado actual | Efecto observado | Veredicto |
|---|---|---|---|
| `DATABASE_URL` | **Definida** en `.env.local` | DB funciona (50 estados / 100 ciudades / 297 páginas servidas) | OK |
| `NEXT_PUBLIC_SITE_URL` | **`https://permitfees.example`** | canonical, `og:url` y JSON-LD apuntan a un dominio que **no resuelve** (000 al probar) | **P2 — pendiente por diseño (dominio definitivo), pero bloquea cualquier validación de producción/AdSense** |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `"false"` | `robots.txt → Disallow: /`, `sitemap.xml → urlset vacío`, `meta robots: noindex` en todas las páginas | **Correcto para staging. NO TOCAR (indicado por el usuario).** |
| `NEXT_PUBLIC_CONTACT_EMAIL` | **No definida** | `/contact/` muestra *"A contact address has not been configured… please treat the published figures as unverified for now"* | **P1 — sin canal de contacto + copia que desacredita todo el contenido** |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No definida (opcional) | — | OK |
| `REVALIDATE_TOKEN` | No definida; validada en `env.ts` | Sin endpoint que la use | P3 |
| `NODE_ENV` | gestionada por Next | — | OK |

- **Variables mal nombradas:** no detectadas.
- **Variables que podrían romper producción:** ninguna hace fallar el build (el esquema Zod valida en acceso perezoso y `DATABASE_URL` es opcional).
- **No se ha inventado ni modificado ningún valor.**

---

## 37. Compatibilidad

| Navegador | Estado |
|---|---|
| **Chrome/Chromium desktop** | **VERIFICADO** — preview + crawl (render, JS, prefetch, medición de layout) |
| Chrome mobile | **NO VERIFICADO** (solo simulación de viewports) |
| Safari mobile / desktop | **NO VERIFICADO** |
| Firefox | **NO VERIFICADO** |
| Edge | **NO VERIFICADO** (idéntico a Chromium por motor) |

Riesgos detectados por revisión de CSS/JS (no por ejecución): uso de `:focus-visible`, `gap` en flexbox, CSS nativo anidado/capas de Tailwind 4 y `content-visibility`. **Tailwind 4 y `:focus-visible` requieren navegadores recientes; Safari < 16.4 podría necesitar prueba.** Sin incompatibilidades *observadas*.

---

## 38. Consistencia visual

- **Un solo sistema de estilos** (`globals.css` con variables CSS) → tipografía (3 familias con roles definidos), espaciado y colores coherentes entre todas las páginas.
- **Header/footer idénticos** en las 457 rutas (mismo HTML, verificado por crawl).
- **Componentes compartidos** (`PageHeader`, `Section`, `Container`, `Callout`, `Badge`, `DataTable`, `VerificationBadge`) → no hay páginas que parezcan de otra app.
- **Anomalías concretas (no estéticas, de funcionamiento):**
  1. `/states/` muestra **"0 states are not covered yet"** con lista vacía (§40) → texto ilógico que rompe la credibilidad.
  2. La home muestra **3 rutas inexistentes** (§40).
  3. Estilos inline `style={{...}}` dispersos en ~30 JSX (mantenibilidad, no usuario).
- **Estados (hover/focus/active):** definidos para enlaces, botones y mapa.

**VERIFICADO — consistencia alta; 2 defectos de contenido visible.**

---

## 39. Test de usuario final (10 pasos)

| # | Paso | Resultado | Fricción |
|---|---|---|---|
| 1 | Entender qué hace la web | **Sí** — H1 + lead + "How it works" + "Coverage" claros | Ninguna |
| 2 | Encontrar un estado | **Sí** — CTA "Find your state" en home → 50 estados | Ninguna |
| 3 | Encontrar una ciudad | **Sí** — 2 clicks desde el directorio | Sin buscador: en móvil se recorren 100 entradas |
| 4 | Encontrar un permiso | **Sí** — tabla en la hub de ciudad | Requiere saber el tipo de permiso (Recorrido D) |
| 5 | Entender el resultado | **Sí** — desglose, fórmula, ejemplo, unidades, fuentes | 0.3–0.9 s sin loader |
| 6 | Volver atrás | **Sí** — breadcrumbs + nav sticky | Sin CTA "ver más ciudades de Texas" fuera del breadcrumb |
| 7 | Consultar otra jurisdicción | **Sí** — breadcrumb → estado → otra ciudad | — |
| 8 | Acceder a la fuente | **Sí** — enlaces oficiales en la página de permiso | 1 de 4 fuentes no respondió |
| 9 | Contactar | **NO** — **no hay canal**: email no configurado y el texto dice que las cifras deben considerarse *unverified* | **P1** |
| 10 | Usar desde móvil | **Sí en ≥375 px**; en 320/360 px hay **scroll horizontal** por el header | **P2** |

---

## 40. Test de rutas inválidas

33 URLs inválidas probadas (estado/ciudad/permiso inexistentes, slug reservado, mayúsculas, `<script>` URL-encoded, path traversal, `%00`, `/undefined`, `/null`, 5 niveles de profundidad, query strings):

- **500: 0**
- **Pantalla blanca: 0**
- **Stack trace en el cuerpo: 0** (grep sobre los 33 cuerpos → 0 coincidencias de `Error:`/`at … (`)
- **Hydration crash: 0**
- 404 correctos: **33/33**
- 308 correctos (barra final / normalización): **7/33** (comportamiento esperado)

**VERIFICADO — ningún caso produce 500 ni fuga de stack.**

---

## 41. Estabilidad / carga

Test local razonable y no destructivo sobre `next start` (1 proceso Node):

```
120 peticiones GET → /texas/houston/building-permit-cost/   (10 en paralelo)
Resultado: 120 × 200   avg 0.903 s   máx 1.620 s   wall 11.541 s
Errores / timeouts / 5xx: 0
```

- **Sin errores bajo concurrencia, sin timeouts, sin agotamiento de recursos.**
- **No se detectaron fugas de memoria** en la ventana del test (medida solo por observación; **fuga de memoria a largo plazo: NO VERIFICADO**).
- **Latencia**: el "cuello de botella" es el render + DB, no el servidor Node (0.9 s por request × 10 en paralelo ⇒ ~10 req/s por proceso). Confirma el P1 de §27.
- No se realizaron pruebas contra producción ni ataques.

---

## 42. P0 — BLOQUEADOR

**Ninguno.**

No hay ningún defecto que impida publicar: 457/457 rutas responden, 0 × 500, 0 errores de JS, build y tests limpios.

---

## 43. P1 — CRÍTICO (solucionar antes de producción)

| # | Problema | Evidencia | Impacto | Recomendación |
|---|---|---|---|---|
| **P1-1** | **La ISR (`revalidate = 3_600`) no se aplica a las rutas de datos** | Build sin columna *Revalidate* en `/[state]`, `/[state]/[city]`, `/[state]/[city]/[permit]`; respuestas con `Cache-Control: private, no-cache, no-store` y sin `x-nextjs-cache`; 5 peticiones seguidas = 0.87 s cada una | TTFB 0.26–0.88 s en **cada** visita; 3–5 queries a Neon por vista; coste de funciones en Vercel sin caché de CDN; crawling lento | Investigar por qué Next 16 ignora el `revalidate` exportado en esos segmentos y activar la caché; verificar tras el cambio con `x-nextjs-cache: HIT` y TTFB < 100 ms en la 2ª visita |
| **P1-2** | **Caída de DB → 404 masivo en todas las páginas de datos** | Servidor con `DATABASE_URL` inválido: `/texas/` → 404, permiso → 404; log `[db] query "getStateBySlug" failed` | Google recibe 404 para contenido existente durante un incidente (riesgo de deindexación); el usuario ve "no existe" en vez de un error recuperable; `error.tsx` queda inalcanzable | Distinguir en `safeQuery` entre "no existe" (404) y "no se pudo leer" (error controlado → `error.tsx` con `reset()`, o 503) |
| **P1-3** | **No hay ningún canal de contacto** + copia desacreditadora | `NEXT_PUBLIC_CONTACT_EMAIL` sin definir → `/contact/` muestra *"this site cannot receive corrections — please treat the published figures as unverified for now"* | Imposible recibir correcciones; un requisito habitual de revisión/AdSense; y la propia página declara **todas** las cifras como no verificadas, minando la propuesta de valor | Definir la variable de contacto y sustituir el fallback por uno que no declare el contenido como *unverified* |

---

## 44. P2 — IMPORTANTE (solucionar antes de solicitar AdSense)

| # | Problema | Evidencia | Impacto | Recomendación |
|---|---|---|---|---|
| **P2-1** | **Header desbordado en viewports ≤366 px** | 320 px → `scrollWidth 367 > clientWidth 303`; 360 px → `367 > 343`; culpable `details.menu` (`right=367`), causado por `.brand__name{white-space:nowrap}` (253 px) + gap 16 + menú 82 + padding 32 | Scroll horizontal obligatorio en 320/360 px; en 375 px solo quedan 8 px | Permitir que la marca encoja (`min-width:0`, ellipsis) o acortarla por breakpoint; añadir breakpoint < 40rem |
| **P2-2** | **La home enseña 3 URLs que devuelven 404** | Paso 1 `/states/texas/` → **404**; paso 2 `/states/texas/houston/` → **404**; paso 4 `/states/texas/houston/` → **404**. Solo el paso 3 (`/texas/houston/building-permit-cost/`) es correcto. El propio comentario del código dice *"The path is the URL it produces"* | Un lector que copia la ruta llega a 404; mensaje contradictorio con "estas son las URLs" | Corregir a `/texas/`, `/texas/houston/`, `/texas/houston/` |
| **P2-3** | **Texto ilógico en `/states/`** | H2 renderizado: **"0 states are not covered yet"** con lista vacía debajo (los 50 estados están publicados) | Texto absurdo en una página principal; además no maneja el singular ("1 states") | Ocultar la sección cuando `pendingStates.length === 0` y pluralizar |
| **P2-4** | **Sin `loading.tsx` ni estados de carga** | `find src -name loading.tsx` → 0; SSR de 0.26–0.88 s sin indicador | El usuario percibe que el clic "no hace nada" 0.3–0.9 s en cada navegación | Añadir `loading.tsx` en las rutas de datos |
| **P2-5** | **`/states/` pesada + tormenta de prefetch** | HTML 242.8 KB (51.8 gz); 70 recursos por carga; ~40 peticiones `?_rsc=` de 1.4 KB (251–924 ms) | Mayor consumo de red y de DB en la página de entrada del sitio | Reducir el HTML del mapa, y/o limitar el prefetch del directorio |
| **P2-6** | **`/favicon.ico` → 404** | `curl /favicon.ico` → 404; `public/` vacío | 404 ruidoso en logs de cada visita y en Search Console | Añadir el fichero (o redirigir a `icon.svg`) |
| **P2-7** | **Sin Content-Security-Policy** | `next.config.ts` lo documenta como pendiente; ausente en todas las respuestas | Riesgo XSS residual si algún día se inyecta HTML/JS de terceros; requisito habitual para confianza/AdSense | Implementar CSP con nonce en fase 2 (roadmap) |
| **P2-8** | **`NEXT_PUBLIC_SITE_URL` sigue siendo `https://permitfees.example`** | canonical/`og:url`/JSON-LD → dominio que no resuelve (000) | Ninguna URL canónica válida; imposible validar producción | Fijar el dominio definitivo antes de producción (pendiente declarado) |
| **P2-9** | **Cobertura de tests sin UI ni rutas** | 112 suites / 2099 tests: unit + DB, **0 tests de render, HTTP, responsive, a11y** | Los defectos P2-1/2/3 (header, rutas falsas, texto ilógico) **no los detectó ningún test** | Añadir un smoke test HTTP (status + H1 por ruta) y, si se puede, un E2E mínimo |

---

## 45. P3 — MEJORA (no bloquea)

| # | Problema | Evidencia | Recomendación |
|---|---|---|---|
| **P3-1** | `PUT /texas/` → 200 (métodos no-GET no rechazados en rutas dinámicas); `POST/DELETE/OPTIONS` → 405 | Prueba directa | Rechazar no-GET de forma uniforme |
| **P3-2** | Targets táctiles <24 px en el mapa (5×8 px) y breadcrumbs (35×20 px); 137 elementos pequeños en `/states/` | Medición DOM a 390 px | Área mínima táctil ≥ 32–44 px (el mapa ya tiene lista textual alternativa) |
| **P3-3** | Sin `og:image` (no hay asset de imagen social) | `public/` vacío, sin `<img>` | Generar asset cuando se defina el dominio |
| **P3-4** | Código muerto: `src/components/ui/form.tsx` (0 referencias en `src` y `tests`) | `grep "ui/form"` → 0 | Eliminar en una futura limpieza |
| **P3-5** | `REVALIDATE_TOKEN` validado en `env.ts` sin endpoint que lo use; `/api/revalidate` → 404 | `grep` + curl | Completar la fase 2 o eliminar la variable |
| **P3-6** | URLs con mayúsculas (`/Texas/`) → 404 sin redirección (solo se normaliza la barra final) | Prueba directa | Redirect 308 a la forma canónica |
| **P3-7** | `error.tsx` inalcanzable para fallos de DB (se absorben como 404) | §9/§12 | Relacionado con P1-2 |
| **P3-8** | Sin timeout/circuit breaker declarado en la capa de DB | `db/client.ts` no fija tiempos | Definir timeout para evitar TTFBs largos si Neon está lento |

---

## 46. Checklist final

| Área | Estado | Evidencia | Gravedad |
|---|---|---|---|
| **Build** | **OK** | `next build` exit 0, 0 errores, 0 warnings, 12 estáticas | OK |
| **TypeScript** | **OK** | `tsc --noEmit` exit 0, `strict` + `noUncheckedIndexedAccess` | OK |
| **Tests** | **OK (cobertura parcial)** | 112 archivos / 2099 passed / 0 failed / 0 skipped; **sin tests de UI, rutas ni a11y** | P2 (cobertura) |
| **Rutas** | **OK** | 457/457 → 200; 33 inválidas → 404; 0 × 500 | OK |
| **APIs** | **N/A** | 0 endpoints; `/api/*` → 404; `PUT` → 200 | P3 |
| **DB runtime** | **Parcial** | Queries parametrizadas, sin N+1, `safeQuery` con fallback y redacción; **caída → 404 masivo** | **P1** |
| **UX** | **Parcial** | 6 recorridos completados; rutas falsas en home, texto ilógico en directorio, sin loader, **sin canal de contacto** | **P1** + P2 |
| **Responsive** | **Falla en ≤366 px** | 320 px: `367 > 303`; 360 px: `367 > 343`; 390 px OK; 414–1440 **NO VERIFICADO** | **P2** |
| **Mobile** | **Parcial** | Menú `<details>` sin JS OK; tablas con scroll interno OK; targets <24 px | P2 (header) / P3 (targets) |
| **Accesibilidad** | **Parcial** | landmarks, 1 H1, skip link, captions, aria-label en mapa, focus-visible, lang: OK; **contraste NO VERIFICADO, teclado NO VERIFICADO** | P3 + NO VERIFICADO |
| **Performance** | **Problema estructural** | ISR inactivo en rutas de datos: 0.26–0.88 s por visita, `no-store`; `/states/` 242 KB; LCP/CLS/INP **NO VERIFICADO** | **P1** + P2 |
| **Seguridad** | **OK** | 0 secretos en bundle (grep host+password), 0 endpoints, queries parametrizadas, logs redactados, 0 cookies | OK (CSP ausente → P2) |
| **Vercel** | **Parcial** | Sin `vercel.json` (default correcto), `engines >=20.9`; variables en Vercel **NO VERIFICADO**; ISR inactivo penaliza coste | P1/P2 |
| **Variables** | **Parcial** | 6 definidas/previstas; **falta `NEXT_PUBLIC_CONTACT_EMAIL`**; `SITE_URL` placeholder; `REVALIDATE_TOKEN` sin uso | **P1** + P2 + P3 |
| **Compatibilidad** | **Parcial** | Chrome/Chromium **VERIFICADO**; Safari/Firefox/Edge **NO VERIFICADO** | NO VERIFICADO |

---

## 47. Recomendaciones (orden de ejecución, **sin ejecutar ninguna**)

1. **Arreglar la caché de las rutas de datos (P1-1).** Es el cambio con mayor retorno: TTFB, coste de Vercel y capacidad de crawling. Verificar con `x-nextjs-cache: HIT` y una 2ª petición < 100 ms.
2. **Separar "dato ausente" de "fallo de lectura" en `safeQuery` (P1-2)** para que una caída de Neon muestre el `error.tsx` con reintento en vez de un 404.
3. **Configurar `NEXT_PUBLIC_CONTACT_EMAIL` y reescribir el fallback de `/contact/` (P1-3).**
4. **Corregir los 3 defectos visibles:** header ≤366 px (P2-1), rutas falsas de la home (P2-2), "0 states are not covered yet" (P2-3).
5. **Añadir `loading.tsx`** a las rutas de datos (P2-4).
6. **Aligerar `/states/`** (242 KB) y limitar el prefetch del directorio (P2-5).
7. **Añadir `favicon.ico`** (P2-6) y **CSP** (P2-7).
8. **Fijar el dominio definitivo** (`NEXT_PUBLIC_SITE_URL`, P2-8).
9. **Sumar smoke tests HTTP + un E2E mínimo** (P2-9) para que defectos como P2-1/2/3 no lleguen a producción.
10. **P3** en una limpieza posterior: métodos no-GET, targets táctiles, `og:image`, código muerto (`ui/form.tsx`), `REVALIDATE_TOKEN`, normalización de mayúsculas, timeout de DB.
11. **Medir LCP/CLS/INP, contraste y navegación por teclado en producción** (hoy: `NO VERIFICADO`).

---

### Clasificación de estado por regla de la auditoría

- **VERIFICADO:** build, typecheck, 2099 tests, 457 rutas, 404/308, ausencia de 500 y de stack traces, consola limpia, sin cookies, sin secretos en cliente, queries parametrizadas sin N+1, tablas responsive, fuentes auto-alojadas, arquitectura server-first, estabilidad bajo 120 peticiones.
- **PROBLEMA:** ISR inactiva en rutas de datos (P1), 404 masivo ante caída de DB (P1), sin canal de contacto (P1), header ≤366 px (P2), rutas falsas en home (P2), texto ilógico en `/states/` (P2), sin loader (P2), `/states/` 242 KB (P2), favicon 404 (P2), sin CSP (P2), cobertura de tests (P2) y 8 P3.
- **NO VERIFICADO:** métricas de campo LCP/CLS/INP, contraste, recorrido completo por teclado, Safari/Firefox/Edge, variables definidas en Vercel, fuga de memoria a largo plazo, alcanzabilidad de 1 fuente externa.

**Informe generado: TECHNICAL-UX-PERFORMANCE-AUDIT-2026-09-28.md**
