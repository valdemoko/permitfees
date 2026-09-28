# DOMAIN-MIGRATION-REPORT-2026-09-28

**Alcance:** migración conservadora del proyecto al dominio real de producción `https://permitfees.site`.
**Método:** inspección primero, cambios mínimos después. No se rehicieron auditorías cerradas (DB/Neon, `safeQuery`, ISR/`generateStaticParams`, reglas de cálculo, tarifas, fechas, fuentes, slugs, estructura de URLs, datos de ciudades/estados, editorial gates, tests existentes). No se modificó ningún dato de DB (solo verificación de lectura con `npm run db:verify` → todas las comprobaciones OK).
**Fuentes de verdad usadas:** `SEO-SEARCH-CONSOLE-AUDIT-2026-09-28.md`, `TECHNICAL-UX-PERFORMANCE-AUDIT-2026-09-28.md`, `FINAL-PRE-PUBLISH-AUDIT-2026-09-27.md`, `PRODUCTION-READINESS-REPORT-2026-09-27.md`. Los informes `MASTER-ADSENSE-QUALITY-AUDIT-2026-09-28.md` y `FINAL-PRE-PUBLISH-QUALITY-REPORT-2026-09-28.md` no existen en el repositorio.

---

## 1. Domain

| | |
| --- | --- |
| Dominio anterior / provisional | `https://permitfees.example` (solo en `.env.local`; placeholder documentado como P0 en la auditoría SEO) |
| Dominio final | `https://permitfees.site` |
| Dominio canónico único | sí — `permitfees.site` sin `www`. No existe ninguna política de `www` en el código; en Vercel debe añadirse `www.permitfees.site` como dominio adicional redirigido (301/308) al ápice, no como dominio indexable paralelo. |

**Referencias modificadas (las únicas que existían):**

- `.env.local` — `NEXT_PUBLIC_SITE_URL="https://permitfees.example"` → `"https://permitfees.site"`. Era la única referencia en todo el repositorio: canonical, `og:url`, JSON-LD (`WebSite`/`Organization`/`WebPage`/`BreadcrumbList`), `metadataBase`, `Host:` y `Sitemap:` de robots y las 454 URLs del sitemap derivan **todas** de la fuente única `resolveSiteUrl()` en `src/lib/site.ts` vía `absoluteUrl()`/`absoluteFileUrl()` (`src/lib/seo/urls.ts`). No hizo falta tocar ningún consumidor.
- `.env.example` — actualizado a `https://permitfees.site` y corregida la "trampa" documentada (P2 de la auditoría SEO): el ejemplo ya no combina `NEXT_PUBLIC_SITE_INDEXABLE="true"` con un origen local; ahora el default es `"false"` con instrucciones explícitas.

**No se tocó** (B: históricos/fixtures, trazabilidad preservada): los informes de auditoría anteriores (2026-09-27/28) conservan sus menciones al placeholder porque describen el estado histórico; el dominio `detroitmi.localhost` dentro de la URL de la fuente oficial de Detroit es parte del dato de fuente y no se altera.

## 2. Branding

| | |
| --- | --- |
| Nombre anterior | Permit Fee Intelligence |
| Nombre final | **PermitFees** (visible); "Permit Fees" aparece en la copy genérica cuando el inglés lo pide naturalmente, sin forzar la marca |

Ubicaciones actualizadas (todas las de superficie pública; el resto ya derivaba de la fuente única):

- `src/lib/site.ts` — `site.name = "PermitFees"`, `site.shortName = "PermitFees"` (afecta a: sufijo de `<title>`, `og:site_name`, `applicationName`, header, footer, JSON-LD `WebSite`/`Organization`/`WebPage` y disclaimers notOfficial).
- `src/app/page.tsx` — lead del hero de la homepage.
- `src/app/about/page.tsx` — descripción de página y sección "Who maintains this site".
- `src/app/icon.svg` — `aria-label` del favicon.
- `src/app/globals.css` — cabecera del design system (comentario).
- `README.md`, `ARCHITECTURE.md`, `SEO.md`, `.env.example` — títulos/encabezados de documentación viva.

**Deliberadamente NO cambiado:** los campos `verifiedBy` / `RESEARCHER` ("Permit Fee Intelligence research pass …") presentes en ~95 seeds de contenido. Son registros de procedencia de verificación almacenados en la base de datos (regla NO TOCAR: source/verification records); renombrarlos reescribiría el histórico de verificación y los tests que los validan. No son branding visible. El único branding visible que usaba el nombre antiguo era el derivado de `site.name`, ya migrado.

