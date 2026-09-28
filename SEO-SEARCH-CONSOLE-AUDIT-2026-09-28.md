# SEO + Search Console Audit — Permit Fee Intelligence

**Fecha:** 2026-09-28
**Alcance:** auditoría técnica y de indexación completa, orientada a Google Search Console.
**Regla de la auditoría:** no se ha modificado código, datos, URLs, metadata, sitemap, robots, `INDEXABLE` ni el dominio. Todo lo que se hizo fue *lectura*, *builds de verificación en una copia aislada* (`.tmp-audit/seo-sim-2026-09-28/`, descartable) y *crawls*. El único archivo nuevo del repositorio es este informe (más artefactos scratch dentro de `.tmp-audit/`, que ya está en `.gitignore`).

**Método:**

1. Inventario desde la base de datos real (Neon, 15 tablas, `scripts/verify-db.ts` + inventario propio de solo lectura) replicando el gate editorial (`evaluatePublishability`) y la query del sitemap.
2. Build aislado en copia (node_modules junction) en dos estados: `INDEXABLE=false` (actual) e `INDEXABLE=true` (simulado **sin guardar** el cambio; `NEXT_PUBLIC_SITE_URL` = `https://permitfees.example`, el placeholder ya configurado, no se inventó ni guardó ningún dominio).
3. Crawl completo con `next start` en puerto 3210: 454 URLs de sitemap + 37 URLs negativas/borde = 491 URLs, extrayendo status, cadenas de redirect, canonical, robots, title, description, H1/H2, JSON-LD, enlaces internos, imágenes y tiempos.
4. Chequeo de las 350 URLs de `sources` (GET real), tests, typecheck y ambos builds.

---

## 1. Resumen ejecutivo

- El sitio tiene **una arquitectura SEO extremadamente limpia**: 454 URLs indexables simuladas, **todas 200**, canonical self-referencing correcto, **0 duplicados de contenido**, **0 orphan pages**, **0 enlaces internos rotos**, sitemap exactamente igual al conjunto de páginas indexables (454/454), robots coherente en ambos estados, y ningún caso de las contradicciones A–E (indexable+noindex, noindex+sitemap, etc.).
- **El único bloqueador real es el dominio**: `NEXT_PUBLIC_SITE_URL="https://permitfees.example"` no existe. Publicar así emitiría canonicals, sitemap, robots (`Host:`), JSON-LD y OG hacia un dominio inexistente. Está documentado como TODO en `.env.local` y no se ha tocado.
- Riesgos principales antes de indexar: **rutas dinámicas sin caché (TTFB p50 ≈ 0,9 s en crawl, 0,26–1,8 s)** pese a `revalidate = 3600`, y **dependencia total de la DB** (si la DB cae, *todo el sitio devuelve 404*, no 500).
- Riesgos antes de AdSense: **45 de 350 URLs de fuentes oficiales inacesibles**, **60 meta descriptions con artefactos markdown `**`**, páginas de estado finas (~219–250 palabras × 50), sin favicon.ico, sin og:image, sin cookie policy.
- Tests: **112 archivos / 2099 tests → todos pasan**; typecheck 0 errores; **ambos builds OK**.

---

## 2. Inventario de URLs

Rutas reales del proyecto (App Router, `trailingSlash: true`):

| Clase | Origen | Cantidad | Ejemplo |
| --- | --- | ---: | --- |
| Estáticas | `src/app/*/page.tsx` + `ROUTES` | 7 | `/`, `/states/`, `/methodology/`, `/about/`, `/contact/`, `/privacy/`, `/terms/` |
| Estados (DB) | `src/app/[state]/page.tsx` | 50 | `/texas/` |
| Ciudades/hubs (DB) | `src/app/[state]/[city]/page.tsx` | 100 | `/texas/houston/` |
| Permit pages (DB) | `src/app/[state]/[city]/[permit]/page.tsx` | 300 filas (297 publicadas+indexables, 3 draft) | `/texas/houston/building-permit-cost/` |
| Auxiliares | `robots.ts`, `sitemap.ts`, `icon.svg`, `not-found` | 4 | `/robots.txt`, `/sitemap.xml`, `/icon.svg` |
| Reservadas sin construir | `RESERVED_ROOT_SLUGS` | 18 | `/admin/`, `/api/`, `/blog/`, `/guides/`… → **404** |
| Guías/herramientas/categorías | **No existen** (reservadas: `guides`, `calculators`, `glossary`) | 0 | — |

**Matriz (resumen por clase; el crawl aporta el detalle URL por URL en `.tmp-audit/crawl-B-2026-09-28.json`):**

| URL | Existe | HTTP | Indexable | Canonical | Sitemap | Internamente enlazada | Problemas |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| 7 estáticas | Sí | 200 | Sí (estado B) | self, HTTPS | Sí (7/7) | Sí (nav+footer) | sin og:image (global) |
| 50 estados | Sí | 200 | Sí | self, HTTPS | Sí (50/50) | Sí (home map + `/states/` + breadcrumbs) | finas: 219–250 palabras |
| 100 hubs | Sí | 200 | Sí | self, HTTPS | Sí (100/100) | Sí (tabla estado + breadcrumbs) | 60 descriptions con `**` (afecta a esta clase y a permit) |
| 297 permit pages | Sí | 200 | Sí | self, HTTPS | Sí (297/297) | Sí (hub + hermanos + breadcrumbs) | 6 “sin horario de tarifas” (soft-404 medio) |
| 3 draft (Houston demolition/mechanical, Lincoln plumbing) | Sí (fila) | **404** | No | — | No | No | correcto: fuera de sitemap y de enlaces |
| `/index/` | Sí | 200 | Sí | → `/` | No | No | “Alternate page with proper canonical” |
| Variantes `?param`, `%74exas` | Sí | 200 | Sí | → URL limpia | No | No | “Alternate page with proper canonical” |
| Variantes sin `/` final, `//`, `/index` | Sí | **308** | — | — | No | No | “Page with redirect” (1 salto, sin cadenas) |
| Mayúsculas `/Texas/` | No | **404** | — | — | No | No | sin redirect a minúsculas |
| Reservadas `/admin/` `/api/` `/blog/` `/health/` `/guides/` `/favicon.ico` `/index.html` | No | 404 | — | — | No | No | correcto; favicon.ico es gap real (ver §18) |
| Rutas negativas (`/texas/nope/`, slugs inexistentes) | No | 404 + `noindex` | — | `/404/` | No | No | correcto |

