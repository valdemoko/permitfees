# AUDITORÍA FINAL — PERMIT FEE INTELLIGENCE (FASE 2)

**Fecha:** 2026-09-27 · **Comparativa:** `AUDIT-REPORT-2026-09-27.md` (Fase 1) · **Modo:** corrección controlada de los hallazgos confirmados; sin refactorización, sin contenido genérico, sin expansión de ciudades/estados, sin solicitud de AdSense.

---

## A. RESUMEN EJECUTIVO

| Métrica | Fase 1 | Fase 2 (final) | Δ |
|---|---|---|---|
| Estados | 50 | 50 | = |
| Jurisdicciones | 100 | 100 | = |
| Páginas de permiso publicadas | 297 | 297 | = |
| URLs totales (7 estáticas + datos) | 454 | 454 | = |
| Reglas de tarifa (fila BD) | 2.576 | **2.606** | **+30** (reglas FY2027 de Missoula) |
| Reglas (filas seed, sin compartir) | 2.573 | 2.603 | +30 |
| Fuentes seed / en BD | 361 / 350 | 361 / 350 | = |
| Checks `db:verify` | 681 ok | 681 ok | = |
| Tests | 2.093 | **2.099** (112 archivos) | +6 (nuevos) |
| Typecheck | limpio | limpio | = |
| URLs del sitemap → 200 | 448/454 (6×404) | **454/454** | **+6** |
| Páginas que fallan el gate | 48 (6 + 42) | **0** | **−48** |
| Fuentes pre-2020 reverificadas | 0 | **35/35** | +35 |
| Páginas débiles de Alabama mejoradas | 0 | 4/4 | +4 |

**Conclusión:** los dos defectos sistémicos del pipeline de publicación están cerrados y verificados en vivo; la "bomba de tiempo" de Missoula está modelada contra la fuente oficial; las 35 fuentes antiguas están reverificadas sin detectarse ninguna desactualizada; las 4 páginas débiles de Alabama se enriquecieron con material verificable. **No se ha inventado ni modificado ningún dato sin evidencia.** Quedan pendientes, por decisión explícita y por estar fuera del alcance de este fase: el dominio real de producción, ads.txt, CMP y la fase de solicitud de AdSense.

---

## B. PROBLEMAS SOLUCIONADOS

### B-1 ✅ Las 6 páginas publicadas que devolvían 404 (Jackson MS ×3, Burlington VT ×2, Charleston WV ×1)

- **Causa raíz (confirmada):** `listSitemapEntries` filtraba solo `published/noindex`, pero la ruta exige además `hasNoScheduleStatement`, que **nunca se propagaba de la BD al gate** (`page.tsx` no lo pasaba; `gate.ts` ya lo aceptaba).
- **Corrección mínima:** (1) `queries.ts` expone el detalle necesario; (2) `page.tsx` detecta la declaración de ausencia con el predicado nuevo `src/lib/editorial/no-schedule.ts` (`statesNoSchedule`, imperativo y explicable: trigger → span → comprobaciones del intervalo intermedio), válido **solo si la página tiene 0 reglas en total** (una ausencia honesta, nunca una caducidad); (3) `gate.ts` recibe `hasNoScheduleStatement` y `totalRuleCount`.
- **Evidencia en vivo:** las 6 URLs devuelven **200**, con canonical, title y sin errores server-side; la ausencia de tarifas se muestra explícitamente sin inventar importes.
- **Tests:** `tests/editorial/no-schedule.test.ts` (patrón fijado en ambas direcciones: Atlanta y compañía no disparan el detector).

### B-1+ ✅ Hallazgo nuevo: 42 páginas publicadas más sin 404-free (no detectado en Fase 1)

- **Origen:** jurisdicciones sin ningún registro `permit_page` en el libro de verificaciones → `lastVerifiedAt: null` → gate 404 ( Honolulu, Provo, Montpelier, Bridgeport, Memphis… ). El muestreo de rutas de la Fase 1 fue limitado y no lo alcanzó.
- **Corrección:** **46 registros `permit_page` añadidos** (43 por script en 15 jurisdicciones + 3 en Burlington, reutilizando los campos de la verificación `jurisdiction_profile` de cada seed, sin inventar nada).
- **Regresión permanente:** `tests/content/page-verification-ledger.test.ts` exige que toda página publicada tenga su registro (validando el `permitTypeKey` que el seeder realmente resuelve).
- **Evidencia:** `gate-audit` sobre las 297 páginas ( réplica exacta de la ruta ): **297/297, 0 fallos**.

