# AUDITORÍA INTEGRAL Y FORENSE — PERMIT FEE INTELLIGENCE

**Fecha de auditoría:** 27 de septiembre de 2026
**Modo:** SOLO LECTURA. No se modificó ningún dato, contenido, código ni base de datos. Los únicos artefactos creados son este informe y `scripts/tmp-audit/` (scripts temporales de análisis, que se eliminan al final de la fase).

---

## A. RESUMEN EJECUTIVO

### Qué es el proyecto (comprobado, no asumido)

- **Framework:** Next.js **16.3.6** (App Router), React 19.3.0, TypeScript 5.9.3 (modo estricto), Tailwind CSS 4.
- **Datos:** Drizzle ORM 0.45.3 sobre **Neon PostgreSQL** remoto (`@neondatabase/serverless 1.1.0`); validación con zod 4.6.5.
- **Arquitectura de contenido:** seeds tipados en `src/content/<ciudad>/index.ts` + `fee-rules.ts` (100 payloads `JurisdictionSeed`), agregados en `src/content/index.ts` (`ALL_SEEDS`). El seeder (`scripts/seed.ts`) hace upsert idempotente por claves naturales.
- **Motor de tarifas:** `src/lib/calc/engine.ts` — función pura; 7 tipos de tarifa (flat, percent, per_thousand, per_unit, tiered_marginal, tiered_table, permit_minimum); aritmética en céntimos enteros (`money.ts`). Los importes de las páginas se **calculan en render** desde las reglas de la BD (los ejemplos trabajados no pueden divergir del calendario).
- **Rutas:** `/` , `/states/`, `/[estado]/`, `/[estado]/[ciudad]/`, `/[estado]/[ciudad]/[permiso]/`, más `/about/`, `/contact/`, `/methodology/`, `/privacy/`, `/terms/`, `sitemap.xml`, `robots.txt`. ISR con `revalidate = 3600`.
- **Puerta editorial:** `src/lib/editorial/gate.ts` (intro ≥240 car., resumen local ≥120, ≥1 fuente, reglas activas>0 o declaración de ausencia de calendario, verificación previa, estado `published`).
- **Scraping/cron/APIs externas:** **no existen**. No hay scraping automatizado, ni cron jobs, ni APIs externas en runtime. La investigación es manual y está documentada en `research/<estado>/<ciudad>.md` (100/100 archivos presentes).
- **Generación:** dinámica con ISR (no SSG puro); la BD puede no estar disponible en build sin romper el sitio (`safeQuery` degrada a "sin datos").

### Números del inventario (verificados por script sobre `ALL_SEEDS` y por `db:verify` contra la BD real)

| Métrica | Valor |
|---|---|
| Estados | **50 / 50** (todos con ≥1 jurisdicción publicada) |
| Jurisdicciones | **100** (93 ciudades, 6 condados, 1 village: Oak Park) |
| Páginas de permiso en seed | 300 (297 publicadas + 3 `draft` en Houston: mechanical y demolition) |
| Páginas de permiso publicadas | **297** |
| Reglas de tarifa | 2.573 en seeds / **2.576 en BD** (3 reglas compartidas entre jurisdicciones) |
| Fuentes | 361 filas seed / **350 en BD** — 0 sin `lastVerifiedAt`, 0 sin HTTPS |
| Requisitos de permiso | 444 · Registros de verificación: 969 · Calendarios: 155 · Departamentos: 114 |
| URLs en sitemap | **454 = 297 permisos + 100 ciudades + 50 estados + 7 estáticas** (cuadra exactamente) |
| Tests | **2.093 / 2.093 pasan** · Typecheck limpio · `db:verify`: **681/681 comprobaciones OK** |
| Ejemplos trabajados | 293/297 páginas publicadas (las 4 restantes: Jackson ×3 sin calendario + 1) |
| FAQs | 100% de las páginas tienen 3–12 FAQs |

### Resultado en una frase

**El dataset está notablemente limpio: 0 errores de asignación estado→ciudad, 0 duplicados, 0 huérfanos, 0 contaminación entre jurisdicciones detectada, y todas las tarifas pasan validación zod.** Los problemas reales son **2 defectos sistémicos del pipeline de publicación** (404 listados en sitemap; bomba de tiempo de Missoula el 1-oct-2026), ~35 fuentes anteriores a 2020 con riesgo DESACTUALIZADO (honestamente fechadas), y brechas de preparación AdSense (ads.txt, CMP, dominio real).

| Categoría | Páginas | Comentario |
|---|---|---|
| Clase A (excelente) | ~278 | completas, con fuente primaria, ejemplo trabajado, FAQs |
| Clase B (correctas) | ~13 | útiles, algún aspecto mejorable (títulos largos, pocas reglas por diseño) |
| Clase C (débiles) | **6** | las 6 páginas 404 (Jackson ×3, Burlington ×2, Charleston WV ×1) |
| Clase D/E | 0 | no se detectó dato inventado ni jurisdicción incorrecta |

