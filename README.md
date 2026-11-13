# ERAS — De las bestias a las estrellas (v0.2.0, prototipo)

RPG 2D de un solo jugador para el navegador. Empieza en el **Valle de los Ancestros** (era prehistórica) y está
preparado para crecer hacia la era industrial y la espacial.

Solo usa HTML5, CSS3, JavaScript y Canvas. **No hay nada que instalar**, ni servidor, ni Internet para jugar.
*(El título "ERAS" es provisional.)*

**Novedad v0.2.0:** texturas, sonidos e interfaz tomados de [BrowserQuest](https://github.com/mozilla/BrowserQuest) (Mozilla / Little Workshop).
La lógica del juego y el lore no han cambiado. **Lee el apartado 9 (licencias): hay que mantener la atribución.**

---

## 1. Cómo jugar

### Opción A — ZIP (sin instalar nada)
1. Descarga el ZIP y **descomprímelo** (clic derecho → *Extraer todo*; no abras `index.html` desde dentro del ZIP).
2. Abre la carpeta y haz doble clic en **`index.html`**.
3. Juega. También funciona desde un USB.

### Opción B — Web (GitHub Pages)
Abre la URL de tu repositorio (ver apartado 3).

### Controles
| Acción | Tecla |
|---|---|
| Moverse | **W A S D** o **flechas** |
| Interactuar / avanzar diálogo | **E** (también Espacio o Enter en los diálogos) |
| Pausa / cerrar menús o diálogos | **Esc** |

Prueba esto: habla con **Tala** (junto a la fogata de la aldea), sigue el camino al sureste hasta la **piedra grabada**
y acércate a los herbívoros para ver cómo huyen.

---

## 2. Guardado (importante con `file://`)

El juego guarda la partida en el propio navegador, sin cuentas ni Internet:

- **Siempre** en `localStorage`.
- **Además** en `IndexedDB`, si el navegador lo permite al abrir desde `file://` (si no responde en 1,5 s, se usa solo localStorage).
- Al cargar se usa la copia **más reciente** de las dos.
- Se guarda al crear partida, con **Guardar partida** (pausa), cada **30 s** (autoguardado, se puede desactivar en Ajustes),
  al **salir al menú** y cuando la pestaña pasa a segundo plano.
- Guarda: posición, dirección, vida, progreso (banderas de misión/objetivo) y tiempo de juego.
  Ajustes → pantalla muestra con qué sistema se está guardando.

**Diferencias entre navegadores y modos (léelo antes de fiarte del guardado):**

- El guardado es **por navegador y por equipo**. Otro navegador, otro usuario de Windows u otro ordenador no verá tu partida.
  En los ordenadores del centro, si el perfil se borra al cerrar sesión, **se pierde la partida**.
- Con `file://`, **Chrome/Edge comparten el almacenamiento entre todos los archivos locales** del mismo perfil
  (por eso las claves empiezan por `eras-rpg:`). Firefox y Safari tratan `file://` de forma distinta y a veces lo aíslan
  por archivo o carpeta: si **mueves o renombras la carpeta**, podrías no ver tu partida.
- La versión de **GitHub Pages y la del ZIP no comparten partida** (son orígenes distintos).
- En modo privado/incógnito el guardado puede no persistir. Si el navegador bloquea el almacenamiento, el juego lo avisa
  ("No se pudo guardar").
- **Lo comprobado:** Chrome 153 con `file://` (localStorage + IndexedDB funcionan). **No he probado** Firefox, Edge ni Safari.
- Copia de seguridad: no hay exportar/importar partida todavía (está en pendientes).

---

## 3. Publicar en GitHub Pages (sin instalar nada)

Todo se hace desde la web de GitHub, sin Git ni programas.

1. Entra en <https://github.com> → **New repository**. Nombre, por ejemplo, `eras-rpg`. Público. Crear.
2. En el repositorio: **Add file → Upload files**.
3. Descomprime el ZIP y arrastra **el contenido de la carpeta** (`index.html`, `css`, `js`, `assets`, `README.md`, `.nojekyll`)
   para que `index.html` quede **en la raíz** del repositorio. *(Si "Upload files" no deja arrastrar carpetas vacías, no pasa nada:
   `assets/` lleva archivos `.gitkeep`.)*
4. Pulsa **Commit changes**.
5. Ve a **Settings → Pages**. En *Build and deployment*: **Source = Deploy from a branch**, rama **main**, carpeta **/ (root)** → **Save**.
6. Espera 1–2 minutos. La URL será `https://TU_USUARIO.github.io/eras-rpg/`.

> No he podido publicarlo yo mismo desde aquí: los pasos son estándar, pero la publicación real depende de tu cuenta.
> El juego no usa rutas absolutas ni peticiones de red, así que no debería haber problemas con la subcarpeta `/eras-rpg/`.

## 4. Actualizar el juego

1. Edita los archivos (con el Bloc de notas, VS Code web, etc.).
2. **ZIP:** selecciona la carpeta → clic derecho → *Enviar a → Carpeta comprimida*.
3. **GitHub Pages:** en el repositorio, abre el archivo → icono del lápiz → edita → *Commit changes*,
   o *Add file → Upload files* para sustituir varios archivos. Tarda ~1 minuto; si ves la versión vieja, **Ctrl+F5**.
4. Si cambias la **estructura de lo guardado** (`SaveSystem.js` / `Game.serialize`), sube `SAVE.VERSION` en `config.js`
   y adapta `validate()` para no romper partidas antiguas.

---

## 5. Arquitectura (breve)

Scripts **clásicos** (sin `import`/`export`), todos cuelgan de un único objeto global `RPG`. El orden de carga está en `index.html`.
Datos dentro de `.js` (no hay `fetch` ni JSON externos).

```
index.html                 único punto de entrada
css/style.css              menús, diálogo, avisos (interfaz DOM) con el marco de piedra y la fuente de BrowserQuest
assets/
  images/bq/               hojas de BrowserQuest (terreno y objetos, personaje, aldeano, interfaz)
  audio/bq/                17 efectos de sonido (.ogg y .mp3)
  fonts/                   fuente pixelada GraphicPixel
  LICENSE-BrowserQuest.txt licencia del arte y los sonidos (CC-BY-SA 3.0)
js/
  config.js                constantes (tamaño de casilla, ajustes por defecto, claves de guardado)
  main.js                  arranque + pantalla de error si falta algún archivo
  data/                    DATOS, sin lógica
    valle.js               mapa del Valle (terreno, objetos, NPC, criaturas) — generado con semilla fija
    creatures.js           especies (velocidades, radios de detección…)
    atlas.js               recortes de la hoja de texturas + pixel art del herbívoro
    dialogues.js           textos y objetivo según el progreso
  core/
    Game.js                bucle y máquina de estados: menu / playing / dialogue / paused
    Input.js               teclado (WASD/flechas/E/Esc)
    Camera.js              cámara con seguimiento suave y límites
    Audio.js               efectos de sonido (ogg/mp3 según navegador; se puede silenciar en Ajustes)
  entities/
    Entity.js              base: posición en los PIES + caja de colisión
    Player.js · Creature.js · NPC.js
  world/
    Map.js                 rejilla de terreno y colisión con agua/bordes
    Objects.js             objetos estáticos (árboles, rocas, casas…)
    World.js               une todo; índice espacial de colisiones; lista de interactuables
  systems/
    CollisionSystem.js     movimiento por ejes separados (se desliza por las paredes)
    InteractionSystem.js   objeto más cercano + tecla E
    SaveSystem.js          IndexedDB + localStorage
  render/
    Renderer.js            terreno con tiles, orden por profundidad, ÚNICO punto de proyección mundo→pantalla
    Assets.js              carga de imágenes y fuente (si falla, el juego sigue con el respaldo)
    Sprites.js             dibujo procedural por código = RESPALDO si faltan las imágenes
    TexturePack.js         paquete de texturas BrowserQuest: terreno con bordes irregulares, objetos, personajes
  ui/
    HUD.js (canvas) · Dialogue.js (DOM) · Menu.js (DOM)
```

**Reglas que mantienen el proyecto ordenable:**
- La lógica no dibuja; el dibujo no decide lógica. Cambiar de perspectiva (p. ej. isométrica) implica tocar
  `Renderer.project()` y `Sprites.js`, no el resto.
- Las posiciones son los **pies** de la entidad; la colisión es solo la franja inferior (se pasa "por detrás" de árboles y casas).
- Añadir una criatura: nueva especie en `data/creatures.js` + ponerla en `valle.js`.
- Añadir una región: un nuevo `data/<region>.js` que devuelva el mismo formato que `RPG.buildValle()`.
- Cambiar el aspecto: todo el dibujo con imágenes está en `render/TexturePack.js` + `data/atlas.js`. Si no cargas `TexturePack.js`, vuelve el dibujo por código.
- Añadir un diálogo: entrada en `data/dialogues.js` + `interact: { dialogue: 'id', label, range }` en el objeto o NPC.

**Consola de depuración:** en el navegador, F12 → Consola → `RPG.game` da acceso al estado del juego.

---

## 6. Funcionalidades implementadas (v0.1.0 + v0.2.0)

- Menú principal: Nueva partida, Continuar partida, Ajustes, Créditos (todos funcionan).
- Ajustes: mostrar FPS, mostrar ayuda de controles, autoguardado, **sonido**, pantalla completa, borrar partida.
- **v0.2.0 · Aspecto BrowserQuest:** terreno con texturas y bordes irregulares entre hierba/camino/arena/agua, agua animada,
  árboles (roble y palmera), rocas, cabañas de madera, fogata animada, personaje y aldeano (Tala) animados, interfaz de piedra y barra de vida con corazón, fuente pixelada.
- **v0.2.0 · Sonido:** efectos al empezar/continuar partida, guardar, hablar con alguien, avanzar y cerrar diálogos, actualizar objetivo y pulsar botones.
- Personaje controlable (WASD/flechas), movimiento fluido, diagonales normalizadas, 4 direcciones visuales con animación de caminar.
- Colisiones con árboles, rocas, arbustos, casas, fogata, NPC, agua y límites del mapa.
- Mapa del Valle de los Ancestros de 64×48 casillas (2048×1536 px): hierba, hierba oscura, caminos, aldea con 4 chozas y fogata,
  estanque con orilla, árboles de 3 tipos, rocas, arbustos, flores, helechos, borde de árboles y un punto de interés (la piedra grabada).
- Cámara que sigue al jugador con suavizado y se detiene en los bordes.
- Interacción con **E**: indicador sobre el objeto + etiqueta inferior + diálogo con efecto de escritura.
  Interactuables: Tala (NPC), fogata, choza, piedra grabada.
- 5 herbívoros con IA: paseo, detección de proximidad (120 px) y huida (hasta 190 px), esquivan obstáculos.
- Interfaz: nombre, barra de vida, zona y objetivo actual, indicador de interacción, avisos, menú de pausa.
- Progreso inicial real: banderas `talkedToElder` y `foundStone` que cambian el objetivo y los diálogos.
- Guardado/carga como se describe en el apartado 2.
- Se adapta a cualquier tamaño de ventana (16:9) y a pantallas de alta densidad.

## 7. Pendiente (a propósito, no está en v0.1)

- **Vida:** se muestra y se guarda, pero **nada la reduce todavía** (no hay combate ni daño). La fogata no cura por la misma razón.
- Combate (tab-target u otro), depredadores, habilidades, botín.
- Inventario, recolección, fabricación, equipamiento, economía.
- Misiones como sistema (ahora solo hay un objetivo derivado de banderas).
- Creación de personaje, clases, experiencia y niveles.
- Las otras cuatro regiones (Selva Profunda, Costa Perdida, Pantano Antiguo, Cueva del Coloso) y cambio de mapa.
- Música: el repositorio de BrowserQuest que se usó **no incluye archivos de música**, solo efectos. Tampoco hay pasos ni sonidos de criaturas.
- El arte de BrowserQuest es medieval/moderno (el personaje y Tala llevan ropa de aldeano). Encaja visualmente pero **no es prehistórico**: más adelante conviene recolorearlos o sustituirlos (p. ej. piel y cuero).
- No hay arte de BrowserQuest para dinosaurios: el herbívoro es pixel art propio (`data/atlas.js`).
- Las criaturas no guardan su posición (reaparecen en su origen al cargar).
- Exportar/importar partida a un archivo (útil para los ordenadores del centro).
- Controles táctiles / mando.
- Eras industrial y espacial.

## 8. Qué se probó

**v0.2.0** (Chromium con Playwright, `index.html` abierto por `file://`): 49 comprobaciones correctas — carga sin errores ni peticiones de red,
menú/ajustes/créditos, movimiento con teclas reales, colisiones, cámara, los 4 interactuables y sus diálogos, huida y paseo de criaturas, pausa,
guardar y continuar tras recargar, confirmación al sobrescribir, ajuste de sonido (y que se recuerda), arranque con respaldo cuando se borran las imágenes,
y revisión visual con capturas. **No he podido oír el audio** (solo comprobar que el navegador lo reproduce). 60 FPS en Chromium sin GPU.

**v0.1.0** (anteriores): pruebas automáticas en **Chrome 153** abriendo `index.html` por `file://` (62 comprobaciones, todas correctas):
carga sin errores, menús y botones, movimiento con teclas reales, colisiones (árbol, agua, bordes, 20 000 fotogramas de paseo
aleatorio sin atravesar nada), conectividad del mapa (todo el terreno libre y los puntos clave son alcanzables), cámara,
interacción y diálogos, criaturas (paseo, huida, no atraviesan obstáculos), pausa, guardar/continuar tras recargar,
guardado corrupto, posición guardada inválida, confirmación de nueva partida, borrado, autoguardado y ausencia total de peticiones de red externas.

**No probado:** Firefox, Edge, Safari, móviles, ni la publicación real en GitHub Pages. Los chequeos de v0.1.0 no se han repetido en v0.2.0 salvo los indicados arriba.

---

## 9. Licencias y créditos (importante)

- **Arte, sonidos e interfaz** (`assets/images/bq`, `assets/audio/bq`, y la fuente de `assets/fonts`) proceden de **BrowserQuest**,
  © Little Workshop (Franck Lecollinet y Guillaume Lecollinet) para Mozilla. Licencia **CC-BY-SA 3.0**: puedes usarlos y modificarlos, incluso en un juego propio,
  pero **debes citar la autoría** (ya está en *Créditos* del juego) y **compartir igual** las modificaciones de ese arte/sonido con la misma licencia.
  Texto completo en `assets/LICENSE-BrowserQuest.txt` (conserva ese archivo y los créditos al publicar).
- Las imágenes se usan tal cual (recortes de sus hojas); no se han editado los archivos.
- El código de este proyecto es propio y no incluye código de BrowserQuest (que es MPL 2.0). El herbívoro es dibujo propio.
- Esto es una explicación práctica, no asesoramiento legal.