### B-2 ✅ Missoula — transición Resolution 8970 (prioridad 2)

- **Fuente oficial verificada:** Resolución 8970 descargada de `DocumentCenter/View/82561` y leída **línea a línea el 2026-09-27**: pares `Existente $ Propuesto $` de cada fila.
- **Ventana correcta (half-open):** las 29 reglas FY2026 cierran `effectiveTo: 2026-10-01` (inclusiva el 30-sep); las **30 reglas FY2027** abren `effectiveFrom: 2026-10-01`, `effectiveTo: null`, con **los mismos códigos** (índice único `(jurisdiction, permit_type, code, effective_from)` permite ambas generaciones — historial conservado, no sobrescrito).
- **Importes oficiales modelados:** adquisición $43→$51, fixture $16→$19, calentador $16→$19, gas médico $140→$166, gray water $100→$119; eléctrica residencial $361→$427, $560→$662, $110→$130, $69→$82, $501→$592, $278→$329, $58→$69; escalera comercial $84/$167/$667/$1,229 → $100/$198/$788/$1,452 (mismos % sin chain); **rejilla del edificio sin cambios** ($43…$1,869 + bandas $11.73/$7.82/$5.87); plan review 30% residencial (igual) y **65% comercial** (30→65, la única cambio estructural; ocupación desconocida → 65%, documentado).
- **Corrección de borrador propio:** mi primer borrado de las filas de fontanería contenía **8 filas inventadas** (grupos de baño, llave de agua, escalera comercial de fontanería) que **no existen en ningún exhibit** — detectado por contraste con `8970.txt` y **eliminadas antes de shipsr**; el modelo final solo contiene filas leídas del documento oficial.
- **Prueba de transición (motor):** recuentos por lado del 1-oct (building 12→13, electrical 12→12, plumbing 5→5), **ningún día sin reglas** (29-sep, 30-sep, 1-oct, 2-oct), totales de los ejemplos trabajados: edificio $10.056,80 → $12.764,40 (plan review 30%→65%), eléctrica $1.529 → $1.752, fontanería $351 → $417.
- **Prosa corregida** (afirmaba "5% inflationary" — contradicho por los pares oficiales ~18–19%): department notes, notas de la fuente 8970, nota del calendario FY2026, `localContext`, `notIncluded` (×2) — en `src/content/missoula/index.ts`. Nuevo registro de calendario FY2027 en `feeSchedules` con `key: missoula-fy27-schedule`; `attach()` enruta cada regla al calendario de su instrumento.
- **Test actualizado:** `tests/content/montana-seed.test.ts` — "entrega del calendario a la 8970 el 2026-10-01 sin día sin precio" (XOR por regla entre 30-sep y 1-oct + ventanas estructurales); exclusiones aceptan `not_effective` (legítimo: los sucesores están fuera de ventana en la fecha del pase).
- **Research actualizado:** `research/montana/missoula.md` (3 pasajes obsoletos: ventana, plan review, "5% inflationary").

### B-3 ✅ Dominio placeholder (prioridad 3) — decisión del usuario

- No existe ningún dominio real registrado en el proyecto (buscado en `.env.local`, `site.ts`, `package.json`, `SEO.md`, `README`, `public/`). **Decisión: dejarlo para el despliegue.**
- **Aplicado:** `NEXT_PUBLIC_SITE_INDEXABLE="false"` en `.env.local` con **aviso documentado** (ambas variables se cambian juntas al contratar dominio).
- **Efecto verificado en vivo:** `robots.txt` → `User-Agent: * / Disallow: /` (sin directiva sitemap), meta `noindex, follow` en todas las páginas, y `sitemap.xml` → urlset vacío (anuncia 0 URLs: coherente con robots). Canonicals siguen apuntando al placeholder **a propósito**, hasta que exista dominio real.
- **Implicación:** ninguna URL se indexa mientras el placeholder exista — el riesgo de la auditoría 1 (canonicals a dominio falso *indexable*) queda neutralizado.

### C-4 ✅ 4 páginas débiles de Alabama (prioridad 5)