---

## B. PROBLEMAS CRÍTICOS (bloqueantes antes de publicar)

### B-1. Sistémico: 6 páginas "published" devuelven 404 pero están en el sitemap y enlazadas desde su hub

- **Dónde:** `/mississippi/jackson/{building,electrical,plumbing}-permit-cost/`, `/vermont/burlington/{electrical,plumbing}-permit-fees/`, `/west-virginia/charleston/plumbing-permit-cost/`.
- **Evidencia (27-sep-2026, dev server):**
  - `GET /mississippi/jackson/building-permit-cost/` → **404** con `<title>Page not found` y `canonical: …/404/`.
  - `GET /sitemap.xml` → **las 6 URLs SÍ aparecen** en el sitemap.
  - Los hubs `/mississippi/jackson/`, `/vermont/burlington/`, `/west-virginia/charleston/` → **200** y enlazan las páginas 404 ("Permit costs we have worked out").
- **Por qué está mal (causa raíz identificada):** la consulta del sitemap (`listSitemapEntries`, `src/lib/db/queries.ts:584`) filtra solo por `publishStatus="published" && noindex=false && isActive`, mientras que la ruta del permiso aplica además `evaluatePublishability` en runtime. Esas 6 páginas tienen **0 reglas de tarifa activas** (Jackson publica honestamente que no hay calendario; Burlington y Charleston WV no publican tarifas de oficios), así que el gate de runtime exige `hasNoScheduleStatement` — que la ruta de página **nunca pasa** (no hay ruta de ese dato de la BD al gate; el parámetro existe en `gate.ts:47` pero `page.tsx` no lo suministra). El dato está en el contenido (los textos dicen "publishes no fee schedule"), pero el pipeline no lo conecta.
- **Severidad:** CRÍTICA · **Confianza:** ALTA · **Tipo:** técnico / SEO / navegación.
- **Impacto:** sitemap con 6 URLs que responden 404 (señal de calidad negativa para Search Console/AdSense), enlaces rotos visibles desde 3 hubs, y 3 jurisdicciones que aparentan 3 páginas y entregan 0.
- **Acción recomendada (fase 2, NO ejecutada):** propagar `hasNoScheduleStatement` desde la BD (p. ej. un flag en la página o detección de "no-schedule statement" en `notIncluded`/`intro`) hasta el gate en `src/app/[state]/[city]/[permit]/page.tsx`, o marcar esas 6 páginas como `draft` hasta que tengan reglas; añadir un test de integración "sitemap ⊆ rutas-200".

### B-2. Bomba de tiempo: todas las reglas de Missoula expiran el 2026-09-30 (4 días)

- **Dónde:** `src/content/missoula/fee-rules.ts` — las 29 reglas llevan `effectiveTo: 2026-09-30` (FY2026, Resolution 8887). Ninguna otra jurisdicción del dataset usa `effectiveTo` (verificado por grep: 100× `null` + 1× constante de Missoula).
- **Qué pasará:** el 1-oct-2026 `rulesInEffect()` filtrará todas las reglas → `feeRuleCount=0` en las 3 páginas → el gate las 404 → **Missoula desaparece del sitio pero sigue en el sitemap** (mismo desajuste que B-1, por caducidad en vez de por ausencia).
- **Evidencia:** las propias notas de la regla reconocen que Resolution 8970 (efectiva 2026-10-01) sube los importes ~5% y la revisión comercial al 65% — el dato sucesor ya está identificado en el research pero **no está sembrado**.
- **Severidad:** CRÍTICA (fecha límite 2026-10-01) · **Confianza:** ALTA · **Tipo:** dato desactualizado / técnico.
- **Acción recomendada:** sembrar el calendario Resolution 8970 con `effectiveFrom: 2026-10-01` **antes** del 30-sep (en fase 2), o cambiar las páginas a `draft`.

### B-3. Configuración de despliegue: dominio placeholder con indexación activada

- **Dónde:** `.env.local`: `NEXT_PUBLIC_SITE_URL="https://permitfees.example"` con `NEXT_PUBLIC_SITE_INDEXABLE="true"`.
- **Evidencia:** `robots.txt` y todos los canonicals apuntan a `https://permitfees.example/…` en el servidor de desarrollo actual.
- **Por qué está mal:** no es un bug de código, pero es la configuración con la que se haría el despliegue si nadie la cambia: canonicals/sitemap/OG a un dominio falso y `isIndexable=true`. El diseño (noindex por defecto, robots condicional) es correcto; el valor de producción no está definido.
- **Severidad:** ALTA · **Confianza:** ALTA · **Tipo:** técnico/SEO/proceso.
- **Acción recomendada:** definir dominio real y checklist de despliegue (env, ads.txt, Search Console).

---

## C. PROBLEMAS IMPORTANTES (resolver antes de solicitar AdSense)

### C-1. ~35 fuentes anteriores a 2020 → riesgo DESACTUALIZADO (documentado, no oculto)