No se inventaron slogans, credenciales, ni afirmaciones tipo "official/government/certified". La identidad sigue basada en las descripciones existentes (fuentes oficiales, transparencia, independencia), solo con la marca correcta.

## 3. SEO

| Elemento | Estado |
| --- | --- |
| `metadataBase` | `new URL(site.url)` en `layout.tsx` → `https://permitfees.site` (derivado, sin cambio de código) |
| Canonicals | 454/454 verificadas por crawl (ver §7): absolutas, `https://permitfees.site/...`, self-canonical, una sola forma con `/` final |
| Sitemap | 454 URLs exactas, todas `https://permitfees.site/...`, 0 duplicadas, 0 HTTP, 0 localhost/placeholder/preview; `lastmod` solo en las 297 permit pages desde fechas reales de revisión/verificación — **sin fechas inventadas**; sin `changefreq`/`priority` inventados |
| Robots.txt | Con `INDEXABLE=true`: `Allow: /` + `Disallow: /admin/, /api/` + `Host: permitfees.site` + `Sitemap: https://permitfees.site/sitemap.xml`. Con `INDEXABLE=false`: `Disallow: /` (conservado intacto en el entorno de edición) |
| JSON-LD | `Organization` + `WebSite` (globales) y `WebPage`/`BreadcrumbList`/`FAQPage` por página; todas las URLs propias → `permitfees.site`; 0 propiedades inventadas; 0 referencias al dominio provisional |
| OG / Twitter | `og:url` y canonical coherentes en el crawl; `og:site_name` = PermitFees; Twitter `summary` (sin `og:image` — sigue pendiente como P3/P2 de auditorías anteriores, no es parte de esta migración) |

Los titles/descriptions editoriales de las páginas no se reescribieron (regla: no reescribir las 454). Único cambio colateral: el sufijo de marca de los títulos pasa de `| Permit Fee` a `| PermitFees` vía `site.shortName`.

## 4. Internal links

- Enlaces absolutos internos: **no existía ninguno hardcodeado** en el código publicado; todo lo absoluto se construye con `absoluteUrl()`, ahora con el dominio real.
- Enlaces relativos verificados en el crawl (454/454): navegación, footer, breadcrumbs, home→estados, estado→ciudades, ciudad→permisos, About, Methodology, legal, fuentes. 0 enlaces rotos, 0 orphans, 0 enlaces a 404/redirects/noindex.
- Enlaces externos oficiales (`.gov` etc.): intactos.

## 5. Legal / Contact

- **Email `contacto.webproyectos@gmail.com` NO fue modificado.** Sigue exactamente igual en `.env.local` (`NEXT_PUBLIC_CONTACT_EMAIL`) y es la única fuente (`src/app/contact/page.tsx` lo lee de la variable; no hay copias hardcodeadas en plantillas).
- Páginas legales (`/privacy/`, `/terms/`, `/cookies/`, `/contact/`, `/about/`): sin referencias al dominio o nombre anterior — todo el branding visible ya fluía de `site.name`. No se cambió redacción legal, no se inventaron empresa, dirección postal, teléfono ni entidad legal.
- Cookie Policy existente (/cookies/): sin menciones al dominio provisional; describe con precisión el estado actual (sin cookies/analytics/ads). CMP: no existe (correcto: no hay cookies que consentir). No se añadieron trackers ni publicidad.

## 6. Ads / ads.txt

- No existe `ads.txt` en el repositorio. No se inventó ninguno (no hay publisher ID configurado). Cuando se configure AdSense, deberá existir un archivo servido en `https://permitfees.site/ads.txt`.
- No se cambió ni inventó ningún publisher ID.

## 7. Verificación