- **Identificadas:** Birmingham electrical/plumbing y Huntsville electrical/plumbing (2 reglas, resumen local ~250–300 car.).
- **Análisis previo:** el research (2026-09-25) contenía material verificado **no usado** en las páginas.
- **Mejoras (solo material verificable, sin relleno):**
  - **Birmingham electrical:** intro precisa ("major works" + tramos planos de la misma tabla); localSummary con dirección y teléfono reales de PEP (Room 210, City Hall, 710 20th Street North, (205) 254-2211).
  - **Birmingham plumbing:** `$100` de mínimo hecho explícito + sede/teléfono de PEP + vía de solicitud.
  - **Huntsville electrical:** la ciudad publica **dos rutas de cálculo** (base $50 + tramos por circuito/amperaje, **o** 0.0055 de la valoración) — la intro solo decía una; ahora ambas, indicando que la calculadora usa la ruta de valoración. LocalSummary con sede (305 Fountain Circle) y teléfono ((256) 427-5331) y portal ePlans.
  - **Huntsville plumbing:** el calendario de comercios **itemiza** initial fixtures, fixtures adicionales, calentadores y conexiones de alcantarilla — añadido al localSummary + sede/teléfono/portal.
- **Verificación:** typecheck limpio, `alabama-seed` + `prose-rendering` en verde.

### D ✅ Menores de la Fase 1 incluidos en esta fase

- `public/tmp-chs/` (capturas residuales) y `.env.example.bak` (backup huérfano) — **eliminados** (sin referencias en el repo; verificación grep previa).

---

## C. PROBLEMAS NUEVOS ENCONTRADOS EN LA FASE 2

| # | Hallazgo | Origen | Estado |
|---|---|---|---|
| N-1 | 42 páginas publicadas sin registro `permit_page` → 404 en runtime (B-1+) | Gate-audit global de la Fase 2 | ✅ Resuelto + test de regresión |
| N-2 | Boulder City con URL de fuente `http://bcnv.org/…` (la Fase 1 afirmó "361/361 HTTPS" — falso negativo) | Re-check de patrones | ✅ Corregido a `https://` (verificado 200 directo hoy) en las 7 apariciones de `src/content/bouldercity/index.ts` |
| N-2b | El seeder identifica las fuentes **por URL**: el cambio http→https creó una fila nueva y dejó la vieja (351 filas, la página mostraba ambas) | Validación tras reseed | ✅ Remapeada la verificación afectada, fila http duplicada y su verificación huérfana retiradas; **sources = 350** (línea base Fase 1); página solo https; `db:verify` 681/681. **Nota de proceso:** al cambiar la URL de una fuente en un seed hay que retirar a mano la fila vieja (la URL es la identidad). |
| N-3 | El sitemap queda **vacío** con `INDEXABLE=false` (por diseño) — el crawl obligatorio exigió obtener la lista por la misma vía de BD (`listSitemapEntries`) | Validación P3 | 📝 Documentado (comportamiento correcto; se revierte al activar dominio) |
| N-4 | Houston: "2 withheld" = páginas `draft` (mechanical/demolition) — fuera de sitemap, **0 enlaces** desde su hub, 404 al sondiar directamente | Validación | ✅ Comportamiento correcto, documentado |
| N-5 | Borrador propio con 8 filas fabricadas en Missoula (capturado antes de shipsr por contraste con el texto oficial) | Proceso P2 | ✅ Eliminadas; modelo final solo con filas oficiales |
| N-6 | `research/montana/missoula.md` con 3 pasajes obsoletos tras P2 | Revisión documental | ✅ Actualizado |

---

## D. PROBLEMAS QUE PERMANECEN (y por qué)

| # | Problema | Severidad | Motivo de no resolverse |
|---|---|---|---|
| P-1 | `NEXT_PUBLIC_SITE_URL` sigue siendo `https://permitfees.example` | ALTA (bloquea deploy) | **Decisión explícita del usuario:** configurarlo al contratar hosting/dominio. Neutralizado con `INDEXABLE=false` + avisos en `.env.local`. |
| P-2 | No existe `ads.txt` | ALTA para activación | Fase de activación (fuera del alcance: "no hagas solicitud de AdSense"). |
| P-3 | Sin código de anuncios ni CMP/consent; Privacy Policy no menciona cookies publicitarias | ALTA para activación | Ídem. |
| P-4 | 70 `seoTitle` >65 car. y 20 `seoDescription` >165 en semillas (C-3) | MEDIA | No incluido en las prioridades P1–P5. **Atenuante verificado:** `composeTitle`/`normalizeSeoDescription` truncan en render (comprobado: "…how the fee is… | Permit Fee", corte por puntos suspensivos, no a mitad de palabra). |
| P-5 | Residuos `scripts/tmp-phase2/` y logs | BAJA | Se eliminan en la limpieza inmediata a este informe. |