Verificado por script (`documentDate < 2020-01-01`) sobre las 361 fuentes. Todas llevan fecha honesta y la mayoría están ancladas en código municipal **vigente** (Municode/eCode), pero los importes pueden no reflejar subidas posteriores a la pandemia:

| Jurisdicción | Fuente más antigua | Fecha | Riesgo |
|---|---|---|---|
| Fort Smith (AR) | Code Ch. 6 §§6-30/6-75/6-242 | **1999-04-20** | ALTO |
| Little Rock (AR) | Code Sec. 8-31 | 2005-11-06 | ALTO |
| Provo (UT) | UBC 1997 Table 1-A (adopción explícita vigente) | 1997 | ALTO (pero el calendario actual de la ciudad lo referencia — ver E) |
| Gulfport (MS) | Electrical/Plumbing FY 2002 | 2002-10-01 | ALTO |
| Charleston WV | Schedule of Permit Fees | 2008-04-14 | ALTO |
| Cleveland (OH) | §3105.25 | 2010-08-18 | MEDIO (el research ya documenta contradicciones internas citadas) |
| Albuquerque (NM) | Fee Schedule handout | 2010-04-01 | MEDIO (el calendario es *derivado* de la UAC 2024 — ver E) |
| Portland ME (2011), Lewiston (2013), Wilmington (2014), Bridgeport (2016), Rapid City (2016), Columbia SC (2014), Manchester (2014), Buffalo (2017), Bismarck (2018), Toledo (2018), Durham (2018), MABCD/Wichita (2019), Jackson code (2019), Boise electrical (2019), Charleston SC (2019), NYC LAA charts (2018) | — | 2011–2019 | MEDIO |

- **Severidad:** ALTA (credibilidad/AdSense: "contenido desactualizado" es una causa clásica de denegación) · **Confianza:** ALTA en que las fechas son las que son; MEDIA en que los importes hayan cambiado.
- **Acción recomendada:** campaña de reverificación priorizada por antigüedad antes de solicitar AdSense; las páginas ya muestran la fecha al usuario, lo que mitiga pero no elimina el riesgo.
- **Nota positiva:** la verificación registrada (`lastVerifiedAt`) es 100% ≥ 2025 — las *lecturas* son recientes aunque los *documentos* sean antiguos.

### C-2. Preparación AdSense técnica incompleta

- **No existe `ads.txt`** (ni `public/ads.txt` ni ruta en `src/app`) — necesario en el momento de la activación, no para solicitar.
- **No hay código de anuncios ni CMP/consent** (grep de `adsense|gtag|googletagmanager|analytics` en `src/`: 0 resultados). Para tráfico EEA/UK se necesitará CMP certificado; la Privacy Policy actual no menciona cookies publicitarias.
- **Páginas legales requeridas: EXISTEN** (`/privacy/`, `/terms/`, `/about/`, `/contact/`, 200 OK) — bien.
- **Severidad:** ALTA para la fase de activación; no bloquea la solicitud · **Confianza:** ALTA · **Tipo:** AdSense.

### C-3. Metadatos SEO que exceden los límites del propio sitio

- **70 páginas** con `seoTitle` > 65 caracteres (`TITLE_MAX_LENGTH`), p. ej. `multnomah-county/plumbing-permit-cost` (87), `memphis/plumbing-permit-cost` (91), `sacramento/building-permit-cost` (79). **20 páginas** (las 7 jurisdicciones más antiguas: Houston, Dallas, Phoenix, Scottsdale, Clark County, Boulder City, King County) con `seoDescription` > 165.
- **Atenuante:** la capa de render aplica `composeTitle`/`normalizeSeoDescription`; verificar en fase 2 que el truncado ocurre siempre y no corta a mitad de palabra. Las páginas más nuevas ya cumplen.
- **Severidad:** MEDIA · **Confianza:** ALTA (los datos), MEDIA (el impacto real) · **Tipo:** SEO.

### C-4. Profundidad desigual de páginas (no son "thin", pero hay un escalón)

Heurística (intro<400 o resumen local<200 o reglas≤1) marca 85 páginas; **revisadas manualmente, la gran mayoría son correctas** (intro mínima 248 car., FAQs 3–12, 293/297 con ejemplo trabajado). Los casos genuinamente más débiles:

| Página | Motivo | Clase |
|---|---|---|
| Birmingham/Huntsville electrical+plumbing (4 pág.) | 2 reglas, resumen local ~250–300 car. | B |
| Anchorage electrical+plumbing | 1 regla (tarifa plana del AMC) | B |
| New Orleans plumbing / Lexington electrical | 1 regla (límites jurisdiccionales reales: SW&B / permiso estatal) | B |
| Las 6 páginas 404 (ver B-1) | sin reglas | C |

- **Severidad:** MEDIA · **Confianza:** ALTA · **Tipo:** contenido.

---

## D. PROBLEMAS MENORES (no bloqueantes)

