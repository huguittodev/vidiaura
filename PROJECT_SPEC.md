# Vidiaura — Documento Maestro de Producto y Arquitectura (v3.0 — Atomic Shotcraft Engine)

**Versión:** 3.0  
**Fecha:** 11 de noviembre de 2026  
**Estado:** Base v2 completada (Fases 1–8 PASS) · En evolución a **v3.0 Atomic Shotcraft Engine**  
**Marca de producto:** **Vidiaura** (identificadores internos heredados `launtion` / `vidiaura` se mantienen por compatibilidad).  
**Idioma:** Español para documentación y UI inicial; arquitectura preparada para i18n.

> **Cómo utilizar este documento:** Es la fuente de verdad de producto y arquitectura de Vidiaura. Todo código, esquema Zod, átomo de Remotion, prompt de IA y regla de agentes debe respetar este documento.

---

## 1. Visión Ejecutiva y Propuesta de Valor

**Concepto:** Convertir recursos reales de un producto digital (capturas de pantalla, grabaciones de pantalla, logotipo, tokens de color y descripción) en vídeos promocionales de nivel estudio mediante un **motor atómico de motion graphics en Remotion** (cámara 2.5D/3D de alta nitidez, recortes de UI flotantes en el eje Z, cursores vectoriales, tipografía cinética, iluminación/spotlights, fondos procedimentales o clips de Google Flow/Veo) sincronizados matemáticamente al compás musical (**Beat-Sync**) y con diseño sonoro cinematográfico (**Auto-SFX**).