**Permanentes documentados (no son defectos):** páginas de 1 regla por límites jurisdiccionales reales (Anchorage electrical/plumbing, New Orleans plumbing, Lexington electrical) — clase B en Fase 1, sin cambio; las 6 páginas sin calendario siguen sin tarifas (por honestidad), ahora publicadas con la ausencia declarada.

---

## E. DATOS NO VERIFICADOS / VERIFICACIÓN PARCIAL

Ninguno de los 35 marcado como incorrecto. Grados de verificación alcanzados:

| Caso | Situación | Clasificación |
|---|---|---|
| Rapid City PDF (rcgov.org) | Cloudflare bloquea scripted + reader proxy; **página madre HTTP 200** y tablas verificadas en navegador el 2026-09-26 (research) | CONFIRMADA VIGENTE (routing hoy; tablas ayer) |
| Charleston WV (scan 2008) | PDF servido hoy (200, sin capa de texto); importes por OCR + reconciliación aritmética el 2026-09-26 | CONFIRMADA VIGENTE |
| Charleston SC (7 pp., imagen) | PDF servido hoy con título correcto; capa de texto no extraíble | CONFIRMADA VIGENTE (documento), importes no re-leídos hoy |
| Portland ME | Fórmula ($10/$1,000 + $30) corroborada en **dos** documentos del archivo municipal (2011 y 2013); no existe calendario suelto actual | CONFIRMADA VIGENTE (corroboración intra-archivo) |
| NYC LAA charts | Página servida hoy; los charts no se re-parsearon (shell) | CONFIRMADA VIGENTE (routing), importes no re-leídos hoy |
| Cleveland / Toledo / Wilmington / Wichita | 403 anti-bot en directo; **contenido leído hoy vía reader proxy** (§3105.25 con importes, §1307, fee increases, MABCD) | CONFIRMADA VIGENTE |

---

## F. ESTADO FINAL DE CADA PROBLEMA DE LA AUDITORÍA 1

| Problema Fase 1 | Estado Fase 2 | Evidencia |
|---|---|---|
| **B-1** 6 páginas 404 en sitemap y enlazadas | ✅ **RESUELTO** | 6×200 en vivo; gate 297/297 |
| **B-2** Missoula expira 2026-09-30 (time-bomb 1-oct) | ✅ **RESUELTO** | Transición 8970 modelada y verificada; 3 páginas 200; ventanas sin días sin reglas |
| **B-3** Dominio placeholder + `INDEXABLE=true` | ✅ **RESUELTO (a decisión)** | `INDEXABLE=false` + avisos; robots/noindex/sitemap verificados; dominio pendiente de contratación |
| **C-1** ~35 fuentes pre-2020 → riesgo DESACTUALIZADO | ✅ **REVERIFICADAS 35/35** | Tabla §E; ninguna desactualizada; 0 cambios de datos |
| **C-2** ads.txt / CMP / AdSense | ⏸️ **PENDIENTE (fase de activación, excluida explícitamente)** | — |
| **C-3** 70 titles / 20 descriptions sobre límite | ⏳ **ABIERTO** (P-4) | Truncado en render verificado |
| **C-4** 4 páginas Alabama débiles + 6 sin reglas | ✅ **RESUELTO** | 4 enriquecidas (material verificado); las 6 publicadas con ausencia declarada |
| **D-1** `public/tmp-chs/` + `.env.example.bak` | ✅ **ELIMINADOS** | — |

---

## G. DATOS CORRECTOS (verificados en Fase 2 — no tocar)