| # | Comprobación | Resultado |
| --- | --- | --- |
| 1 | TypeScript (`npm run typecheck`) | ✅ 0 errores |
| 2 | Tests (`npm test`) | ✅ 115 archivos / 2112 tests, todos pasan (tests actualizados solo en el literal del sufijo de título `| PermitFees`) |
| 3 | Build producción (`rm -rf .next && npm run build`) | ✅ OK, 0 errores; rutas dinámicas prerenderizadas como SSG (`generateStaticParams`) — ISR activo tal como quedó de trabajos anteriores |
| 4 | Sitemap (INDEXABLE=false, estado local) | ✅ `urlset` vacío — comportamiento seguro conservado |
| 5 | Sitemap (INDEXABLE=true simulado) | ✅ 454 URLs, todas `https://permitfees.site/...`, 0 duplicadas, 0 lastmod falsos |
| 6 | Robots (ambos estados) | ✅ Verificados arriba; sin localhost ni placeholder |
| 7 | Metadata / canonicals | ✅ 454/454: canonical self absoluta en `permitfees.site`, sin noindex, 1 H1, title/OG/Twitter/JSON-LD presentes |
| 8 | JSON-LD / OG | ✅ `WebSite`/`Organization`/`WebPage`/`BreadcrumbList` con `https://permitfees.site` |
| 9 | Búsqueda global de dominios antiguos | ✅ `permitfees.example`: **0** en `src/`, `tests/`, `scripts/`, `public/`, `.env.local`, `.env.example`; `localhost`: solo el fallback defensivo en `resolveSiteUrl()` y la URL oficial de Detroit (dato de fuente); "Permit Fee Intelligence": 0 en superficie pública (restan solo `verifiedBy` históricos de seeds/DB, protegidos) |
| 10 | Crawl de las 454 URLs (servidor `next start`, INDEXABLE=true simulado) | ✅ 454/454 HTTP 200 · 0×3xx/4xx/5xx · 0 canonicals cruzadas · 0 placeholders · artefacto: `.tmp-audit/sim-2026-09-28/crawl-migration-2026-09-28.json` (carpeta en `.gitignore`) |
| 11 | Redirects | ✅ `trailingSlash` 308 sin cadenas ni loops; `/index` → 308 → `/index/` → 308 → `/` (correcto, sin loop; la mejora P3 de reducir a un salto sigue pendiente y no forma parte de esta migración) |
| 12 | Datos de DB | ✅ Sin escrituras; `npm run db:verify` → todas las comprobaciones a nivel DB pasan |
| 13 | ISR | ✅ `revalidate = 3600` activo (`/`, `/states/`, `/sitemap.xml` prerenderizadas; rutas de datos SSG); sin cambios |
| 14 | Favicon / iconos | ✅ `public/favicon.ico` presente (corregido en auditoría anterior, no rehecho); `icon.svg` solo cambió el `aria-label` de la marca |
| 15 | Dominio provisional en código publicado | ✅ 0 apariciones |

**Simulación INDEXABLE=true:** realizada en copia aislada (`.tmp-audit/sim-2026-09-28/`, convención de auditorías anteriores; `.env.local` del checkout real sigue en `"false"`). Servidor de prueba detenido y junction de `node_modules` eliminada al terminar.

## 8. Vercel / deployment

Sin `vercel.json` ni `.vercel` en el repo (despliegue por defecto). Configuración requerida en el dashboard (no verificable desde el repositorio):

| Variable | Production | Preview |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://permitfees.site` | URL de preview o `https://permitfees.site` si se prefiere canónicas reales (no recomendado antes de estar listo) |
| `NEXT_PUBLIC_SITE_INDEXABLE` | `"true"` (solo cuando el deployment esté listo) | `"false"` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `contacto.webproyectos@gmail.com` | igual |
| `DATABASE_URL` | sin cambios (Neon, ya configurado) | sin cambios |

Importante: `NEXT_PUBLIC_*` se inlinea en tiempo de **build**. El flip de `INDEXABLE` y el dominio deben fijarse en Production y **reconstruir/redeployar**; no basta reiniciar.

Dominios en Vercel: añadir `permitfees.site` (y `www.permitfees.site` como dominio adicional con redirect al ápice). Un único dominio canónico; dos versiones indexables no deben existir.

## 9. Remaining manual steps (fuera del repositorio)

1. Añadir `permitfees.site` (y `www.` como redirect) como dominio en Vercel y configurar el DNS del registrador.
2. Fijar en Vercel Production: `NEXT_PUBLIC_SITE_URL=https://permitfees.site` y `NEXT_PUBLIC_SITE_INDEXABLE=true` (desplegar para que el build lo inlinee). El checkout local ya lleva ambos valores correctos y se mantiene `false` de forma segura para edición.
3. Activar HSTS `preload` con conocimiento de causa (ya activo con `includeSubDomains`; `preload` es irreversible por dominio — confirmar al conectar).
4. Verificar el dominio en Google Search Console y enviar `https://permitfees.site/sitemap.xml`.
5. Configurar AdSense/`ads.txt` y el CMP/cookie banner cuando se añada publicidad (la cookie policy ya anticipa el cambio). No forma parte de esta migración.
6. Pendientes heredados de auditorías anteriores (no de esta migración): reforzar prosa de las 50 páginas de estado, corregir 45 fuentes inaccesibles y 60 descriptions con `**`, `og:image`/logo, reducción del redirect `/index/` a un salto.