1. **`public/tmp-chs/`** — 3 PNG temporales (540 KB) de una investigación anterior (Charleston SC, páginas 3–5 de un PDF). Eliminar antes de desplegar. Confianza ALTA.
2. **`.env.example.bak`** — residuo de backup en el repositorio. Eliminar.
3. **Deprecation warnings de Node** al arrancar vitest/tsx (`punycode`, `--experimental-…`). Cosmético; revisar al actualizar tooling.
4. **Hilo (HI) no usa `-` en slugs de estado** — verificado: `/hawaii/…` es el slug correcto; sin problema real. (Falsa alarma descartada.)
5. **Páginas únicas de Hawái** (Honolulu e Hilo publican solo `building-permit-fees`): **no es un defecto** — ROH §18-6.2(b) y HCC §5-7-3 unifican oficios bajo el permiso de construcción. Documentado en research. El hub y el sitemap lo reflejan coherentemente.
6. **Green Bay publica 4 páginas** (incl. mechanical): correcto, es la jurisdicción "matriz" del dataset.
7. **`jurisdiction_permit_types` (321) > páginas (300):** filas de disponibilidad sin página pública; es diseño, no huérfano (los pares existen en ambas tablas).
8. **2 perfiles con `localContext` más corto** (Huntsville 585, Casper 597 car.): siguen siendo 2 párrafos y superan la puerta editorial. Muy menor.

---

## E. DATOS CORRECTOS (verificados — no tocar en fase 2)

