# Laboratorio Virtual de Métodos Numéricos

Aplicación web educativa, interactiva y con experiencia cinematográfica para la materia
**Métodos Numéricos** (Ingeniería en Mecatrónica). El usuario comienza en el espacio, inicia el
evento, viaja hacia la luna, elige la **Unidad 2** y trabaja en un laboratorio virtual con cuatro
métodos para encontrar raíces: **Regla Falsa**, **Newton-Raphson**, **Secante** y **Punto Fijo**.

Todo el cálculo es real: cada tabla, gráfica, animación, análisis y reporte se genera con los datos
que el usuario introduce. No hay resultados simulados, tablas pregrabadas ni gráficas decorativas.

> **Nota:** el método de Bisección **no** forma parte del proyecto (así lo pide el enunciado de la
> materia); por eso no aparece en el menú, en las tarjetas, en las calculadoras ni en el reporte.

## Características

- **Pantalla inicial cinematográfica** con materia, autor y un único botón, sobre un fondo espacial
  animado (estrellas, nebulosas y partículas en movimiento).
- **Secuencias espaciales**: despegue de una nave con descenso a la luna y, al entrar a la Unidad 2,
  una transición hacia la **Tierra 3D**. Se pueden **saltar con cualquier tecla** o con el botón
  *Saltar secuencia*, y se omiten si el sistema pide *movimiento reducido*.
- **Laboratorio por método** con: fundamento teórico, fórmula y procedimiento, datos de entrada,
  cálculo paso a paso, tabla de iteraciones, gráfica interactiva, evolución del error, análisis de
  convergencia y reporte listo para imprimir o guardar como PDF.
- **Ejemplo en la vida real animado** en cada método (banco de equilibrio, resorte precargado, banco
  de calibración y tanque de recirculación) que se mueve con los valores reales calculados.
- **Barra superior fija** en el laboratorio con los controles de iteración (Primera, Anterior,
  Siguiente, Reproducir, Pausar, Reiniciar y deslizador 0–100 %) y una **línea de puntos** que marca
  el tema en el que estás y permite saltar a cualquier sección.
- **Audio opcional** sintetizado con Web Audio API: efectos de inicio, transición, unidad, método,
  cálculo, iteración, convergencia y error, con la preferencia guardada en el navegador.
- **Diseño adaptable** a computadora, laptop, tableta y celular, con componentes accesibles
  (etiquetas asociadas, foco visible, botones reales y navegación por teclado).

## Métodos incluidos

| Código | Método | Tipo | Fórmula |
| ------ | ------ | ---- | ------- |
| 01 | Regla Falsa (Falsa Posición) | Cerrado | `xr = b − f(b)·(b − a) / (f(b) − f(a))` |
| 02 | Newton-Raphson | Abierto | `xn+1 = xn − f(xn) / f'(xn)` |
| 03 | Secante | Abierto | `xn+1 = xn − f(xn)·(xn − xn-1) / (f(xn) − f(xn-1))` |
| 04 | Punto Fijo | Iterativo | `xn+1 = g(xn)` |

El parser de expresiones matemáticas (propio, sin `eval()`) acepta `x^2`, `2*x`, `sin(x)`, `cos(x)`,
`tan(x)`, `sqrt(x)`, `abs(x)`, `ln(x)`, `log(x)`, `exp(x)` y las constantes `PI` y `E`.

---

## Requisitos (programas necesarios)

No hay que instalar bibliotecas a mano: **todas se instalan con un solo comando** (`npm install`).
Lo único que debe estar instalado en tu computadora es:

| Programa | Versión mínima | Para qué sirve | Cómo comprobarlo |
| -------- | -------------- | -------------- | ---------------- |
| **Node.js** | 20 LTS (recomendado 22 o superior) | Ejecutar Vite, TypeScript y el servidor de desarrollo | `node -v` |
| **npm** | 10 (viene incluido con Node.js) | Instalar dependencias y ejecutar los comandos | `npm -v` |
| **Git** (opcional) | cualquiera reciente | Clonar el repositorio | `git --version` |
| **Navegador moderno** | Chrome, Edge, Firefox o Safari actuales | Ver la aplicación | — |

Node.js se descarga desde <https://nodejs.org> eligiendo la versión **LTS**. En Windows el instalador
ya incluye npm; en macOS y Linux puedes usar el instalador oficial o un gestor como `nvm`.

## Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/MigMatos/metodos-numericos-im.git
cd metodos-numericos-im

# 2. Instala todas las dependencias del monorepo (raíz, apps/web y packages/ui)
npm install
```

Este proyecto es un **monorepo con npm workspaces y Turborepo**: con un único `npm install` en la
raíz se instalan las dependencias tanto de la aplicación (`apps/web`) como de la librería de
componentes (`packages/ui`). No es necesario entrar carpeta por carpeta.

> Si npm muestra un aviso sobre `allow-scripts`, es informativo (npm 11 revisa los scripts de
> instalación de los paquetes). La instalación se completa correctamente.

## Comandos disponibles

Todos se ejecutan **desde la raíz del proyecto**:

| Comando | Qué hace |
| ------- | -------- |
| `npm run dev` | Levanta la aplicación en modo desarrollo con recarga automática |
| `npm run build` | Compila la versión de producción en `apps/web/dist` |
| `npm run preview --workspace web` | Sirve el build de producción en local para probarlo |
| `npm run lint` | Revisa el código con ESLint |
| `npm run format` | Aplica formato con Prettier a los archivos `.ts` y `.tsx` |
| `npm run typecheck` | Comprueba los tipos con TypeScript |

### Ejecutar en desarrollo

```bash
npm run dev
```

La consola indica la dirección local, normalmente <http://localhost:5173>. Abre esa dirección en el
navegador. Si el puerto está ocupado, Vite usará el siguiente libre (por ejemplo 5174) y lo mostrará
en la consola.

### Compilar y probar la versión de producción

```bash
npm run build                      # genera apps/web/dist
npm run preview --workspace web    # sirve ese build para probarlo en local
```

La carpeta `apps/web/dist` es **estática**: puedes subirla tal cual a cualquier hosting (GitHub Pages,
Netlify, Vercel, Apache, Nginx, un servidor propio, etc.).

> **Si lo publicas en una subcarpeta** (por ejemplo `usuario.github.io/metodos-numericos-im/`),
> añade `base: "/metodos-numericos-im/"` en `apps/web/vite.config.ts` antes de compilar, para que los
> archivos JS, CSS y las fuentes se carguen con la ruta correcta.

---

## Estructura del proyecto

```text
metodos-numericos/
├── apps/
│   └── web/                          # Aplicación (Vite + React + TypeScript)
│       ├── index.html                # Título de la pestaña, idioma y color de fondo
│       └── src/
│           ├── App.tsx               # Pantallas y transiciones (máquina de estados)
│           ├── components/
│           │   ├── presentation-screen.tsx  # Pantalla inicial
│           │   ├── units-menu.tsx           # Menú de unidades
│           │   ├── unit-two-screen.tsx      # Los 4 métodos de la Unidad 2
│           │   ├── audio-toggle.tsx         # Botón de activar/desactivar audio
│           │   ├── cosmos/                  # Escenas: estrellas, nave, luna y Tierra
│           │   ├── charts/                  # Gráficas dibujadas en canvas
│           │   └── method-lab/              # Laboratorio de cada método
│           ├── hooks/                # Hooks reutilizables (canvas, sección activa, etc.)
│           └── lib/
│               ├── site-config.ts    # Textos, materia, alumno, carrera y unidades
│               ├── audio.ts          # Sonidos sintetizados
│               ├── report-html.ts    # Reporte para imprimir / guardar en PDF
│               ├── scene-math.ts     # Utilidades de interpolación y aleatoriedad con semilla
│               └── numerical/        # Algoritmos, parser, formato y catálogo de métodos
├── packages/
│   └── ui/                           # Componentes shadcn/Base UI y tema (globals.css)
├── package.json                      # Comandos del monorrepo
└── turbo.json                        # Orquestación de Vite y TypeScript
```

## Dónde modificar los valores

### 1. Datos de la materia, textos y unidades → `apps/web/src/lib/site-config.ts`

Es el archivo pensado para editar **sin tocar componentes**. Ahí se define:

```ts
export const SITE_CONFIG = {
  subject: "Métodos Numéricos",
  subjectDisplay: "MÉTODOS NUMÉRICOS",
  student: "Fernando Ivan Manrique Aguilar",   // se usa también en el reporte PDF
  career: "Ingeniería en Mecatrónica",
  presentation: {
    lead: "...",          // frase principal de la pantalla inicial
    extra: "...",         // texto adicional
    ctaLabel: "INICIAR EVENTO",
    hint: "...",          // ayuda debajo del botón
  },
  unitsMenu: { title: "...", subtitle: "...", backLabel: "VOLVER AL INICIO" },
  unitTwo: { label: "UNIDAD 2", title: "...", subtitle: "...", ctaLabel: "ABRIR LABORATORIO" },
  units: [ /* tarjetas del menú: label, title, detail, available */ ],
}
```

- Cambia `student`, `career` o `subject` y toda la aplicación (incluido el reporte) se actualiza.
- En `units`, la tarjeta con `available: true` abre la Unidad 2; las que tienen `available: false`
  se muestran como *Contenido en desarrollo* junto con su `detail`.

### 2. Métodos, fórmulas y valores por defecto → `apps/web/src/lib/numerical/methods-config.ts`

Cada método declara: `code`, `name`, `subtitle`, `kind`, `description`, `formula`, `procedure`,
`reportFileName`, los `inputs` (con `label`, `hint`, `placeholder` y **`defaultValue`**), las
`columns` de la tabla y los bloques de `theory` (fundamento). Para cambiar, por ejemplo, los datos
que aparecen al abrir Regla Falsa, edita `defaultValue` de `function`, `a`, `b` y `tolerance`.
`TOLERANCE_INPUT` y `MAX_ITERATIONS_INPUT` se comparten entre todos los métodos.

### 3. Algoritmos y criterios de parada → `apps/web/src/lib/numerical/*.ts`

- `regla-falsa.ts`, `newton-raphson.ts`, `secante.ts`, `punto-fijo.ts`: el cálculo puro de cada
  método (máximo de iteraciones, detección de divergencia y mensajes de error).
- `expression.ts`: el parser de `f(x)` (funciones y constantes permitidas).
- `format.ts`: cuántos decimales se muestran (`formatCompact`, `formatPercent`).
- `analysis.ts`: los textos de la explicación por iteración y del análisis de convergencia.

### 4. Ejemplos de la vida real → `apps/web/src/lib/numerical/method-applications.ts`

Cada método tiene su escenario: `title`, `instrument`, `scenario`, `quantity` (qué representa `x`),
`goal` (qué significa `f(x) = 0`), `settledLabel` y `pendingLabel`. En el mismo archivo están las
frases que se redactan automáticamente con los valores reales de cada iteración.

### 5. Colores, fuentes y animaciones → `packages/ui/src/styles/globals.css`

- Paleta espacial: tokens `--color-space-deep`, `--color-space-surface`, `--color-space-cyan`,
  `--color-space-violet` y `--color-space-amber`.
- Tipografías auto-hospedadas: `@import "@fontsource-variable/geist"` (texto) y `space-grotesk`
  (títulos). Cambiando esos imports y el token `--font-display` cambia toda la tipografía; al venir de
  paquetes de npm, las fuentes viajan con el proyecto y no dependen del sistema operativo.
- Animaciones: tokens `--animate-*` con sus `@keyframes` (entrada de pantalla, disolución, flotación,
  línea de escaneo, deriva de nebulosas…).

### 6. Escenas espaciales → `apps/web/src/components/cosmos/`

- `starfield.tsx`: cantidad, tamaño y brillo de las estrellas del fondo.
- `launch-sequence.tsx`: `FLIGHT_DURATION` (duración del despegue, en milisegundos) y la nave.
- `warp-to-earth.tsx`: `WARP_DURATION` (duración de la transición hacia la Tierra).
- `space-palette.ts`: colores usados dentro de los canvas.
- `earth-render.ts` y `moon-render.ts`: continentes, cráteres, iluminación y atmósfera.

### 7. Sonidos → `apps/web/src/lib/audio.ts`

En `RECIPES` se define, para cada evento (`init`, `transition`, `unit`, `method`, `calculate`,
`iteration`, `convergence`, `error`), su frecuencia, duración, tipo de onda y volumen; las
`AMBIENT_FREQUENCIES` forman el fondo ambiental. La preferencia del usuario se guarda en
`localStorage` con la clave `metodos-numericos:audio`.

### 8. Reporte PDF → `apps/web/src/lib/report-html.ts`

Estructura y estilos de las secciones del reporte (datos de entrada, fórmula y procedimiento,
resultado, tabla completa, gráfica, aplicación en la vida real, análisis y conclusión). El nombre del
archivo sale de `reportFileName` en `methods-config.ts`.

### 9. Título de la pestaña y metadatos → `apps/web/index.html`

`<title>`, idioma (`lang`), descripción y `theme-color`.

---

## Cómo se usa la aplicación

1. **Pantalla inicial**: muestra la materia, el autor y el botón **INICIAR EVENTO**.
2. **Secuencia de despegue**: la nave atraviesa el espacio y desciende a la luna. Se puede saltar con
   cualquier tecla o con el botón *Saltar secuencia*.
3. **Menú de unidades**: la **UNIDAD 2** aparece como *Disponible*; las demás se ven como
   *Contenido en desarrollo*. El botón *VOLVER AL INICIO* regresa sin recargar la página.
4. **Transición a la Tierra** y **menú de métodos**: cuatro tarjetas, cada una con el botón
   **ABRIR LABORATORIO**.
5. **Laboratorio del método**:
   - *Fundamento*, *Fórmula y procedimiento* y *Datos de entrada*.
   - **EJEMPLO EN LA VIDA REAL**: el banco animado correspondiente. Antes de calcular se muestra en
     **modo demostración** (sin números) y, al presionar **CALCULAR**, se anima con tus datos y
     muestra las lecturas, la raíz y el estado del banco.
   - *Iteraciones* (tabla), *Gráfica*, *Resultados y análisis* y *Reporte*.
   - La **barra superior** permanece fija mientras te desplazas: a la izquierda el botón *Métodos* y,
     a la derecha, los **puntos de progreso** (cada punto es un tema y puedes hacer clic en él para
     saltar). Al calcular, debajo aparecen los **controles de iteración** (Primera, Anterior,
     Siguiente, Reproducir, Pausar, Reiniciar y el deslizador 0–100 %).
6. **Reporte**: el botón *GENERAR REPORTE* abre el diálogo de impresión con el reporte completo; en
   el navegador elige *Guardar como PDF* para obtener, por ejemplo, `reporte-regla-falsa.pdf`.
7. **Audio**: el botón flotante abajo a la derecha activa o desactiva los sonidos; por políticas del
   navegador solo empieza después de que hagas clic.

### Agregar un método nuevo (resumen)

1. Crea el cálculo puro en `apps/web/src/lib/numerical/mi-metodo.ts` (función que devuelve las
   iteraciones y el estado).
2. Añade el tipo de iteración en `lib/numerical/types.ts` y su entrada en
   `lib/numerical/methods-config.ts` (nombre, fórmula, entradas, columnas y teoría).
3. Conéctalo en `lib/numerical/method-runner.ts` (una rama por método).
4. Opcional: define su ejemplo real en `method-applications.ts` y su dibujo en
   `components/method-lab/application-diagram.tsx`.

El resto de la interfaz (tarjetas, tabla, gráfica, análisis y reporte) funciona automáticamente
porque se genera a partir de esa configuración.

## Solución de problemas

| Síntoma | Causa y solución |
| ------- | ---------------- |
| `npm install` muestra un aviso sobre `allow-scripts` | Es informativo de npm 11; la instalación termina bien |
| El puerto 5173 está ocupado | Vite usa el siguiente puerto libre; mira la URL que imprime la consola |
| No se ve ningún sonido | El audio arranca solo tras un clic (política de autoplay del navegador): pulsa el botón de audio |
| Las animaciones no aparecen | El sistema tiene activado *reducir movimiento* (`prefers-reduced-motion`); la app lo respeta y va directo al contenido |
| Las fuentes se ven distintas al abrir el proyecto en otra PC | No debería ocurrir: Geist y Space Grotesk se instalan desde npm y se compilan a `dist/assets/*.woff2`; ejecuta `npm install` |
| El PDF sale sin la gráfica | Espera a que termine el cálculo y presiona *GENERAR REPORTE* (la gráfica se toma del canvas ya dibujado) |

## Tecnologías

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS 4** con tokens de tema propios
- **shadcn/ui** sobre **Base UI** (componentes en `packages/ui`)
- **Turborepo** + **npm workspaces** (monorrepo)
- **Canvas 2D** para escenas y gráficas, **Web Audio API** para el sonido
- Fuentes auto-hospedadas con **Fontsource**

## Autor y licencia

- **Materia:** Métodos Numéricos — **Carrera:** Ingeniería en Mecatrónica
- **Autor:** Fernando Ivan Manrique Aguilar
- **Licencia:** Apache 2.0 (ver el archivo [`LICENSE`](./LICENSE))