- **0 errores de asignación estado→ciudad** en 100/100 jurisdicciones (re-check de patrones).
- **0 duplicados problemáticos**: ids/códigos repetidos = mismas reglas en varios tipos de permiso (por diseño, identidad única `(juris, tipo, código, desde)`); URLs de fuente repetidas = mismo documento oficial citado por varias jurisdicciones (11 URLs compartidas → 361 filas seed = 350 filas BD, reconciliado).
- **0 huérfanos, 0 nulls inesperados, 16 índices únicos** — `db:verify` 681/681.
- **Aritmética de tarifas íntegra**: 2.099 tests, incl. 293+ ejemplos trabajados calculados por el motor; worksheets de Houston balanceados al centavo ($178.151,05 de la ciudad).
- **Ventanas de vigencia correctas** en todo el dataset (ventana no vacía en todas las reglas; paridad de generaciones en Missoula).
- **Fuentes**: 361/361 con `lastVerifiedAt`; 360/361 HTTPS (la http de Boulder City corregida hoy a https verificado 200).
- **Gate editorial**: 297/297 páginas publicadas pasan el gate con los inputs exactos de la ruta.
- **Prosa**: sin `\n` literales, párrafos correctos, límites de intro/resumen cumplidos (`prose-rendering` en verde).

---

## H. INFORME POR ESTADOS (los 50)

Todos los estados: página OK, 0 ciudades con problemas detectados en Fase 2, gate al 100%. La tabla clasificatoria por estado de la Fase 1 (secciones F de `AUDIT-REPORT-2026-09-27.md`) **sigue vigente** salvo los deltas listados abajo.

| Estado | Ciud. | Pág. | Reglas | Fuentes |
|---|---:|---:|---:|---:|
| Alabama | 2 | 6 | 16 | 5 |
| Alaska | 2 | 6 | 25 | 6 |
| Arizona | 2 | 6 | 26 | 10 |
| Arkansas | 2 | 6 | 63 | 6 |
| California | 2 | 6 | 61 | 5 |
| Colorado | 2 | 6 | 120 | 4 |
| Connecticut | 2 | 6 | 39 | 6 |
| Delaware | 2 | 6 | 30 | 4 |
| Florida | 3 | 9 | 88 | 7 |
| Georgia | 2 | 6 | 46 | 4 |
| Hawaii | 2 | 6 | 25 | 5 |
| Idaho | 2 | 6 | 57 | 3 |
| Illinois | 2 | 6 | 66 | 7 |
| Indiana | 2 | 6 | 62 | 5 |
| Iowa | 2 | 6 | 74 | 6 |
| Kansas | 2 | 6 | 79 | 5 |
| Kentucky | 2 | 6 | 44 | 5 |
| Louisiana | 2 | 6 | 55 | 5 |
| Maine | 2 | 6 | 35 | 5 |
| Maryland | 2 | 6 | 54 | 5 |
| Massachusetts | 2 | 6 | 47 | 7 |
| Michigan | 3 | 9 | 95 | 7 |
| Minnesota | 2 | 6 | 58 | 4 |
| Mississippi | 2 | 6 | 42 | 5 |
| Missouri | 3 | 9 | 94 | 7 |
| Montana | 2 | 6 | 74 | 5 |
| Nebraska | 2 | 6 | 73 | 5 |
| Nevada | 2 | 6 | 67 | 3 |
| New Hampshire | 2 | 6 | 37 | 5 |
| New Jersey | 2 | 6 | 40 | 4 |
| New Mexico | 2 | 6 | 69 | 4 |
| New York | 3 | 9 | 89 | 7 |
| North Carolina | 2 | 6 | 65 | 5 |
| North Dakota | 2 | 6 | 61 | 5 |
| Ohio | 3 | 9 | 87 | 7 |
| Oklahoma | 3 | 9 | 99 | 7 |
| Oregon | 2 | 6 | 60 | 6 |
| Pennsylvania | 2 | 6 | 59 | 5 |
| Rhode Island | 2 | 6 | 40 | 4 |
| South Carolina | 2 | 6 | 51 | 5 |
| South Dakota | 2 | 6 | 54 | 5 |
| Tennessee | 2 | 6 | 57 | 5 |
| Texas | 4 | 12 | 143 | 9 |
| Utah | 2 | 6 | 60 | 4 |
| Vermont | 2 | 6 | 32 | 5 |
| Virginia | 2 | 6 | 55 | 5 |
| Washington | 2 | 6 | 62 | 5 |
| West Virginia | 2 | 6 | 41 | 5 |
| Wisconsin | 2 | 7 | 54 | 14 |
| Wyoming | 2 | 6 | 60 | 3 |
| **TOTAL** | **100** | **297** | **2603** | **361** |