**No hay**: paginación, filtros, sorting, search, IDs en URLs, query parameters internos, ni CMS con rutas adicionales. La única superficie dinámica es `/{estado}/{ciudad}/{permit}/`.

---

## 3. Crawl (objetivo: 0 errores)

Crawl de **491 URLs** (454 sitemap + 37 negativas) contra build `INDEXABLE=true`:

- **454/454 sitemap URLs → HTTP 200. 0×3xx, 0×4xx, 0×5xx, 0 timeouts, 0 bodies vacíos.**
- 21×404: exclusivamente URLs negativas/draft/reservadas (ninguna en sitemap ni enlazada).
- TTFB: estáticas ≈ 2,4 ms; dinámicas **p50 943 ms, p90 981 ms, máx 1830 ms** (crawl con concurrencia 8; secuencial en frío 1,0–1,8 s, en caliente 0,26–0,57 s).
- **Hydration / JS**: carga en navegador de `/` → **consola limpia, 0 errores** (chequeo rápido; sin reproducir en las 454). Server-side render completo: todo el contenido está en el HTML inicial (ver §22).
- JSON-LD: **0 inválidos** en 454 páginas.
- Excepciones documentadas exactamente: ninguna URL indexable con error.

**Crawl final (objetivo §32): 0 errores · 0 404 en sitemap · 0 500 · 0 URLs duplicadas · 0 sitemap inválidas.** Cumplido.

---

## 4. Sitemap

Auditado en ambos estados (build aislado, sin guardar cambios).

**Estado actual (`INDEXABLE=false`):** `<?xml…?><urlset xmlns=…></urlset>` — **vacío y válido**. Correcto: no anunciar nada cuando robots bloquea todo.

**Simulación (`INDEXABLE=true`, dominio hipotético `https://permitfees.example`):**

- **454 URLs** = 7 estáticas + 50 estados + 100 hubs + 297 permit pages. **Coincide exactamente** con el conjunto calculado de páginas indexables (454), y con lo que devolvió el crawl (454×200).
- 0 duplicadas, 0 HTTP (todas `https://`), 0 sin `/` final, 0 `.html`, todas en `https://permitfees.example`, absolutas.
- XML: declaración `UTF-8` presente, namespace `http://www.sitemaps.org/schemas/sitemap/0.9` correcto, 62.314 bytes (bien bajo 50 MB / 50.000 URLs).
- `lastmod`: **297/454** (solo permit pages, desde `lastReviewedAt ?? updatedAt`); estados/hubs/estáticas sin `lastmod` — **por política del archivo** (nunca inventar fechas de build). Opcional mejorar los hubs con `lastReviewedAt` del perfil (P3).
- `changefreq` mensual/semanal: presente en entradas estáticas y de datos, permitido (Google lo ignora, no daña).
- Canonical coherente: cada `<loc>` == canonical de la página (verificado 454/454 en crawl).
- Construcción: `absoluteUrl()` / `absoluteFileUrl()` centralizados (`src/lib/seo/urls.ts`); `Sitemap:` en robots usa `absoluteFileUrl("/sitemap.xml")` → **función centralizada correcta, sin `/` final**.
- Gate compartido con las rutas: la query de `listSitemapEntries` replica las condiciones del router; verificado empíricamente que **ninguna URL de sitemap 404ea** (297/297 pasan también `evaluatePublishability`).

**Incidencia:** ninguna. Es el sitemap más limpio de la auditoría.

---

## 5. Robots.txt

**Estado actual (`INDEXABLE=false`):**

```
User-Agent: *
Disallow: /
```

Sin directiva `Sitemap:` (correcto: no hay nada indexable). **Imposible indexar accidentalmente el proyecto**: robots + `noindex` por página + `noindex` global en `layout.tsx` (tres capas).