**Doble caso de uso del motor:**
1. **Modo SaaS Autoservicio (Web App):** Fundadores de SaaS, indie hackers y equipos de producto suben sus capturas/grabaciones, la IA actúa como **Director de Fotografía** combinando átomos sobre un `SceneGraph` declarativo validado con Zod (sin generar ni ejecutar código React/JS arbitrario en producción), el usuario personaliza en vivo con `@remotion/player` y exporta en MP4 1080p (16:9 y 9:16).
2. **Modo Estudio / Producción Diaria con Antigravity (CLI + Skill `shotcraft-atomic-builder`):** Permite producir vídeos promocionales diarios (ej. para ZentioGrid o clientes piloto) reutilizando y ampliando el catálogo de átomos inspirados en [`Vincentwei1021/video-shotcraft`](https://github.com/Vincentwei1021/video-shotcraft) (`references/video-shotcraft/`), de modo que cada nuevo átomo creado para un vídeo pase automáticamente a enriquecer el motor del SaaS.

---

## 2. Diagnóstico de la Base Actual (v2) y Salto a v3.0

### 2.1 Lo que ya está construido y validado (Base v2 — Fases 1–8 COMPLETADAS)
- **Aplicación Next.js 16 App Router + TypeScript strict + Tailwind v4**.
- **Motor Remotion `4.0.539` coordinado** (`remotion`, `@remotion/player`, `@remotion/renderer`, `@remotion/bundler`, `@remotion/cli`).
- **Sistema de Tokens determinista** (`src/lib/design/tokens.ts` → `src/app/tokens.generated.css`) y **Motor Geométrico de Área Segura** (`src/lib/scene-graph/layout.ts` con `getSafeArea`, `fitInside`, `buildPreset`, `validateLayout`).
- **Esquema `SceneGraph` v2.0** (`src/lib/scene-graph/schema.ts` y `types.ts`) con validación Zod estricta y adaptador desde `InteractionMap`.
- **Inteligencia Multimodal y Director Creativo** (`src/lib/input-intelligence/gemini-vision-adapter.ts` y `src/lib/ai/gemini-adapter.ts`) con fallback determinista garantizado cuando no hay API key o falla la red.
- **Editores Web**: Editor minimalista (`/editor`) y Studio avanzado (`/editor/advanced`) más grabador de pantalla con telemetría de ratón (`src/lib/recorder/`).
- **Render Worker asíncrono** (`src/lib/render/`) y **Persistencia con Supabase + RLS + Modo Mock** (`src/lib/supabase/`).

### 2.2 Limitaciones de v2 que resuelve v3.0
1. **De Escenas Monolíticas a Átomos Composables:** En v2 cada escena era un bloque cerrado (12 tipos fijos como `metric_cards` o `saas_feature_grid`). En v3 cada plano (**Shot**) es una combinación libre de **5 capas atómicas ortogonales**.
2. **Unificación visual de composiciones:** En v2 la composición más pulida (`VidiauraShowcase.tsx`) estaba harcodeada y desconectada del generador IA (`InteractiveSurfaceDemo.tsx`). En v3 ambas convergen en un motor único guiado por `layout.ts`, `tokens.ts` y el catálogo atómico.
3. **Nitidez 3D, Física de Acabado y Ritmo Musical:** Incorporamos las lecciones técnicas de `video-shotcraft` (escalado por layout `zoom` en 3D para evitar texto borroso, sombras multicapa por elevación, motion blur direccional, cortes sincronizados a BPM y compensación de offset de audio).

---

## 3. Arquitectura del Motor v3.0: "Atomic Shotcraft Engine" (5 Capas)

En lugar de escenas rígidas, un vídeo en Vidiaura v3 se modela como una secuencia rítmica de **Shots (Planos)** (típicamente 8–14 planos de 1.2s–3.5s para una pieza de 15–25s). Cada **Shot** se ensambla combinando **5 capas atómicas independientes**:

```text
Shot (Plano de 1.2s a 3.5s, anclado al BeatGrid)
 ├── Capa 1: Stage & Backdrop Atom (Escenario + Iluminación + Textura)
 │     ├── Variantes procedimentales: Obsidian Stage, Editorial Paper, Porcelain SaaS, Aurora Mesh, Perspective GridFloor
 │     ├── Acabado de estudio (Polish): Vignette radial + Grain determinista en caché (6 tiles SVG feTurbulence) + Dust opcional
 │     └── Fondo de vídeo externo opcional: Clip B-roll cinematográfico (Google Flow / Veo) envuelto con crossfade loop
 │
 ├── Capa 2: Spatial & Camera Rig (Geometría 2.5D/3D + Receta de Cámara)
 │     ├── Layout Preset (layout.ts): hook, stage, split, bento, lower-third, pair, exploded-stack, carousel-deck
 │     ├── Camera Recipe: static-hold, slow-push-in, isometric-orbit, steep-tilt-glide, depth-parallax-slide, crash-zoom-punch
 │     └── Renderizado 3D nítido (Regla Q2): CSS `zoom` a nivel de layout + pivote en punto focal (cx, cy) + DOF opcional
 │
 ├── Capa 3: Visual Subject Atoms (Sujetos Visuales alojados en los Slots del Layout)
 │     ├── Real Product Atoms:
 │     │     ├── RealCaptureSurface / PageCam (captura completa o vídeo real con marco de ventana y sombra por elevación)
 │     │     ├── CropCalloutCard (recorte ampliado de una región [ymin,xmin,ymax,xmax] de la captura real flotando en Z > 0)
 │     │     └── ClipCard (clip MP4 con loop crossfade automático de audio y opacidad)
 │     ├── Synthetic UI & Data Atoms:
 │     │     ├── DeckDealGrid / CardStack (reparto acelerado de tarjetas con física de anticipación y settle por capas)
 │     │     ├── TypeAndFilterBar / SyntheticPromptBox (búsqueda o prompt con escritura realista y filtrado en vivo)
 │     │     ├── DigitRollMetricCard (métricas con rodillo odómetro tabular-nums y gráficas vivas)
 │     │     ├── IntegrationHubMap / SyntheticConnectPills (nodos conectados y píldoras de flujo)
 │     │     ├── SyntheticCodeTree / Terminal3D (árbol de arquitectura o terminal en perspectiva)
 │     │     ├── ConversationalMockup (chat realista por turnos)
 │     │     └── SyntheticHeroButton / BrandLockupOutro (CTA con clic físico o cierre "foto de familia" de lanzamiento)
 │     └── Typography Atoms:
 │           └── TextReveal / KineticTypography (variantes: rise, blur, drop, scale, track, marker-underline, pill-slot-cycle)
 │
 ├── Capa 4: Light, Emphasis & Cursor Modifiers (Modificadores de Dirección)
 │     ├── SpotlightSweepMask (oscurece el entorno y revela el área activa con barrido lineal y luz de borde pegada al marco)
 │     ├── Sheen (barrido único de brillo diagonal recortado estrictamente dentro del border-radius del protagonista)
 │     ├── FocusCalloutBracket (anotación 3D en el mismo espacio de perspectiva con subrayado fluorescente)
 │     └── SmartCursor (trayectoria Bezier hacia coordenadas normalizadas reales, presión física de clic y onda)
 │
 └── Capa 5: Transition & Sonic Glue (Transición entre Planos + Beat-Sync + Auto-SFX)
       ├── Transition Atom (en la costura entre Shot N y Shot N+1):
       │     ├── hard-cut (corte limpio al beat)
       │     ├── flash-cut (destello cálido/blanco de 10 frames a caballo del corte: cutFrame - 5 a cutFrame + 5)
       │     ├── whip-pan-brake (barrido horizontal rápido con SpeedBlur direccional y frenada suave)
       │     ├── portal-zoom-wipe (una tarjeta se amplía como ventana hacia el mundo de detalle del siguiente plano)
       │     └── card-flock-tumble / stack-wipe
       └── Sonic Glue:
             ├── Anclaje al BeatGrid (`beatF(n)`) cuando hay BGM rítmica
             └── Emisión automática de SFX por evento visual con compensación dual de offset (`sfxFrom`)
```

---

## 4. Reglas de Ingeniería Visual y Sonora (Destiladas de `video-shotcraft`)

Estas reglas provienen de casos reales de producción en `references/video-shotcraft/references/aesthetic-rules.md`, `Polish.tsx`, `Look.tsx`, `PageCam.tsx` y `sound-design.md`, y son **obligatorias** para todos los átomos y composiciones de Vidiaura:

### 4.1 Nitidez, Texturas y Renderizado 3D (Calidad `Q`)
- **Q1 — Fidelidad a la interfaz real:** Cuando se representa la interfaz del producto del usuario, la captura o grabación subida es el protagonista real. Los átomos de UI sintética se usan para ganchos conceptuales, énfasis de flujos o cierres de marca, y deben tener acabado de publicación (nunca aspecto de wireframe vacío).
- **Q2 — Prohibido desenfocar texto al hacer zoom en 3D (Técnica Layout-Scale CSS `zoom`):** En Chromium/Remotion, aplicar `transform: scale(zoom)` dentro de un contenedor con `perspective` hace que Chromium rasterice la capa al tamaño base (1920px) y luego la escale en GPU, dejando el texto pixelado. Para zooms en perspectiva 3D, aplicar la propiedad CSS `zoom` al contenedor de layout y trasladar con `Tx = (viewportW / 2) / zoom - cx`, `Ty = (viewportH / 2) / zoom - cy` con `transformOrigin: '${cx}px ${cy}px'`.
- **Q3 — Cámara estable:** Prohibido añadir *handheld camera shake* o ruido de cámara en demos de interfaz limpias.
- **Q4 — Brillos (`Sheen` / `Glint`) con moderación extrema:** Prohibido disparar destellos sobre todas las tarjetas de una rejilla a la vez. El barrido de luz (`<Sheen />`) solo se aplica **una vez** al elemento protagonista y siempre recortado por `overflow: hidden` y `border-radius`.
- **Q5 — Un solo protagonista en la apertura:** El plano de apertura o presentación de interfaz debe centrarse en un único elemento héroe con un arco de movimiento completo (foco → acercamiento → elevación → asentamiento).
- **Q6 — El ángulo de cámara sirve a la legibilidad:** Las vistas con listas densas o tablas se mantienen frontales (ortogonales) o con inclinación lateral mínima; los ángulos 3D pronunciados (`rotX`, `rotY`) se reservan para planos narrativos, pilas de tarjetas o vistas espaciales.
- **Q9 — Todo elemento que vuela aterriza en un slot real:** Ningún átomo debe quedar flotando arbitrariamente tapando texto crítico; todo elemento aterriza dentro de su `LayoutSlot` validado por `layout.ts` (`fitInside`).
- **Q11 — Altura mínima efectiva en píxeles para texto legible:** En un lienzo 1080p, todo texto pensado para leerse en móvil/redes debe tener una **altura efectiva en pantalla $\ge 56\text{px}$ para subtítulos/titulares narrativos** (recomendado $60\text{px}$) y **$\ge 32\text{px}$ para texto secundario/métricas/URLs**, medida *después* de multiplicar por el `scale` de los contenedores padres y la compresión por perspectiva (`cos(rotY)`). No debe existir texto en un "estado intermedio" ilegible: o es textura de fondo claramente secundaria o cumple $\ge 32\text{px}$.

### 4.2 Ritmo, Física y Energía (`R` & `P`)
- **R1 — Presupuesto obligatorio de reposo (`Hold/Rest Budget`):** Cuando un elemento clave o logotipo/wordmark termina de animarse, debe permanecer estable al menos **1 segundo (30 frames a 30fps)** antes de cortar. Las animaciones de grupos de tarjetas deben dejar **0.5 segundos (15 frames)** de reposo al completarse.
- **R2 — La sensación de velocidad viene de la aceleración, no de la velocidad constante:** Prohibidas las entradas en grupo con intervalos lineales uniformes. Usar escalonamiento acelerado (`stagger` con curva `EASE.exit` o reducción cuadrática de intervalos) ligado a una metáfora física (como repartir cartas en `deck-deal-flyin`), más jerarquía de asentamiento (*follow-through*: el cuerpo de la tarjeta se detiene primero, la sombra converge 2–4 frames después).
- **R4 — Restricción en cortes al beat (`Beat-Sync`):** Alinear al ritmo musical controla el *cuándo*, no sacudir toda la pantalla en cada bombo. Los impactos a pantalla completa (zoom slam, flash de cámara) están limitados a **máximo 3 por vídeo** (separados al menos por 16 beats). El resto de golpes musicales mueven únicamente la capa de elementos sujetos.
- **P4 — Una técnica protagonista por vídeo, cero repetición:** Cada plano debe aportar información nueva (una característica o beneficio distinto) y una misma coreografía compleja (ej. reparto de baraja o giro 3D extremo) solo actúa como protagonista una vez por vídeo.

### 4.3 Diseño Sonoro Cinematográfico y Sincronización (`S`)
- **S1 — Vocabulario sonoro de tráiler de producto, cero sonidos de videojuego:** Prohibidos los sonidos sintéticos tipo *arcade/game-pack* (bloops, plucks infantiles). El banco de sonido usa grabaciones físicas reales (clics mecánicos, obturador, deslizamiento de papel/vidrio) y vocabulario cinematográfico (`whoosh`, `riser`, `sub-bass-drop`, `impact`, `sparkle/chime`).
- **S2 — Regla anti-ametralladora en sonidos repetidos:** Cuando entran múltiples elementos seguidos (ej. 6–20 tarjetas o teclas), nunca disparar el mismo sample al mismo volumen a intervalos fijos. Alternar al menos 2 samples, aplicar **escalera descendente de volumen** (ej. `0.45 → 0.22`) y acelerar el intervalo siguiendo la curva visual; si la densidad supera el umbral perceptible, fundir en un único `whoosh`.
- **S3 & S4 — Tabla declarativa de audio derivada de los Shots:** Los componentes visuales nunca incrustan etiquetas `<Audio>` sueltas ocultas; el compilador genera la pista `audioTrack` a partir de las acciones y duraciones reales de los planos (`shot.startFrame + localOffset`), recortando muestras largas (como escritura de teclado) exactamente a la duración de la acción visual.
- **S5 — Compensación Dual de Offset de Audio:** Para que el pico de energía de un efecto coincida al fotograma con el impacto visual en el MP4 exportado, el cálculo del frame de inicio aplica:
  $$\text{fromFrame} = \max\left(0, \text{round}(\text{targetPeakFrame} - \text{samplePeakLagFrames} - \text{outputPipelineOffsetFrames})\right)$$
  donde `samplePeakLagFrames` compensa el ataque interno del archivo de audio y `outputPipelineOffsetFrames` compensa el *priming* del codificador AAC (~1.28 frames a 30fps / 48kHz).

---

## 5. Contrato `SceneGraph` (Compatibilidad v2.0 + Evolución v3.0)

### 5.1 Principio de Compatibilidad Inviolable
- Todo `SceneGraph` v2.0 existente (`version: "2.0"`) sigue siendo 100% válido y renderizable.
- El nuevo contrato extensible soporta descriptores atómicos multicapa por plano (cámara por shot, layout preset explícito, recortes `cropCallouts`, modificadores `spotlight`/`sheen`, `transitionOut` y `beatGrid`) sin romper ningún test ni ruta existente (`/api/creative-director`, `/api/input-intelligence`, `/api/projects`, `/api/render`).
- Nunca se ejecuta código React/JS procedente del LLM: el LLM solo emite JSON validado por `SceneGraphSchema` (Zod).

### 5.2 Pipeline de IA en 4 Etapas (Creative Director v3)
1. **Etapa 1 — `Visual & Brand Intelligence` (Multimodal):** Analiza capturas o frames muestreados del vídeo del usuario (`gemini-vision-adapter.ts`). Extrae paleta cromática, textos OCR reales y cajas delimitadoras normalizadas `[ymin, xmin, ymax, xmax]` de botones CTA, inputs, métricas y paneles destacables.
2. **Etapa 2 — `Narrative & Beat Arc Planner`:** Aplica la curva de energía (`promo-energy-arc`: *① Brand Hook con hold ≥1s → ② Hero Subject Reveal ≥3s → ③ Feature Climb alternando planos de alta energía y planos de lectura con tarjetas de respiración → ④ Launch Peak Finale con hold ≥1s*) sobre el `BeatGrid`.
3. **Etapa 3 — `Shotcraft Recipe Selector`:** Asigna a cada plano las 5 capas del catálogo permitido (`ShotRecipeRegistry`): `backdrop`, `layoutPreset`, `cameraRecipe`, `subjectAtoms`, `modifiers` y `transition`.
4. **Etapa 4 — `Deterministic Compiler` (TypeScript puro, 0% alucinación):** Calcula los rectángulos `fitInside` dentro de `getSafeArea` (`layout.ts`), verifica las alturas efectivas de fuente (Regla Q11), genera las trayectorias de cámara 2.5D y cursor Bezier hacia los landmarks reales, sintetiza la pista `audioTrack` con la regla anti-ametralladora (S2) y compensación de offset (S5), y valida el resultado final con `SceneGraphSchema.safeParse`.

---

## 6. Biblioteca de Referencia Local (`references/video-shotcraft`)

El repositorio oficial `Vincentwei1021/video-shotcraft` (Apache 2.0) se encuentra clonado localmente en `references/video-shotcraft/` (ignorado en Git para mantener ligero el repositorio principal) y conectado mediante la skill de Antigravity `.agents/skills/shotcraft-atomic-builder/SKILL.md`.

### Componentes Base de `video-shotcraft` para Portar/Adaptar a `remotion/motion-kit/`
1. **`demos/_fixtures/Polish.tsx`**: Solver `bezier(x1,y1,x2,y2)`, presets `EASE` (`snappy`, `out`, `smooth`, `swift`, `exit`, `anticip`, `overshoot`), helper `ramp()`, `velocity()`, sombras de doble capa `softShadow(elevation)`, `hairline()`, `innerHighlight()`, `surface()`, `<Grain />` determinista en caché, `<Vignette />`, y `<SpeedBlur vx vy />`.
2. **`demos/_fixtures/Look.tsx`**: Paletas semánticas `LOOKS` (`midnight`, `aurora`, `ember`, `graphite`, `lime`, `paper`, `porcelain`, `sand`), escala tipográfica `TYPE` compatible con Q11, helper `stagger()`, `<Stage />`, `<GridFloor />`, `<Dust />`, `<Sheen />` y `<TextReveal />` (`rise`, `blur`, `drop`, `scale`, `track`).
3. **`assets/lib/PageCam.tsx`**: Cámara 2.5D sobre capturas reales con CSS `zoom` a nivel de layout (Regla Q2), rotación 3D pivotada en `(cx, cy)` y banda opcional de desenfoque DOF.
4. **`assets/lib/ClipCard.tsx`**: Envoltorio de clips de vídeo MP4 con bucle de disolución cruzada (`OffthreadVideo` + `<Sequence>` con envolventes complementarias de opacidad y audio).
5. **`assets/lib/DigitRoll.tsx` y `assets/lib/FlashCut.tsx`**: Contadores numéricos tipo odómetro y transición de destello radial de 10 frames.
6. **Catálogo de 124 Recetas en 10 Categorías (`references/video-shotcraft/references/shots/` y `demos/`)**:
   - `opening` (11 recetas: `brand-ink-open`, `spotlight-hero-card`, `text-as-mask`, `magician-card-flourish`, `crane-rise-reveal`...)
   - `camera` (10 recetas: `depth-layer-moves`, `crash-zoom-punch`, `cursor-flyover`, `steep-tilt-glide`, `terminal-3d`...)
   - `ui-entrance` (21 recetas: `deck-deal-flyin`, `card-stack`, `carousel-3d`, `row-embed`, `integration-hub-map`, `neon-frame-orbit-drop`...)
   - `interaction` (11 recetas: `type-and-filter`, `collab-cursor-moves`, `glass-pill-dictation-typing`, `picker-carousel-feature-cycle`, `theme-switch-moves`...)
   - `data` (5 recetas: `chart-live-moves`, `gauge-readout-moves`, `before-after-slider-scrub`, `scroll-brake-moves`, `timeline-travel`)
   - `effects` (15 recetas: `spotlight-sweep-moves`, `scanline-annotate-focus`, `glow-flyline-moves`, `light-play-moves`, `slam-entrance-moves`...)
   - `typography` (22 recetas: `lead-word-zoom-assemble`, `paper-title-card`, `marker-underline-title`, `pill-slot-cycle`, `typewriter-moves`...)
   - `transition` (15 recetas: `shot-transitions` [flash-cut, whip-pan-brake, portal-wipe], `card-flock-tumble`, `card-flip-reveal`, `mosaic-reframe`...)
   - `rhythm` (8 recetas: `beat-cut-moves`, `quad-split-parallel-scenes`, `speed-ramp-freeze`, `trailer-grammar-moves`...)
   - `outro` (6 recetas: `outro-group-photo-launch`, `logo-shrink-wordmark-lockup`, `ui-to-brand-morph`...)

---

## 7. Hoja de Ruta de Construcción (Fases 0 a 5)

### Fase 0 — Cimientos, Análisis de `video-shotcraft`, Reglas y Skill Antigravity [ACTUAL]
- Clonar `Vincentwei1021/video-shotcraft` en `references/video-shotcraft/` y proteger `.gitignore`.
- Limpiar notas históricas obsoletas de `.agents/teamwork/`.
- Actualizar `PROJECT_SPEC.md` (este documento) y `AGENTS.md` con la arquitectura de 5 capas y las reglas `R1–R4`, `Q1–Q11`, `S1–S5`.
- Crear la skill `.agents/skills/shotcraft-atomic-builder/SKILL.md` con el catálogo completo de recetas y guía de portabilidad de átomos.
- Verificar que `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` pasan al 100% sin regresiones.

### Fase 1 — Primitivas de Acabado (`Polish`, `Look`, `PageCam`) y `SceneGraph` Composable (5 Capas)
- Portar las primitivas base de acabado (`Polish`, `Look`, `PageCam`, `ClipCard`, `DigitRoll`, `FlashCut`, `Sheen`, `SpotlightSweep`) a `remotion/motion-kit/` integradas con `src/lib/design/tokens.ts`.
- Extender `src/lib/scene-graph/schema.ts` y `types.ts` (manteniendo compatibilidad total con v2.0) para soportar descriptores de cámara 2.5D por plano, recortes `cropCallouts`, modificadores de énfasis/luz, transiciones entre planos (`flash-cut`, `whip-pan`, `portal-wipe`) y `BeatGrid` + compilador de Auto-SFX (`S2`, `S5`).

### Fase 2 — Biblioteca Atómica "Shotcraft Top 25" en `remotion/motion-kit/`
- Portar y parametrizar los 25 átomos más impactantes de las 10 categorías de `video-shotcraft` (`deck-deal-flyin`, `depth-layer-moves`, `spotlight-hero-card`, `spotlight-sweep-moves`, `type-and-filter`, `lead-word-zoom-assemble`, `marker-underline-title`, `chart-live-moves`, `integration-hub-map`, `outro-group-photo-launch`, etc.) validados con tests unitarios y de layout.

### Fase 3 — Motor Unificado `VidiauraEngine` en Remotion (16:9 y 9:16 + Soporte Google Flow)
- Unificar la calidad de `VidiauraShowcase` con la flexibilidad declarativa de `InteractiveSurfaceDemo` para que todo `SceneGraph` se renderice mediante slots matemáticos (`layout.ts`), primitivas de acabado (`Polish`/`Look`) y las 5 capas atómicas, eliminando el dashboard falso harcodeado cuando el usuario aporta capturas reales o elige átomos específicos.

### Fase 4 — Pipeline IA en 4 Etapas (`Creative Director v3` + `ShotRecipeRegistry`)
- Actualizar `src/lib/input-intelligence/` y `src/lib/ai/` para que Gemini extraiga recortes (`cropCallouts`) de capturas reales, planifique la curva de energía (`promo-energy-arc`), seleccione combinaciones del `ShotRecipeRegistry` y pase por el compilador determinista de layout, cámara y sonido.

### Fase 5 — Editor Visual de Planos ("Shotcraft Workbench" en `/editor`)
- Evolucionar el editor web para permitir cambiar la receta de cualquier plano con un clic (ej. alternar entre `depth-layer-moves`, `deck-deal-flyin` o `spotlight-sweep`), ajustar textos, puntos focales 2.5D, pista musical/BPM y exportar en MP4 con o sin BGM.

---

## 8. Seguridad, Licencias y Operación SaaS (Invariantes Vigentes)

1. **Seguridad de Secretos y Autorización:** `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y claves de pago viven exclusivamente en servidor/worker. Todas las tablas y buckets de Supabase aplican RLS por `auth.uid()`.
2. **Prohibición de Código No Confiable:** La IA nunca genera JSX/TSX/JS en runtime para el SaaS; devuelve exclusivamente JSON validado por `SceneGraphSchema`.
3. **Render Asíncrono:** Los renders MP4 se encolan (`POST /api/render` → HTTP 202) y se procesan fuera del hilo de petición HTTP.
4. **Licencias de Código y Audio:**
   - `video-shotcraft` tiene licencia **Apache 2.0** (compatible con uso comercial y adaptación de componentes).
   - La música y efectos de sonido incluidos en `public/sfx/` (y cualquier pista adicional de Mixkit o Freesound CC0) deben mantener sus licencias documentadas en `public/sfx/SFX_LICENSES.md`.
   - Verificar siempre la elegibilidad de licencia de **Remotion** (gratuita hasta 3 personas; plan *Remotion for Automators* cuando aplique a SaaS comercial de mayor escala).