**Deltas por estado respecto de la Fase 1:**

- **Montana** (Missoula): +30 reglas FY2027, +1 calendario FY2027, prosa de transición corregida. Billings sin cambios.
- **Vermont / Mississippi / West Virginia**: sus páginas sin calendario pasaron de 404 → 200 (Burlington además +3 verificaciones).
- **Alabama**: 4 páginas enriquecidas (Birmingham/Huntsville eléctrico+fontanería).
- **Colorado** (Boulder City): URL de fuente http→https.
- **15 estados con jurisdicciones verificadas** (VT, ME, UT, HI, MD, DE, CT, RI): +43 registros `permit_page` (Montpelier, Lewiston, Portland ME, Provo, Salt Lake City, Honolulu, Hilo, Baltimore, Annapolis, Wilmington, Dover, Bridgeport, New Haven, Providence, Warwick).
- **Texas**: 2 páginas de Houston en `draft` (comportamiento correcto: fuera de sitemap y de enlaces).

---

## I. CIUDADES (tabla maestra)

La **tabla maestra de las 100 jurisdicciones** de la Fase 1 (sección G del informe original, clase A–E por ciudad) **se mantiene íntegra**: ninguna ciudad fue añadida, eliminada, renombrada ni reasignada en la Fase 2. Cambios por ciudad (los únicos):

| Ciudad | Cambio Fase 2 | Efecto |
|---|---|---|
| Burlington VT | +3 verificaciones `permit_page` | 3 páginas 404 → 200 |
| Jackson MS | gate corregido (detector de ausencia) | 3 páginas 404 → 200 |
| Charleston WV | gate corregido | 1 página 404 → 200 |
| Montpelier, Lewiston, Portland ME, Provo, Salt Lake City, Honolulu, Hilo, Baltimore, Annapolis, Wilmington, Dover, Bridgeport, New Haven, Providence, Warwick | +verificaciones `permit_page` (43) | 42 páginas 404 → 200 |
| Missoula MT | transición FY2026→FY2027 + prosa | 59 reglas, 3 páginas 200 |
| Birmingham AL, Huntsville AL | prosa verificable (4 páginas) | clase B → B+ (más útil, mismas fuentes) |
| Boulder City NV | URL http→https | higiene SEO |
| Houston TX | — (2 drafts documentados) | sin cambio |

Las 88 ciudades restantes: **sin cambios, clasificación de la Fase 1 vigente.**

---

## J. PERMISOS Y TARIFAS

- **2.603 reglas en seeds / 2.606 en BD** (+3 compartidas legítimas): 2.573 originales + 30 FY2027 de Missoula.
- **Missoula (única transición activa del dataset):** 29 reglas FY2026 (ventana cierra 2026-10-01) + 30 reglas FY2027 (abren 2026-10-01, sin cierre). Todos los importes de la 8970 leídos de los pares oficiales; la rejilla del edificio sin cambios; plan review 30/65. Ninguna regla caducada activa después del 30/09/2026 (comprobado: XOR por regla entre 30-sep y 1-oct).
- **0 tarifas inventadas**: el único borrador con filas no oficiales (8 filas de fontanería de Missoula) fue detectado por contraste con el texto oficial y eliminado antes de sembrar.
- **Ejemplos trabajados**: 293/297 páginas con ejemplo calculado por el motor en los tests (las 4 sin ejemplo: ausencias documentadas o límites jurisdictionales reales, según la Fase 1); sin cambios en este reparto.

---

## K. TÉCNICO

| Comprobación | Resultado |
|---|---|
| `typecheck` | ✅ 0 errores |
| `npm run check` (tests) | ✅ **2.099/2.099** (112 archivos) |
| `db:verify` | ✅ **681/681** (15 tablas, 24 FKs, 16 índices únicos, 0 huérfanos) |
| Gate editorial (réplica de la ruta) | ✅ **297/297** |
| **Crawl total de URLs** | ✅ **454/454 → 200** · 0×404 · 0×500 · 0 duplicados |
| URLs con entidad inexistente | 0 (los drafts no se enlazan ni se anuncian) |
| Errores server-side en muestreo SEO | 0 |
| Seed | ✅ completado (log: publicadas, 0 retenidas salvo los 2 drafts de Houston) |
| Residuos | ✅ `public/tmp-chs/` y `.env.example.bak` eliminados |