**Simulación (`INDEXABLE=true`):**

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Host: permitfees.example
Sitemap: https://permitfees.example/sitemap.xml
```

- No bloquea páginas, CSS, JS (`/_next/static/*`), imágenes, fuentes ni `icon.svg` (todo bajo `/`, permitido). Verificado: los recursos se sirven 200.
- `/admin/` y `/api/` no existen (404) — bloqueo preventivo higiénico, sin daño.
- `Host:` usa `hostOnly()` (solo hostname) — correcto; directiva ignorada por Google, inofensiva.
- `Sitemap:` absoluto vía `absoluteFileUrl` — correcto.

**Incidencia:** ninguna.

---

## 6. Canonical

- **454/454** páginas de sitemap: canonical presente, absoluto, `https://`, host correcto, **== URL servida** (self-canonical). 0 cadenas, 0 cruzados, 0 hacia 404/noindex/URLs antiguas.
- Variantes: `?sort=`, `?utm_source=`, `?gclid=`, `?ref=` → canonical a la URL limpia ✓; `/%74exas/` → canonical a `/texas/` ✓; `/index/` → canonical a `/` ✓.
- Las páginas 404 llevan canonical a `/404/` (con `noindex` + status 404): irrelevante para Google, pero es un canonical “hacia una 404” — solo se resuelve si algún día `/index/` u otra variante sirviera contenido (P3).
- Estados, ciudades, permisos, guías (no existen), herramientas (no existen), legales: todos self-canonical. **Patrones de “Duplicate without user-selected canonical” / “Google chose different canonical” no se producen con la arquitectura actual.**

---

## 7. Redirects

- Política `trailingSlash: true` → **308** (permanente) de `/{ruta}` → `/{ruta}/`. Un solo salto, **sin cadenas, sin loops, sin redirect→404, sin redirect→noindex** (verificado en las variantes probadas).
- `//texas/houston/` y `/texas//houston/` → 308 → forma normalizada ✓.
- `/index` → 308 → `/index/` → **200 con el home** (canonical `/`). No es cadena (1 salto) pero conviene 308 `/index/` → `/` (P3).
- `/sitemap.xml/` y `/robots.txt/` → 308 → archivo ✓ (el motivo documentado de `absoluteFileUrl`).
- `?ref=1` se preserva en el redirect de slash: `.../building-permit-cost?ref=1` → `.../building-permit-cost/?ref=1` → 200 con canonical limpio ✓.
- **No existen** redirects de URLs antiguas/slug migrados: no hay histórico de slugs anteriores en el repo (no hay git; no se halló mapa de redirects). No hay “redirects creados en auditorías anteriores”.
- No hay meta-refresh ni JS redirects.

---

## 8. 404 / Soft 404

**Fuentes de 404 probadas (todas correctas):** estado/ciudad/permit inexistentes, slugs draft, slugs reservados, mayúsculas, `favicon.ico`, `/index.html`, `/404/`, `/admin/`, `/api/`, anidamientos estáticos. **Todas devuelven 404 real con `<meta name="robots" content="noindex">`** (dos capas: la que inyecta Next en respuestas 404 y la de `not-found.tsx`) — nunca 200 con “not found”.

**Ninguna URL de sitemap/navegación/breadcrumb cae en 404**: 454/454 sitemap 200; BFS de enlaces internos llega a 454/454 sin tocar ninguna 404.

**Riesgos de soft 404 (páginas 200 con contenido escaso):**

| URL | Motivo | Riesgo | Recomendación |
| --- | --- | --- | --- |
| `/mississippi/jackson/{building,electrical,plumbing}-permit-cost/`, `/vermont/burlington/{electrical,plumbing}-permit-fees/`, `/west-virginia/charleston/plumbing-permit-cost/` (6) | 0 reglas de tarifas: la página **declara con prosa** que no hay horario publicado | **Medio** — 200 sin cifras; Google podría clasificarla soft-404 si considera que no cumple la intención | Mantener prosa + fuentes + FAQ (las tienen); monitorizar en GSC tras indexar |
| `/texas/houston/demolition-permit-cost/` etc. (3 draft) | 404 real | Nulo | Correcto |
| Hubs futuros con 0 permit pages | El route del hub **no aplica gate**: renderiza “no individual permit pages yet” con perfil publicado | Bajo-hoy (0 casos), **medio futuro** | Considerar gate también en el hub (recomendación, no cambio hecho) |

**Caída de DB → soft-404 masivo:** `getDb() → null` o query fallida ⇒ `safeQuery` devuelve fallback `[]` ⇒ `getStateBySlug` null ⇒ **404 en todo el sitio** (degradación deliberada frente a 500). Protege contra “Server errors”, pero convierte una caída en “Not found” global — riesgo alto si Google crawllea durante un outage (ver §22, P1).

---

## 9. Indexabilidad

Estado B simulado (`INDEXABLE=true`), por clase: canonical self ✓ · robots `index, follow` + `googlebot {index, follow, max-image-preview: large}` ✓ · en sitemap ✓ · enlazada ✓.

- **Caso A (indexable + noindex): 0.** Los metadatos se derivan de `site.isIndexable && !noindex` en un solo punto (`buildMetadata`).
- **Caso B (noindex + sitemap): 0.** Sitemap filtra `noindex=false` con la misma query que las rutas; verificado 454/454.
- **Caso C (noindex + enlaces importantes): 0 en estado B** (no hay ninguna página 200+noindex). En estado A actual, **todas** las páginas son noindex **y** están enlazadas — correcto porque robots además bloquea todo (doble capa documentada en `SEO.md`).
- **Caso D (canonical A + sitemap B): 0.**
- **Caso E (robots blocked + canonical):** `/admin/`, `/api/` bloqueadas pero no existen; en estado A, robots bloquea todo pero las páginas siguen emitiendo canonical (propios) — no es contradicción dañina (noindex+canonical propio es aceptable), y desaparece al publicar.
- El gate editorial es estrictamente coherente con el sitemap: **0 páginas en sitemap que fallen el gate** (verificado replicando `evaluatePublishability` sobre las 300 filas).

---

## 10. Duplicación

- **URLs duplicadas: 0.** Slugs únicos por estado/ciudad (índices únicos en DB) y canónica normalizada (minúsculas + `/`).
- **Titles duplicados: 0** (454/454 únicos). **Descriptions duplicadas: 0.**
- **H1 duplicados: 3 pares** — “Charleston … Permit Cost” en `/south-carolina/charleston/…` vs `/west-virginia/charleston/…` (building, electrical, plumbing). Mismo nombre de ciudad en dos estados. El `<title>` sí incluye estado → **no es duplicación de resultado**, solo H1 genérico (P3).
- **Contenido:** misma plantilla, pero cada hub/permit tiene prosa propia (`summary`, `localContext`, `valuationBasis`, `intro`, `localSummary`), fuentes y datos distintos; mediana 1.805 palabras. **No hay pares con contenido prácticamente idéntico** salvo la clase de estado (§11).
- Slug `building-permit-fees` vs `building-permit-cost` coexisten según jurisdicción — inconsistencia cosmética, sin duplicación (P3).

---

## 11. Thin content (riesgo SEO)

| URL(s) | Tipo | Motivo | Riesgo | Recomendación |
| --- | --- | --- | --- |---|
| **50 páginas de estado** (49 con <250 palabras; mín 219, mediana estatal ≈227) | Directorio | Pocas palabras + gran nº de URLs; casi toda la página es la tabla de jurisdicciones (datos reales y útiles, pero prosa mínima) | **Medio**: “Crawled – currently not indexed” o clasificación baja en sitio nuevo | Añadir prosa editorial real por estado (contexto de licencias/valuación) antes de pedir indexación masiva; no rellenar |
| 6 páginas “no published fee schedule” | Permit | 0 cifras | Medio (soft-404) | Mantener explicación + fuentes + FAQs (ya están) |
| 186/297 permit pages con **1 sola fuente** | Permit | Fuente única, gate exige ≥1 | Bajo-medio (E-E-A-T) | Ampliar fuentes donde existan (editorial) |
| Resto (hubs mediana 1.3k+, permit 819–2.825, estáticas 431–1.070) | — | Contenido sustancial | Nulo | — |

Ninguna página indexable está vacía o con “not found”.

---

## 12. Enlazado interno

- **BFS desde `/` sobre el crawl: alcanza 454/454 páginas del sitemap → 0 orphan, 0 enlaces a 404, 0 enlaces a redirects (usan ya la forma canónica con `/`), 0 enlaces a noindex.**
- Jerarquía **Home → (mapa SVG con links + `/states/`) → State → City → Permit**完整 funciona: cada nivel enlaza al siguiente (tabla de jurisdictions en estado, tabla de permit pages en hub, hermanos en permit page).
- Breadcrumbs visibles en las 3 clases dinámicas (Home/Estado/Ciudad/Permit) + `BreadcrumbList` JSON-LD coincide.
- Enlaces por página: mín 7 (estáticas: header+footer), media 11 — incluyendo nav sticky y footer en todas.
- Anchors: descriptivos (nombre de jurisdicción / “permit type cost”); externos con `rel="nofollow noopener" target="_blank"` ✓.
- Footer cubre Browse/Site/Legal; header 3 items + panel móvil.

---

## 13. Orphan pages

**0.** (Definición: en sitemap + indexable + sin enlaces internos.) Las 454 son alcanzables desde home. Ninguna depende solo del sitemap.

---

## 14. Paginación / listados

`/states/` lista 100 ciudades y 50 estados en **una sola URL sin paginación, sin filtros, sin parámetros**. Tablas con `.tablewrap { overflow-x: auto }` → legibles en móvil. **No se generan URLs inútiles.** Riesgo futuro: si el directorio crece a miles de ciudades, valorar paginación canónica — hoy no aplica.

---

## 15. Parámetros y URLs dinámicas

- **Internos: 0** (ninguna URL del sitio genera query strings).
- Externos probados: `?utm_source`, `?gclid`, `?sort`, `?ref` → 200 con canonical a la limpia; robots **no** los bloquea (bien: el canonical los gestiona; bloquearlos en robots impediría ver el canonical).
- Crawl traps / URLs infinitas: **no detectados** (sin open redirect, sin generación de variantes desde enlaces internos).
- `%74exas` y `//` — normalizados o canonicizados ✓.
- Única nota: al no bloquear parámetros, Google puede mostrar la categoría “Alternate page with proper canonical” con estas variantes — **esperada y benigna**.

---

## 16. Title tags (454 auditados, evaluación de calidad)

- Presencia 454/454; únicos 454/454; vacíos 0.
- Longitudes: **mín 20, máx 65** (límite propio `TITLE_MAX_LENGTH`); **5 títulos en el tope** con elipsis propia y sufijo tras la elipsis, p. ej. `South Bend electrical permit cost: the department's… | Permit Fee` — se lee algo cortado (P3).
- Patrón por clase, con keyword + lugar + tipo:
  - Estado: `Minnesota permit costs by city | Permit Fee` ✓ (keyword “permit costs” + estado)
  - Hub: `Saint Paul, MN permit fees and requirements | Permit Fee` ✓
  - Permit: `seoTitle` editorial (297 únicos, todos con ciudad) ✓
  - Estáticas: home `Construction permit costs from official fee schedules` (sin sufijo, intención informativa) ✓; `Privacy | Permit Fee` (20 chars) corto pero correcto.
- Sin titles genéricos repetidos, sin artefactos markdown en titles (0).
- **Mejora cualitativa pendiente (P3):** 5 títulos truncados manualmente — acortar el `seoTitle` editorial.

---

## 17. Meta descriptions

- Presencia 454/454, únicas 454/454, longitudes 58–164 (**0 > 165**, corte en 155–165 por `normalizeSeoDescription`).
- Cada una menciona ciudad/tipo/intención — no son plantillas idénticas.
- **PROBLEMA (P2): 60 descriptions contienen `**` literal de markdown**, p. ej. `Saint Paul prices a building permit from a **103-row valuation table**…` — se vería literal en el snippet de Google. Afecta a `seoDescription`/`summary` almacenados con énfasis markdown que ningún componente limpia para meta. Titles y H1/H2: 0 con markdown (los H2 se renderizan con `EditorialText` que sí formatea).

---

## 18. H1 / Headings

- **1 H1 por página en 454/454**; ninguno vacío; ninguno duplicado dentro de una página.
- Jerarquía: H1 → 4–11 H2 por página sin saltos detectados (estados 4, hubs 9, permit 11, home 9, estáticas 5). H3 en tarjetas de departamentos (bajo H2 “Who to contact”) ✓.
- H1 relevantes con lugar/permiso (muestras en §10); únicos salvo los 3 pares de Charleston (P3).
- No hay headings usados solo para SEO (son encabezados reales de secciones visibles).

---

## 19. Imágenes

- **`public/` está vacío.** Cero `<img>` en todo el sitio (verificado en crawl: 0 páginas con `<img>`): no hay alt ausentes, imágenes rotas ni duplicadas — tampoco aportan.
- `src/app/icon.svg` sirve como favicon moderno (`<link rel="icon">` inyectado), pero **`/favicon.ico` → 404** (P3: añadir `public/favicon.ico` para crawlers/AdSense que lo piden por convención).
- El mapa US es SVG inline con `<Link>` por estado ✓ (sin peso de imagen, con utilidad real).
- **No añadir imágenes solo por SEO** — correcto; el sitio es textual/tabular y las imágenes hoy no aportarían.
- Peso de página: HTML medio 81 KB, máx 243 KB (sin imágenes).

---

## 20. Structured data

- JSON-LD en **454/454 + global**: `Organization`, `WebSite` (layout), `WebPage` (todas), `BreadcrumbList` (estados/hubs/permits/states), `FAQPage` (permits con FAQs). **0 sintaxis inválida.**
- `FAQPage` solo se emite si hay FAQs **visibles** en la página (mismo array renderizado en `<details>`) — **no hay FAQ inventada**. Nota: las respuestas están plegadas (`<details>`); Google las indexa, pero si se quiere rich result garantizado, visible-desplegado es más seguro (P3, decisión editorial).
- **No hay** `AggregateRating`, `reviews`, `Product`, `Offer`, `sameAs`, `logo` — deliberado y documentado (`jsonld.ts`): **0 datos inventados**, que es exactamente lo que evita manual actions.
- URLs del schema: `permitfees.example` (pendiente de dominio real, §28).
- `dateModified`/`datePublished` desde verificación/revisión, nunca la fecha de build ✓.
- Ausencia menor: `WebPage` sin `primaryImageOfPage`/`Organization.logo` (no hay logo asset) — P3.

---

## 21. Open Graph / Social

- OG:title, OG:description, OG:url, OG:site_name, OG:locale presentes y **coherentes con canonical en 454/454** (0 desajustes). Twitter card `summary` (sin imagen).
- **`og:image` ausente en 454/454** — no hay imagen social (1200×630) ni archivo en `public/`. Al compartir el enlace: tarjeta de solo texto. P3 para SEO, relevante para CTR social.
- 0 referencias a dominios antiguos/temporales en OG (solo el placeholder pendiente, §28).

---

## 22. Performance SEO (Core Web Vitals)

**NO VERIFICADO — requiere medición en producción** (no se ejecutó Lighthouse/CrUX; no se inventan métricas).

Problemas potenciales identificados en el código/build:

1. **JS pesado:** 637 KB sin comprimir en 9 archivos para la página de permit (chunks de 229 KB + 165 KB + 112 KB; React+Next+app+mapa). Con gzip/brotli bajará mucho, pero es un punto de atención para INP/LCP en móvil. P2 antes de AdSense (AdSense evalúa UX).
2. **TTFB alto en rutas dinámicas:** p50 943 ms en crawl; `Cache-Control: private, no-cache, no-store` y **sin `x-nextjs-cache`** en `/[state]`, `/[state]/[city]`, `/[state]/[city]/[permit]` **pese a `export const revalidate = 3600`** — la ISR declarada **no se observó en runtime** (las estáticas `/`, `/states/` sí cachean: `x-nextjs-cache: HIT`). Cada visita (humana o Googlebot) re-renderiza y ejecuta 2–4 queries a Neon. **Esto es lo que más afecta “Crawled – currently not indexed” en un sitio nuevo.** Ver P1-1.
3. Fuentes: `next/font` auto-hospedadas con `display: swap` y preload ✓ (0 render-blocking de CDN).
4. Sin imágenes ⇒ sin LCP por imagen; el LCP probable es texto Hero (bien).
5. CLS: fonts con `display:swap` + variables — riesgo bajo; medir en producción.

---

## 23. JavaScript / rendering

- **Todo el contenido principal está en el HTML del servidor** (SSR/prerender): tablas, prosa, FAQs, breadcrumbs, fuentes — verificado en el HTML crudo de las 454 URLs (word count 219–5.357 en HTML, sin ejecutar JS).
- **Ningún contenido depende de interacción para existir**: sin `useSearchParams`, sin fetch en cliente, sin APIs para renderizar, sin estados vacíos (0 bodies vacíos en crawl). La única interacción es el menú móvil y el mapa (ya renderizado como links).
- Hydration: consola limpia en carga de `/` (chequeo rápido); `reactStrictMode` activo; 0 reportes de error.
- FAQs en `<details>`: presentes en DOM y JSON-LD desde el servidor.
- Si la DB no responde: HTML vacío de datos → 404 (no 500, no shell) — comportamiento documentado en §8.

---

## 24. Mobile SEO

- `viewport width=device-width, initial-scale=1` ✓ en 454/454; `<html lang="en-US">` ✓.
- Responsive verificado (captura rápida del home a ~445 px): header con menú hamburguesa funcional, sin overflow, tablas con scroll horizontal propio (`.tablewrap`), tipografía fluida.
- Contenido equivalente al desktop: mismo HTML (SSR único, sin `?amp` ni variantes) — 0 elementos clave ocultos con `display:none` por viewport (revisado en CSS: ocultos solo menú/desktop rail).
- Sin botones <44px detectables de forma crítica; skip-link y landmarks OK.

---

## 25. Accesibilidad con impacto SEO

- Landmarks: `<main id="main">` + skip-link ✓; header/footer ✓.
- Un H1 + jerarquía correcta (§18); alt: no hay `<img>` (SVG del mapa con links accesibles).
- Links/botones con texto descriptivo (0 `href="#"`); foco/teclado: comportamiento estándar de `next/link` y `<details>` (no auditado exhaustivamente — fuera de alcance WCAG).
- `formatDetection` desactivado (teléfono/email) — correcto, evita detección errónea.

---

## 26. Páginas legales

| Página | HTTP | Índice (estado B) | Sitemap | Canonical | Navegación | Palabras |
| --- | ---: | --- | --- | --- | --- | ---: |
| `/about/` | 200 | index | Sí | self | header+footer | 634 |
| `/contact/` | 200 | index | Sí | self | footer | 431 |
| `/privacy/` | 200 | index | Sí | self | footer+panel móvil | 663 |
| `/terms/` | 200 | index | Sí | self | footer+panel móvil | 653 |
| Cookie Policy | **no existe** | — | — | — | — | — |
| About/author info | `/about/` ✓ | index | Sí | self | header | — |

- Todas indexables y bien enlazadas: **correcto** (About/Contact/Terms suelen serlo; Privacy también conviene indexar).
- **Cookie Policy: no existe** porque hoy no hay cookies ni scripts de terceros (solo fuentes propias). **Antes de AdSense sí serán necesarias** (cookies de preferencia/publicidad) → P2 checklist.
- Nota: `NEXT_PUBLIC_CONTACT_EMAIL` vacío en ejemplo; la página muestra explícitamente que aún no se pueden recibir correcciones (honesto; valorar antes de AdSense — los revisores buscan forma de contacto real).

---

## 27. Simulación Search Console (sin datos reales; predicción sobre el crawl)

| Categoría | URLs que podrían caer | Por qué | Cómo evitarlo |
| --- | --- | --- | --- |
| **Indexadas correctamente** | Las 454 del sitemap (menos las que Google juzgue finas) | 200 + canonical self + noindex ausente + enlazadas + sitemap exacto | Mantener; buen contenido por URL |
| **Crawled – currently not indexed** | 50 páginas de estado (219–250 palabras); posiblemente algunos hubs “sin schedule” | Contenido escaso/tmplata para un sitio nuevo y sin autoridad; Google examina y descarta | P1/P2: reforzar prosa de estados; TTFB bajo (ISR); no solicitar todo el sitemap de golpe |
| **Discovered – currently not indexed** | Cola inicial de las 454 al conectar el dominio | Sitio nuevo, priorización baja; agravado si el crawl es lento (§22) | ISR activa + sitemap pequeño y limpio (ya lo es) + enlaces internos sólidos (ya lo están) |
| **Duplicate / Duplicate, Google chose different canonical** | **Ninguna esperada** | Toda URL tiene canonical propio y no hay contenido duplicado real | Vigilar solo si el dominio real añade variantes (www/non-www) — configurar una sola vez al conectar |
| **Alternate page with proper canonical** | `/index/`, variantes `?param`, `%74exas/` | Canonicaliza correctamente | Opcional: 308 de `/index/`; innecesario el resto |
| **Soft 404** | 6 páginas “no published fee schedule” (200 sin cifras) | Google puede interpretar “no resultado” | Monitorizar; mantener prosa/FAQ/fuentes; gate futuro en hubs |
| **Page with redirect** | Variantes sin `/` final si alguien las enlaza fuera | 308 de trailing slash | Los enlaces internos ya usan `/`; no hay que hacer nada |
| **Blocked by robots.txt** | `/admin/`, `/api/` (404) — y **todo** el sitio mientras `INDEXABLE=false` | Intencional | Al publicar: robots correcto (verificado) |
| **Excluded by noindex** | Mientras `INDEXABLE=false`: las 454. Tras publicar: **0 páginas 200+noindex** | Estado actual intencionado | El flip a `true` elimina la categoría |
| **Server errors** | 0 observados. Riesgo: outage de DB ⇒ **404 masivo** (no 500) | `safeQuery` degrada a 404 | P1: caché/ISR reduce la exposición; alertas de DB |
| **Sitemap errors** | 0 en ambos estados | XML válido, URLs == real, HTTPS, sin duplicados | Solo cambiar el host al dominio real (atómico con INDEXABLE) |

---

## 28. Sitemap vs realidad (coherencia)

**Estado simulado `INDEXABLE=true` (dominio hipotético):**

- URLs totales generables (contenido): **457** (7 estáticas + 50 estados + 100 hubs + 300 filas de permit)
- URLs indexables: **454** (457 − 3 draft)
- URLs noindex con HTTP 200: **0** (en estado A actual: 454 noindex — correcto)
- URLs en sitemap: **454** · sitemap válidas: **454** · sitemap inválidas: **0**
- HTTP 200 (de sitemap): **454** · 3xx: **0 en sitemap** (variantes sin `/` fuera del sitemap) · 4xx: **3** (draft) + 18 negativas de prueba = 21 observadas en crawl · 5xx: **0**
- Duplicadas (contenido/URL): **0** · Orphan: **0**

**Coherencia:** 454 sitemap = 454 indexables = 454×200 = 454 alcanzables por enlaces. 454 + 3 draft = 457 = total de filas + estáticas. ✔

---

## 29. Test de producción simulada (`INDEXABLE=true` sin guardar)

Ejecutado en copia aislada con **solo** la variable de entorno en tiempo de build (`.env.local` intacto; comprobado después: sigue `false`):

- **Sitemap:** 454 URLs válidas (§4) ✓
- **robots.txt:** allow + Host + Sitemap absoluto (§5) ✓
- **Canonical:** 454/454 self, HTTPS, host correcto ✓
- **Metadata:** 454/454 `index, follow` + googlebot; titles/descriptions únicos ✓
- **URLs:** mismas 454, 0 sorpresas (ninguna draft se cuela, ninguna publicada falta) ✓
- **Crawl:** 454/454 200, 0 errores (§3) ✓
- **Conclusión: el flip `false → true` no produce sorpresas**, siempre que se haga **junto con** el dominio real (ambas variables documentadas como par atómico en `.env.local`).
- Nota: `sitemap.xml` y páginas estáticas se prerenderizan en build ⇒ tras el flip hay que **rebuild/deploy** (el sitemap vacío de hoy está embebido en `.next`).

---

## 30. Errores de configuración

| Elemento | Estado actual | Riesgo |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://permitfees.example` (**placeholder**, TODO documentado) | **P0** si se publica así |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `false` (correcto; no tocado) | Flip debe ser atómico con el dominio |
| `.env.example` | `NEXT_PUBLIC_SITE_INDEXABLE="true"` + `SITE_URL="http://localhost:3000"` | **Trampa (P2):** copiar el ejemplo tal cual ⇒ build indexable con canonicals `localhost` |
| Fallback de `site.ts` | `http://localhost:3000` si falta la variable | Aceptable; protegido por `INDEXABLE` no-true |
| `localhost`/`127.0.0.1` en HTML | **0** en las 454 páginas (el match de Detroit es la URL externa `detroitmi.gov/sites/detroitmi.localhost/…`, path raro pero resuelve 200) | P3 higiene de dato |
| `http://` internos | **0** (1 externo: Missoula, aceptable) | P3 |
| Diferencias dev/prod | Mismo build; única diferencia son las 2 variables | OK |
| HSTS | `max-age=63072000; includeSubDomains; preload` ya activo | P3: `preload` es irreversible por dominio — confirmar al conectar el dominio definitivo |

---

## 31. Tests existentes

- **`npm test` (vitest): 112 archivos, 2099 tests → 2099 pasados, 0 fallidos** (incluye `tests/seo/{urls,metadata,robots,slugs,status-codes}` e integración de sitemap vs rutas con DB real).
- **`npm run typecheck`: 0 errores TypeScript.**
- **`npm run build`: OK** (estado A `INDEXABLE=false`) y **OK** (simulación B `INDEXABLE=true`), ambos en copia aislada. 12 rutas generadas; ninguna advertencia nueva (solo el aviso de lockfiles duplicados por la copia, artefacto del aislamiento).
- No se modificó ningún test.

---

## 32. Crawl final

**454/454 indexables: 200 OK · 0 404 · 0 500 · 0 3xx · 0 duplicadas · 0 sitemap inválidas · 0 canonicals erróneos · 0 noindex en sitemap · 0 orphans · 0 enlaces internos rotos.** Objetivo cumplido sin excepciones.

---

## 33. P0 — BLOQUEADOR

1. **Dominio inexistente (`permitfees.example`).** No publicar hasta configurar el dominio real en `NEXT_PUBLIC_SITE_URL` (junto con el flip de `INDEXABLE`): hoy canonical, sitemap, robots (`Host`), OG, JSON-LD y breadcrumbs apuntan a un TLD `.example` que no resuelve ⇒ en cuanto se indexe, “Sitemap errors” + canonicals huérfanas.

## 34. P1 — CRÍTICO (antes de activar indexación)

1. **ISR/revalidate no efectivo en las 3 rutas dinámicas** (no-store, sin `x-nextjs-cache`, TTFB p50 ≈ 0,9 s, 2–4 queries a DB por visita). Riesgo directo de “Crawled – currently not indexed” y de cuello de botella al conectar el dominio. Requiere investigar por qué `revalidate = 3600` no se aplica (¿falta `generateStaticParams`/on-demand ISR?) y medir TTFB real.
2. **Dependencia total de la DB → caída = 404 masivo en todo el sitio** (mejor que 500, pero “Not found” global para Googlebot durante el outage). Combinar con P1-1: caché/ISR hace que el sitio sobreviva a un outage de DB.
3. **Reforzar las 50 páginas de estado finas (219–250 palabras)** antes de pedir indexación masiva — es la clase con mayor probabilidad de “Crawled – currently not indexed”.

## 35. P2 — IMPORTANTE (antes de solicitar AdSense)

1. **60 meta descriptions con `**` markdown literal** → snippets sucios en SERP.
2. **45/350 URLs de fuentes oficiales inaccesibles** (~13%): ~10–11 en 404 real (Baltimore, Toledo, Annapolis, Huntington, Fairbanks ×3, Little Rock, Warwick…), ~18 en 403 (probable anti-bot, verificar a mano) y ~16 timeouts. Enlaces salientes rotos en páginas indexables = peor E-EA-T y hallazgo típico de revisión de AdSense.
3. **Sin Cookie Policy / sin banner** → necesario cuando entre AdSense (cookies). Mismo motivo: email de contacto real visible.
4. **`.env.example` con `INDEXABLE="true"` + localhost** → trampa de configuración (documentar o invertir el default).
5. **Sin favicon.ico y sin og:image** (afecta percepción/social; AdSense revisa pulido) — `public/favicon.ico` + `public/og.png` y referenciarlo en `buildMetadata`.
6. JS 637 KB sin comprimir → medir CWV en producción y reducir si INP/móvil lo exige.

## 36. P3 — MEJORA (no bloquea)

1. H1 duplicados en los 3 pares de Charleston (WV/SC): añadir estado al H1.
2. `/index/` devuelve 200 con canonical a `/` → mejor 308 a `/`.
3. Variantes en mayúsculas (`/Texas/`) → 404 sin redirect a minúsculas (hoy no hay enlaces así; armonizar con `normalizePath`).
4. 5 titles en el tope de 65 con elipsis + sufijo (`… | Permit Fee`).
5. Slug variable `building-permit-fees` vs `-cost`.
6. `lastmod` ausente en 157 entradas del sitemap (estados/hubs/estáticas) — opcional: usar `profile.lastReviewedAt` (política actual de “no inventar fechas” es defendible).
7. FAQ dentro de `<details>` plegado (Google las lee, pero “visible” es más seguro para rich results).
8. URL externa con path `detroitmi.localhost` y 1 enlace fuente `http://` (Missoula) → normalizar.
9. `Host:`/HSTS `preload` — confirmar al conectar el dominio definitivo.
10. Sin `logo`/`primaryImageOfPage` en JSON-LD (no hay assets de marca).

## 37. OK (correcto tal cual)

Sitemap (454 exactas, XML válido, gate compartido) · robots en ambos estados · canonical 454/454 · 0 duplicados de contenido · 0 orphans · 0 enlaces rotos internos · redirects 308 de un solo salto sin bucles · 404 reales con `noindex` (sin soft-404 falsos) · titles/descriptions únicos y dentro de longitud · 1 H1/página · JSON-LD válido sin datos inventados · FAQ markup coincide con contenido visible · OG coherente · viewport/movil · skip-link/landmarks · gate editorial coherente con sitemap (0 discrepancy) · 2099 tests verdes · typecheck limpio · ambos builds OK.

---

## 38. Checklist pre-publicación (con el repo tal cual)

- [ ] Contratar/configurar el dominio definitivo y reemplazar `NEXT_PUBLIC_SITE_URL` (**único cambio pendiente ya documentado en `.env.local`**)
- [ ] Flip atómico `NEXT_PUBLIC_SITE_INDEXABLE="true"` **en el mismo deploy** que el dominio
- [ ] Resolver P1-1 (ISR/TTFB) y P1-2 (resiliencia ante caída de DB)
- [ ] Reforzar prosa de las 50 páginas de estado (P1-3)
- [ ] Reconstruir y verificar: `robots.txt` con host real, `sitemap.xml` con 454 URLs nuevas, canonicals globalmente cambiados (búsqueda en HTML de `permitfees.example` = 0)
- [ ] `npm run check` (typecheck+tests) y build final en el entorno de producción
- [ ] Añadir `public/favicon.ico` (evita 404 de convención en el primer crawl)

## 39. Checklist posterior al dominio

- [ ] Añadir propiedad en Search Console (verificación + enviar sitemap)
- [ ] Comprobar informe “Vista general”: 454 descubiertas, esperar indexación selectiva
- [ ] Vigilar categorías: *Crawled – not indexed* (estados), *Alternate page with proper canonical* (`/index/`, params), *Soft 404* (6 páginas sin schedule)
- [ ] Configurar dominio canónico único (www vs non-www → 308 a la forma elegida) y probar `https://`, `http://`, `www`, `non-www`
- [ ] Robots.txt con `Host:` y `Sitemap:` del dominio real (ya usa la función centralizada)
- [ ] Corregir 45 fuentes rotas + 60 descriptions con markdown (P2)
- [ ] Ping/actualización inicial del sitemap; luego dejar que GSC programe
- [ ] Medir CWV reales (CrUX/Lighthouse) y ajustar JS (P2-6)
- [ ] Cookie policy + email de contacto antes de solicitar AdSense
- [ ] Monitorear 404 en GSC (esperadas: solo drafts/negativas si alguien las prueba)

## 40. Conclusión

La base técnica de indexación es **sólida y rara de ver**: sitemap ≡ páginas indexables ≡ crawl 200 ≡ enlaces internos, con canonical/robots/titles/descriptions limpios y cero duplicación real. **No hay ningún problema P0 de código**: el único bloqueador es el dominio placeholder, que ya está deliberadamente desactivado (`INDEXABLE=false`). El sitio **está condicionado** para indexarse: solo cuando se conecte el dominio (atómico con el flip), se resuelva la caché/TTFB de las rutas dinámicas y se refuercen las páginas de estado. Para AdSense, además, fuentes oficiales rotas, descriptions con markdown y la ausencia de cookie policy/contacto.

---

*Generado por auditoría de solo lectura el 2026-09-28. Artefactos: `.tmp-audit/seo-inv-2026-09-28.json`, `.tmp-audit/crawl-B-2026-09-28.json`, `.tmp-audit/seo-sim-2026-09-28/` (copia descartable con los dos builds).*