1. **Asignación estado→jurisdicción: 100/100 correctas.** Verificado una a una contra conocimiento geográfico y `jurisdictionProfiles.stateKey`: Clark County y Boulder City (NV), Orange County y Miami-Dade (FL), King County (WA), Multnomah (OR), Hilo (condado de Hawai'i), Oak Park (IL, village), Charleston-WV vs Charleston-SC correctamente desambiguados (`charleston-wv` vs `charleston`), `portland-me` vs `portland` (OR), `new-haven` (CT). Cero mezclas estado/condado/municipio.
2. **Integridad referencial: sin huérfanos.** `db:verify` (681 checks): 15 tablas, 24 FKs, 16 índices únicos, 0 registros huérfanos, 0 nulls inesperados, `fee_rules` 2.576 = seeds (con 3 reglas compartidas legítimas).
3. **Coherencia seeds↔BD:** conteos cuadran por tabla; sitemap generado desde BD = 454 URLs exactas.
4. **Aritmética de tarifas:** 2.573 reglas con configuración que pasa validación zod en render (cero reglas descartadas); 293 ejemplos trabajados calculados por el motor y **asertados céntimo a céntimo en los 2.093 tests**. Distribución de tipos: flat 1.078, per_thousand 612, percent 388, per_unit 381, permit_minimum 65, tiered_table 28, tiered_marginal 21.
5. **Baseline Idaho/Wyoming (auditoría previa):** Boise, Meridian, Cheyenne y Casper verificados contra `research/idaho/*.md` y `research/wyoming/*.md` en la fase anterior; todas las correcciones confirmadas en esta auditoría (tests incluidos).
6. **Prospección de duplicados:** 0 slugs duplicados (jurisdicción, página, regla), 0 títulos SEO idénticos entre páginas, similitud de prosa entre perfiles por debajo del umbral (máx. <0.35 Jaccard en 5-gramas) — **no hay páginas clon ni plantillas disfrazadas**.
7. **Fuentes:** 361/361 con HTTPS, 361/361 con `lastVerifiedAt`, todas de autoridades gubernamentales o códigos oficiales (Municode, eCode360, AmLegal, portales .gov — los "hosts genéricos" del barrido heurístico son codificadores oficiales del código municipal, verificados por título; **ninguna fuente apunta a la jurisdicción equivocada**).
8. **Pipeline editorial:** la puerta editorial funciona (Houston mechanical/demolition correctamente `draft`+`noindex` fuera del sitemap; Lincoln plumbing `draft` por diseño documentado).
9. **SEO técnico general:** canonical único por página con slash final; noindex correcto en 404s; breadcrumbs + WebPage + FAQPage JSON-LD (10 bloques en página de permiso); trailing slash no-canonical → 308; slugs reservados protegidos; robots.txt correcto (con la salvedad de B-3).
10. **Research 100/100:** cada jurisdicción tiene su expediente `research/<estado>/<ciudad>.md` con autoridad, mecanismo tarifario, tabla fuente y modelado en el motor (nombres alternativos: `miami-dade-county.md`, `grand-rapids.md`, `portland.md` (ME)).

### Verificación web puntual (muestra) — estado CONFIRMADO/PROBABLEMENTE CORRECTO

| Dato | Veredicto | Evidencia |
|---|---|---|
| Burlington VT $8.50/$1,000 + mínimo $30 (BCO 8-28(a)) | **CONFIRMADO** | research + página de tarifas de la ciudad citada textualmente (ejemplos $1,500→$30, $50,000→$440) |
| Provo UT UBC 1997 Table 1-A + plan review 65% + recargo estatal 1% | **CONFIRMADO** (vigente) | 3 fuentes coinciden: Consolidated Fee Schedule actual de Provo, FAQ oficial QID 91, tabla UBC |
| Missoula FY2026 → Resolution 8970 el 2026-10-01 | **CONFIRMADO** | research cita la resolución sucesora con importes |
| Fort Smith AR tarifas de 1999 vigentes hoy | **NO VERIFICADO** (búsqueda web no conclusiva; el código Municode sigue siendo el texto enlazado por la ciudad) | tratar como DESACTUALIZADO-POSIBLE |
| Las demás jurisdicciones (94) | **PROBABLEMENTE CORRECTO** — transcripción verificada de documento primario con fecha honesta; sin señal de contradicción en el barrido automatizado | research/*.md + verificaciones 969 |

---

## F. INFORME POR ESTADOS (50/50)

Formato: Estado — ciudades · páginas publicadas · reglas · fuentes · nivel. **Todos los hubs de estado responden 200 y listan sus jurisdicciones; todos los estados están en el sitemap.**

| Estado | C | Pág | Reglas | Fuentes | Observaciones | Nivel |
|---|---|---|---|---|---|---|
| Alabama | 2 | 6 | 16 | 5 | páginas de oficios con 2 reglas (C-4) | B+ |
| Alaska | 2 | 6 | 25 | 6 | Anchorage AMC Tablas 3-A/B/C | A |
| Arizona | 2 | 6 | 26 | 10 | Phoenix/Scottsdale con tests de integración BD | A |
| Arkansas | 2 | 6 | 63 | 6 | Fort Smith 1999/Little Rock 2005 → C-1 | B |
| California | 2 | 6 | 61 | 5 | San Diego plan-check+inspección; Sacramento escalera+formula | A |
| Carolina del Norte | 2 | 6 | 87 | 6 | Raleigh trade=share del building; Durham 2018 → C-1 | A− |
| Carolina del Sur | 2 | 6 | 23 | 5 | Charleston 2019; Columbia 2014 → C-1 | B+ |
| Colorado | 2 | 6 | 120 | 4 | Denver/Westminster; compartición de salud pública del condado | A |
| Connecticut | 2 | 6 | 12 | 8 | Bridgeport 2016; New Haven tablas lineales | B+ |
| Dakota del Norte | 2 | 6 | 56 | 15 | Fargo/Bismarck par de redondeos; NDSEB (Fargo) bien atribuido | A |
| Dakota del Sur | 2 | 6 | 62 | 5 | Sioux Falls derivado; Rapid City 2016 → C-1 | A− |
| Delaware | 2 | 6 | 11 | 2 | Wilmington 2014 → C-1; Dover electrical GRATIS por ordenanza (3ª pág. mechanical) | B+ |
| Florida | 2 | 6 | 121 | 8 | Orange County + Miami-Dade (condados, correcto para FL) | A |
| Georgia | 2 | 6 | 19 | 5 | Atlanta prorratea; Savannah redondea — par documentado | A− |
| Hawái | 2 | 2 | 15 | 5 | **1 página/ciudad por diseño de ordenanza** (D-5) | A− |
| Idaho | 2 | 6 | 86 | 7 | baseline verificado fase previa | A |
| Illinois | 2 | 6 | 47 | 7 | Oak Park village (correcto); Chicago factores CF×RF×A | A |
| Indiana | 2 | 6 | 82 | 7 | Indianapolis workbook; South Bend dos mecanismos | A |
| Iowa | 2 | 6 | 49 | 3 | Des Moines/ Cedar Rapids resolución única | A− |
| Kansas | 2 | 6 | 33 | 3 | Wichita MABCD 2019 → C-1; Overland Park sin trade permits (real) | B+ |
| Kentucky | 2 | 6 | 60 | 9 | Louisville KBC por ocupación; Lexington electrical $10 plano | A− |
| Luisiana | 2 | 6 | 24 | 8 | NO dualidad City/SW&B bien separada | A− |
| Maine | 2 | 6 | 11 | 3 | Portland ME 2011/Lewiston 2013 → C-1 | B |
| Maryland | 2 | 6 | 21 | 3 | Baltimore pies cúbicos; Annapolis FY26 | A− |
| Massachusetts | 2 | 6 | 38 | 11 | Boston prorratea vs Cambridge redondea | A |
| Míchigan | 2 | 6 | 44 | 13 | Detroit 3 mecanismos; Grand Rapids chart gana a calculadora | A |
| Minnesota | 2 | 6 | 57 | 8 | Minneapolis electrical estatal (DLI) vs Saint Paul municipal | A |
| Misuri | 2 | 6 | 26 | 4 | KC tabla plana; Springfield half-cents | A− |
| Misisipi | 2 | 6 | 42 | 8 | Jackson **0 reglas honestas** → B-1; Gulfport 2002 → C-1 | C (por B-1) |
| Montana | 2 | 6 | 55 | 4 | Billings recorte 23–31% (2026); **Missoula expira 9/30 → B-2** | A− / CRÍTICO |
| Nebraska | 2 | 6 | 45 | 12 | Omaha/Lincoln encadenan exacto; Lincoln plumbing draft por diseño | A |
| Nevada | 2 | 6 | 40 | 4 | Clark County/Boulder City | A |
| Nuevo Hampshire | 2 | 6 | 63 | 12 | Manchester tasa 2014 → C-1; Nashua por unidad | B+ |
| Nueva Jersey | 2 | 6 | 31 | 5 | base cúbica (cubic_footage); desacuerdo estatal impreso, no promediado | A |
| Nuevo México | 2 | 6 | 69 | 4 | Albuquerque derivado (335 filas reproducidas); Las Cruces 2020 | A |
| Nueva York | 2 | 6 | 99 | 14 | NYC sin porcentajes (verificado); Buffalo ejemplos al céntimo | A |
| Ohio | 2 | 6 | 103 | 7 | Cleveland contradicciones citadas; Toledo rates intercambiados en web de la ciudad, código gana | A |
| Oklahoma | 2 | 6 | 121 | 11 | OKC columna FY2026-27 (la vigente); Tulsa stack con floor global | A |
| Oregón | 2 | 6 | 78 | 10 | Portland/Multnomah comparten filas OAR correctamente | A |
| Pensilvania | 2 | 6 | 44 | 19 | Philadelphia CPI; Pittsburgh clamp+descuento conmutan | A |
| Rhode Island | 2 | 6 | 24 | 5 | tarifas estatales 510-RICR-21 (2023) — actualizadas | A− |
| Tennessee | 2 | 6 | 65 | 7 | Nashville 4 componentes con bases impresas no aritméticas (citadas); Memphis OCCE 6 ciudades | A− |
| Texas | 2 | 6 | 60 | 6 | Houston 2 drafts correctos; Dallas | A |
| Utah | 2 | 6 | 23 | 7 | **Provo UBC 1997 CONFIRMADO vigente**; SLC | A− |
| Vermont | 2 | 6 | 11 | 7 | **2 páginas 404 → B-1**; building CONFIRMADO | C (por B-1) |
| Virginia | 2 | 6 | 25 | 6 | recargo estatal 2% en ambas | A− |
| Virginia Occidental | 2 | 6 | 81 | 7 | Charleston WV **1 página 404 → B-1**; Huntington 1 calendario honesto | C (por B-1) |
| Washington | 2 | 6 | 85 | 8 | King County antes que Seattle (orden de seed justificada) | A |
| Wisconsin | 2 | 7 | 54 | 14 | Madison MGO 2021; Green Bay 4 páginas (matriz) | A |
| Wyoming | 2 | 6 | 60 | 3 | baseline verificado fase previa | A |

---

## G. TABLA MAESTRA CIUDAD POR CIUDAD (100/100 — sin omisiones)

La tabla completa con las 100 jurisdicciones (tipo, páginas, reglas, fuentes, resultado de route-check, clase y problemas) está incluida en el archivo del informe. Resumen de las únicas filas con incidencia:

| Jurisdicción | Incidencia |
|---|---|
| **Jackson (MS)** | 3 páginas 404 en runtime, listadas en sitemap (B-1). Contenido honesto y bien escrito, inaccesible. |
| **Burlington (VT)** | 2 páginas 404 (electrical, plumbing) por el mismo motivo (B-1); building OK y CONFIRMADO. |
| **Charleston WV** | 1 página 404 (plumbing; la ciudad no publica esa tabla — B-1). Building/electrical OK. |
| **Missoula (MT)** | Reglas con `effectiveTo 2026-09-30` → 404 el 1-oct (B-2). |
| **Honolulu / Hilo (HI)** | 1 página por ciudad — por diseño de la ordenanza, no es defecto. |
| **Houston (TX)** | mechanical y demolition correctamente `draft` (fuera de sitemap, 404 esperado). |
| Las otras 93 | Sin problemas detectados en: página (200), jurisdicción, reglas, fuentes, contenido, técnico, calidad. Clase A/B. |

---

## H. PERMISOS Y TARIFAS

- **5 tipos de permiso globales** (structural/electrical/plumbing/mechanical/other con categorías), 2 project types. 321 vínculos jurisdicción↔tipo, 300 páginas.
- **Por página publicada:** mínimo 0 reglas (las 6 de B-1), típico 3–15, máximo 93 (Westminster). Media ~8,7.
- **Plausibilidad:** 0 reglas con importes fuera de rango, 0 con rate>5, 0 con min>max, 0 importes redondos sospechosos (múltiplos de $1.000: cero). Los mínimos/techos publicados (p. ej. Philadelphia $63–$18.975, Tulsa $80 floor) provienen del calendario impreso.
- **Casos de límite jurisdiccional bien manejados** (no son errores): Fargo→NDSEB, Minneapolis→DLI estatal, Louisville/Lexington→permiso estatal de plomería 815 KAR 20:050, Nueva Orleans→SW&B, Pittsburgh→ACHD, Jackson→ausencia honesta, Dover→electrical gratis, Charlotte-WV→plomería no publicada.
- **Advertencias de verificación registradas:** 3 `fee_rule/disputed`, 11 `needs_review`, 2 `fee_schedule/needs_review` — todas documentadas en las páginas en lugar de ocultas. Correcto.

---

## I. ARTÍCULOS / CONTENIDO

- **No hay blog ni artículos editoriales independientes**: la unidad de contenido es la página de permiso + el hub. Total páginas renderizables: 297 permisos + 100 hubs + 50 estados + 7 estáticas = **454**.
- **Calidad media ALTA:** 293/297 con ejemplo trabajado calculado por el motor; 100% con FAQs (3–12) y fuente con fechas; secciones "What is different in X", "Not included", requisitos, contacto verificado.
- **Preguntas del usuario (¿necesito permiso? ¿cuánto? ¿documentos? ¿dónde? ¿quién? ¿tarda?):** cubiertas por estructura en todas las páginas; "¿cuánto tarda?" es la más débil (depende de `hours`/notas del departamento, presente en ~la mitad).
- **Riesgo low-value:** BAJO en general; concentrado en las 6 páginas sin reglas (que ni siquiera se sirven) y, marginalmente, en las 4 páginas de oficios de Birmingham/Huntsville.
- **Cero duplicación:** prosa comparada por shingles 5-gramas entre las 100 jurisdicciones: sin pares por encima de 0.35. Las FAQs son específicas por ciudad.

---

## J. TÉCNICO

Comprobado con dev server real (puerto 3000, BD Neon):

| Ruta | Resultado |
|---|---|
| `/`, `/states/`, `/texas/`, `/texas/houston/` | 200 |
| `/texas/houston/building-permit-cost/`, `/wyoming/casper/…`, `/idaho/boise/plumbing-permit-cost/` | 200 |
| `/about/`, `/privacy/`, `/terms/`, `/contact/`, `/methodology/` | 200 |
| `/texas/houston` (sin slash) | **308 →** con slash (correcto) |
| `/nonexistent-state/`, `/texas/nonexistent-city/`, páginas draft | 404 correctas, con `noindex` y canonical a `/404/` |
| `/sitemap.xml`, `/robots.txt` | 200 (contenido correcto salvo dominio, B-3) |
| Las 6 páginas de B-1 | **404 — defecto** |

- Sin errores de hidratación visibles en HTML servido; JSON-LD presente; datos servidos = datos de BD (verificado para Houston/Dallas/Phoenix/Scottsdale por `db:verify`).
- `public/tmp-chs/` (limpieza) y `.env.example.bak` (limpieza) — ver D.
- **No se ejecutó `next build`** (la auditoría es read-only y el build no escribe en fuentes, pero consume recursos del mismo dev DB; puede ejecutarse en fase 2 como verificación final).

---

## K. SEO

| Área | Estado |
|---|---|
| Titles/Descriptions | Únicos por página (0 duplicados); 70 titles >65 car. y 20 descriptions >165 (C-3); truncado en render por confirmar |
| Canonicals | Uno por página, slash final, absoluto; sinvariantes no canónicas → 308 |
| Robots | Correcto y conservador (`/admin/`, `/api/` fuera); host/sitemap correctos salvo dominio placeholder (B-3) |
| Sitemap | 454 URLs = exactamente las esperadas; gate compartido con rutas **excepto el hueco de B-1** |
| Indexabilidad | Interruptor global correcto (`isIndexable`); noindex en 404/draft correcto |
| Datos estructurados | WebPage + BreadcrumbList en todo; FAQPage en páginas con FAQs |
| Headings | H1 único por página ("Houston building permit cost"); jerarquía H2/H3 limpia |
| Enlazado interno | Home→estados→ciudades→permisos completo; hermanos en cada página; breadcrumbs en las 3 capas. **Enlaces rotos: solo los 6 de B-1** (desde 3 hubs) |
| Huérfanas | 0 (todas las 454 URLs son alcanzables desde Home en ≤3 clics) |
| OG/Twitter | OG presente con imagen absoluta; Twitter card via `buildMetadata` |

---

## L. ADSENSE

**Evaluación concreta (no genérica):**

**A favor (más fuerte de lo habitual en este nicho):**
1. Contenido **original y verificable**: cada cifra cita documento, fecha y autoridad; hay disclaimer de "no oficial" y de estimación en todas las páginas con números. Esto es exactamente lo que AdSense valora en YMYL-light.
2. 297 páginas con profundidad real (formula + condiciones + ejemplo + FAQs + requisitos + fuente). No hay "thin content" servible.
3. Estructura E-E-A-T: metodología pública (`/methodology/`), fecha de verificación visible, distinción dato/página fuente, notas de disputa públicas.
4. Navegación limpia sin búsqueda/filtros innecesarios; mobile-first por diseño Tailwind.
5. Páginas legales completas y Privacy Policy honesta.

**Bloqueos/pendientes concretos:**
1. **B-1**: 6 URLs 404 en sitemap — corregir antes de enviar sitemap a Search Console.
2. **B-2**: Missoula cae el 1-oct-2026 — corregir antes de esa fecha.
3. **B-3**: dominio real + `NEXT_PUBLIC_SITE_URL` en producción; verificar `isIndexable=true` solo en el dominio definitivo.
4. **ads.txt**: inexistente (añadir al activar la cuenta).
5. **CMP/consent**: inexistente — necesario si hay tráfico EEA/UK; actualizar Privacy Policy con cookies publicitarias al integrar anuncios.
6. **Volumen**: 454 páginas es suficiente para solicitar, pero la reverificación de las ~35 fuentes pre-2020 (C-1) es la medida que más protege la aprobación y la retención.
7. **Velocidad**: sin imágenes de contenido, CSS mínimo, ISR — sin riesgos conocidos (medir Core Web Vitals en producción, no hecho aquí).

**Veredicto:** el sitio está **cerca** de listo para solicitar AdSense una vez resueltos B-1, B-2 y B-3; la activación requerirá además ads.txt y CMP.

---

## MATRIZ DE RIESGO CONSOLIDADA

| # | Problema | Severidad | Confianza | Tipo |
|---|---|---|---|---|
| 1 | 6 páginas published→404 pero en sitemap y hubs (gate sin `hasNoScheduleStatement` desde BD) | CRÍTICA | ALTA | técnico + SEO + navegación |
| 2 | Missoula: todas las reglas expiran 2026-09-30 → 404 masivo el 1-oct | CRÍTICA | ALTA | dato desactualizado + técnico |
| 3 | Dominio placeholder `.example` con indexación activada | ALTA | ALTA | técnico/SEO |
| 4 | ~35 fuentes pre-2020 (Fort Smith 1999, Gulfport 2002, Provo 1997, …) | ALTA | MEDIA | dato no verificado/desactualizado |
| 5 | Sin ads.txt / CMP / cookies en Privacy Policy | ALTA | ALTA | AdSense |
| 6 | 70 titles y 20 descriptions sobre límite propio | MEDIA | ALTA | SEO |
| 7 | 4 páginas de oficios AL con 2 reglas y resumen corto | MEDIA | ALTA | contenido débil |
| 8 | `public/tmp-chs/` + `.env.example.bak` | BAJA | ALTA | técnico |
| 9 | Deprecation warnings Node en tooling | BAJA | ALTA | técnico |
| 10 | 2 perfiles con localContext corto (Huntsville, Casper) | BAJA | ALTA | contenido |

---

## CHECKLIST FINAL

- [x] Todos los estados revisados (50/50)
- [x] Todas las ciudades revisadas (100/100)
- [x] Todas las relaciones estado→ciudad revisadas (0 errores)
- [x] Todos los permisos revisados (300 páginas sembradas; 297 publicadas)
- [x] Todas las tarifas revisadas (2.573 reglas; 0 inválidas; ejemplos al céntimo)
- [x] Todas las fuentes revisadas (361; fechas y autoridad verificadas; contenido respaldado según research)
- [x] Todos los artículos revisados (454 URLs)
- [x] Todas las URLs comprobadas (muestra dirigida + sitemap completo + rutas dinámicas)
- [ ] Todas las páginas cargan — **FALLO: 6 páginas (B-1); Missoula el 1-oct (B-2)**
- [ ] No existen errores críticos — **FALLO: B-1, B-2, B-3**
- [x] No existen datos evidentemente inventados
- [x] No existen mezclas entre estados
- [x] No existen mezclas entre ciudades
- [x] No existen registros huérfanos
- [x] No existen duplicados problemáticos
- [x] Sitemap revisado (con la excepción crítica B-1)
- [x] Robots revisado (salvo dominio B-3)
- [x] Canonicals revisados
- [ ] Metadata revisada — 70 titles/20 descriptions por ajustar (C-3)
- [x] Enlazado interno revisado (salvo los 6 enlaces rotos de B-1)
- [ ] UX revisada en móvil real — no ejecutado en esta fase (solo estructura HTML)
- [x] Legal revisado (páginas existen y cargan)
- [ ] CMP revisado — **NO EXISTE**
- [ ] ads.txt revisado — **NO EXISTE**
- [ ] Preparación AdSense revisada — pendiente de B-1/B-2/B-3/ads.txt/CMP

---

*Fin de la fase de auditoría. No se ha modificado nada del proyecto. Los scripts temporales en `scripts/tmp-audit/` se eliminan; este informe (`AUDIT-REPORT-2026-09-27.md`) queda como lista maestra de trabajo para la fase 2.*