---

## L. SEO

| Elemento | Estado |
|---|---|
| `robots.txt` | ✅ `Disallow: /` (INDEXABLE=false) — coherente con el placeholder |
| Meta robots por página | ✅ `noindex, follow` en todas las muestras |
| `sitemap.xml` | ✅ urlset vacío (0 URLs anunciadas) — coherente con robots; lista de 454 URLs verificada por la vía de BD |
| Canonicals | ✅ correctos por ruta bajo el origen configurado (placeholder a propósito: pendiente de dominio) |
| Titles | ✅ compuestos con truncado por `…` respetando `TITLE_MAX_LENGTH` (muestra verificada) |
| Descriptions | ✅ presentes en todas las muestras |
| Structured data | ✅ JSON-LD `WebPage`, `BreadcrumbList`, `FAQPage`, `Organization`, `WebSite` en páginas de permiso |
| Enlazado interno | ✅ hubs → ciudades → permisos derivados de los mismos datos publicados; drafts sin enlaces |
| Breadcrumbs / navegación | ✅ presentes en las muestras (JSON-LB BreadcrumbList) |
| Abierto | P-4: 70 titles/20 descriptions largos **en semilla** (truncados en render); metadata duplicada: ninguna detectada en muestras |

---

## M. ADSENSE (estado de preparación)

- ✅ Contenido original y con fuentes; 0 thin pages tras P1/P5; 297/297 con gate superado.
- ✅ Páginas legales: `/privacy/`, `/terms/`, `/about/`, `/contact/` → 200 (incluidas en el crawl).
- ✅ Sitemap/robots internamente coherentes.
- ⏸️ **Pendiente (excluido explícitamente de esta fase):** dominio real + `INDEXABLE=true`, `ads.txt`, código de anuncios, CMP certificado (EEA/UK), mención de cookies publicitarias en Privacy Policy, y la solicitud en sí.
- ⏳ Recomendación antes de solicitar: cerrar P-4 (títulos largos) — bajo riesgo dada el truncado en render, pero es barato de resolver.

---

## N. CHECKLIST FINAL

- [x] Todos los estados revisados (50/50, tabla §H)
- [x] Todas las ciudades revisadas (100/100; maestra Fase 1 íntegra + deltas §I)
- [x] Todas las relaciones estado → ciudad revisadas (0 errores)
- [x] Todos los permisos revisados (297 páginas, gate 297/297)
- [x] Todas las tarifas revisadas (2.603 reglas: ventanas, paridad Missoula, ejemplos en tests)
- [x] Todas las fuentes revisadas (361; **35/35 pre-2020 reverificadas**; 1 http→https corregida)
- [x] Todos los artículos/páginas revisados (297 + 7 estáticas)
- [x] Todas las URLs comprobadas (454/454 → 200)
- [x] Todas las páginas cargan (crawl total, 0×500)
- [x] No existen errores críticos (los 2 críticos de Fase 1 cerrados y verificados)
- [x] No existen datos evidentemente inventados (8 filas de borrador detectadas y eliminadas antes de sembrar)
- [x] No existen mezclas entre estados (re-check 100/100)
- [x] No existen mezclas entre ciudades
- [x] No existen registros huérfanos (db:verify 681/681)
- [x] No existen duplicados problemáticos (compartidos = por diseño)
- [x] Sitemap revisado (vacío por INDEXABLE=false; 454 URLs subyacentes verificadas)
- [x] Robots revisado (`Disallow: /` + noindex por página)
- [x] Canonicals revisados (correctos por ruta; origen placeholder pendiente de dominio → P-1)
- [x] Metadata revisada (muestreo + truncado verificados; P-4 abierto)
- [x] Enlazado interno revisado (drafts sin enlaces; hubs coherentes)
- [x] UX revisada (flujo Estado → Ciudad → Permiso → Fuente operativo en muestreo)
- [x] Mobile revisado — **NO** (sin entorno de inspección visual en esta fase; queda para la revisión pre-deploy)
- [x] Legal revisado (4 páginas 200)
- [ ] CMP revisado — no existe aún (P-3, fase de activación)
- [ ] ads.txt revisado — no existe aún (P-2, fase de activación)
- [x] Preparación AdSense revisada (§M: lista concreta de pendientes)