## 10. Conclusión

La migración se aplicó en el mínimo número de puntos: **una variable de entorno, la configuración de marca centralizada, dos textos con la marca inline, el icono, la documentación viva y dos literales de test**. Toda la cadena dominio → configuración → metadata → canonical → sitemap → robots → JSON-LD → OG → enlaces → branding → legal se verificó construida y sirviendo `https://permitfees.site` con 454/454 páginas correctas, sin datos inventados y sin regresiones (2112 tests verdes, build y typecheck limpios, DB intacta).

## 11. Footer / Legal / Author (revisión posterior, misma fecha)

**Estructura final del footer** (único footer global, definido en `src/lib/nav.ts` y renderizado por `site-footer.tsx` en todas las páginas):

- **PermitFees** — All states · Methodology · About · Contact
- **Legal** — Privacy Policy · Cookie Policy · Terms
- **More** — About the author

Copyright: `© {año} PermitFees. All rights reserved.` — **sin nombre del autor**. Los tres disclaimers (independencia, estimación, no asesoría) siguen leyéndose de `site.ts`.

**Páginas enlazadas:** `/states/`, `/methodology/`, `/about/`, `/contact/`, `/privacy/`, `/cookies/`, `/terms/` (existentes, 7×200 verificadas) y la **nueva** `/author/` (200). Sin duplicados: no había página de autor previa ni rutas equivalentes; el slug `author` se añadió a `RESERVED_ROOT_SLUGS` (protegido frente a captura por `[state]`) y a `ROUTES`/sitemap.

**Página de autor (`/author/`):** "Who is behind PermitFees" — qué es el trabajo (fuentes oficiales, verificación fechada, metodología), estándar editorial, correcciones e independencia. Sin fotografía, domicilio, teléfono, empresa, credenciales ni datos no proporcionados.

**Nombre del autor (Miguel Iglesias Valenzuela) — ubicación exacta:** únicamente `src/app/author/page.tsx` (verificado por grep global en `src/`, `tests/`, `scripts/`, `public/` y docs: 1 sola aparición publicada; el resto del sitio, incluidos footer, header, homepage, copyright, state/city/permit pages, methodology, contact, privacy, cookies, terms, sitemap y metadata global: **0 apariciones**).

**LinkedIn (`linkedin.com/in/miguel-iglesias-valenzuela-14069b367/`) — ubicación exacta:** únicamente `src/app/author/page.tsx`, enlace real con `target="_blank" rel="nofollow noopener"`. En el footer solo existe el enlace genérico "About the author" (sin nombre ni LinkedIn).

**Email confirmado:** `contacto.webproyectos@gmail.com` — intacto en `.env.local` (`NEXT_PUBLIC_CONTACT_EMAIL`) y mostrado en `/contact/` (1 aparición en el HTML servido). No se modificó.

**Responsive:** verificado en navegador real a 320 px, 390 px, 768 px y 1280 px: 0 overflow horizontal en todos; 1 columna (320/390) → 2×2 (768) → 4 columnas en fila (1280); enlaces de footer con área de toque elevada a 30 px (padding + margen compensado, sin parches de `overflow-x:hidden`); disclaimers legibles; sin emojis.

**Enlaces verificados:** los 8 del footer responden 200; 0×404 en navegación; footer único (1 `<footer>` por página, sin anidar ni duplicar); enlaces legales sin keyword stuffing.

**SEO/otras comprobaciones:** sitemap con `INDEXABLE=true` simulado → **455 URLs** (454 + `/author/`), 0 duplicadas, robots correcto con `permitfees.site`; build local restaurado a estado seguro (`INDEXABLE=false`, sitemap vacío); `permitfees.example`: 0; localhost en src: solo el fallback defensivo de `site.ts`; About enlaza a la página de autor con texto genérico; **DB, ISR, fee rules, sources, gates y slugs de contenido: sin cambios** (typecheck 0 errores, 2112/2112 tests, build OK).

**Acciones manuales:** ninguna nueva. Cuando el sitio se publique en producción (`NEXT_PUBLIC_SITE_INDEXABLE=true` en Vercel), la nueva `/author/` entrará automáticamente en el sitemap de 455 URLs.

*Generado el 2026-09-28. Artefacto de verificación: `.tmp-audit/sim-2026-09-28/crawl-migration-2026-09-28.json`.*