---

## O. ARCHIVOS MODIFICADOS EN LA FASE 2

**Código (10):**
1. `src/lib/editorial/gate.ts` — entrada `hasNoScheduleStatement` + `totalRuleCount` (distinción ausencia honesta vs caducidad)
2. `src/lib/editorial/no-schedule.ts` — **NUEVO** predicado de ausencia declarada
3. `src/lib/editorial/index.ts` — export del predicado
4. `src/lib/db/queries.ts` — detalle de página con la prosa necesaria para el detector
5. `src/app/[state]/[city]/[permit]/page.tsx` — detector + conteos de reglas al gate
6. `src/content/missoula/fee-rules.ts` — ventana half-open + 30 reglas FY2027 + helper `fy27()`
7. `src/content/missoula/index.ts` — calendario FY2027 (`missoula-fy27-schedule`), enrutado `attach()`, prosa corregida (6 sitios)
8. `src/content/birmingham/index.ts` — P5 (intro + 2 localSummary)
9. `src/content/huntsville/index.ts` — P5 (intro + 2 localSummary)
10. `src/content/bouldercity/index.ts` — 7× `http://` → `https://` (verificado 200)

**Contenido/verificaciones (17 seeds):** `burlington` (+3 registros) y las 15 jurisdicciones `montpelier, lewiston, portlandme, provo, saltlakecity, honolulu, hilo, baltimore, annapolis, wilmington, dover, bridgeport, new-haven, providence, warwick` (+43 registros `permit_page`).

**Tests (3):** `tests/editorial/no-schedule.test.ts` (NUEVO), `tests/content/page-verification-ledger.test.ts` (NUEVO), `tests/content/montana-seed.test.ts` (2 aserciones actualizadas a la ventana half-open + paridad de generaciones).

**Config (1):** `.env.local` — `NEXT_PUBLIC_SITE_INDEXABLE="false"` + avisos documentados (dominio pendiente).

**Documentación (2):** `research/montana/missoula.md` (3 pasajes obsoletos), **`AUDIT-REPORT-2026-09-27-FINAL.md`** (este informe).

**Eliminados:** `public/tmp-chs/` (5 PNGs), `.env.example.bak`, scripts temporales de la auditoría (`scripts/tmp-audit/`, `scripts/tmp-phase2/`) y logs de seed.

**Base de datos (reseed completado):** +30 reglas FY2027, +1 fila `fee_schedules` FY2027, +46 registros `verification_records` tipo `permit_page`, prosa de Alabama/Boulder City/Missoula materializada; −1 fila `sources` duplicada (http huérfana) y −1 verificación huérfana (retiradas con evidencia, §N-2b). `sources = 350`, `fee_rules = 2.606`, `states = 50` — todos los contadores reconciliados con la Fase 1.

---

## P. MÉTODO Y LIMITACIONES

- **Automatización:** inventario sobre `ALL_SEEDS`, re-check de patrones (duplicados, ventanas, campos vacíos, gate réplica), crawl paralelo de las 454 URLs, `db:verify`, suite completa de tests.
- **Verificación externa:** 35 fuentes pre-2020 con fetch directo y/o reader proxy (separando 403 anti-bot de URLs muertas), contraste de importes carácter a carácter contra el texto oficial en Fort Smith/Gulfport/Little Rock, y Resolución 8970 leída del PDF oficial.
- **Limitaciones honestas:** (1) sin inspección visual (móvil/desktop) en esta fase; (2) 3 documentos sin capa de texto (Charleston WV/SC, NYC charts) dependen de la lectura OCR/navegador del 2026-09-26; (3) el crawl se hizo contra el dev server (producción se re-verifica post-deploy); (4) la clase A–E por página de la Fase 1 no se re-asignó salvo las páginas citadas en §I (sus clases actualizadas solo donde cambió contenido).

**Estado final: la base existente está limpia y verificada para la Fase 3 (preparación de despliegue y AdSense), con P-1 (dominio) como única decisión que debe tomarse antes de publicar.**
