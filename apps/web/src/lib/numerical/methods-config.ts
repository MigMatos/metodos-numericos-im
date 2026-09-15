import type { MethodId } from "./types"

export type MethodInputKind = "expression" | "number"

export type MethodInputKey =
  | "function"
  | "derivative"
  | "a"
  | "b"
  | "x0"
  | "x1"
  | "tolerance"
  | "maxIterations"

export type MethodInput = {
  key: MethodInputKey
  label: string
  hint: string
  placeholder: string
  defaultValue: string
  kind: MethodInputKind
}

export type MethodColumn = {
  key: string
  label: string
  format: "decimal" | "compact" | "percent"
}

export type TheoryBlock = {
  title: string
  content: string
}

export type MethodConfig = {
  id: MethodId
  code: string
  name: string
  subtitle: string
  kind: string
  description: string
  formula: string
  procedure: string[]
  reportFileName: string
  inputs: MethodInput[]
  columns: MethodColumn[]
  theory: TheoryBlock[]
}

export const TOLERANCE_INPUT: MethodInput = {
  key: "tolerance",
  label: "Tolerancia",
  hint: "Criterio de parada: |error| ≤ tolerancia",
  placeholder: "0.0001",
  defaultValue: "0.0001",
  kind: "number",
}

export const MAX_ITERATIONS_INPUT: MethodInput = {
  key: "maxIterations",
  label: "Máximo de iteraciones",
  hint: "Límite de seguridad del cálculo",
  placeholder: "50",
  defaultValue: "50",
  kind: "number",
}

export const REGLA_FALSA: MethodConfig = {
  id: "regla-falsa",
  code: "01",
  name: "Regla Falsa",
  subtitle: "Falsa Posición",
  kind: "Método cerrado",
  description:
    "Método cerrado que trabaja sobre un intervalo y aproxima la raíz mediante interpolación lineal.",
  formula: "xr = b − f(b)·(b − a) / (f(b) − f(a))",
  procedure: [
    "Evaluar f(a) y f(b) en los extremos del intervalo.",
    "Comprobar que existe cambio de signo: f(a)·f(b) < 0.",
    "Calcular xr interpolando linealmente entre (a, f(a)) y (b, f(b)).",
    "Evaluar f(xr) y actualizar el intervalo: si f(a)·f(xr) < 0 el extremo derecho pasa a ser xr; si no, el izquierdo pasa a ser xr.",
    "Calcular el error absoluto |xr − xr anterior| y su error porcentual.",
    "Repetir hasta que el error sea menor o igual que la tolerancia.",
  ],
  reportFileName: "reporte-regla-falsa",
  inputs: [
    {
      key: "function",
      label: "f(x)",
      hint: "Función a la que se busca la raíz",
      placeholder: "x^2 - 4",
      defaultValue: "x^2 - 4",
      kind: "expression",
    },
    {
      key: "a",
      label: "a",
      hint: "Extremo izquierdo del intervalo",
      placeholder: "1",
      defaultValue: "1",
      kind: "number",
    },
    {
      key: "b",
      label: "b",
      hint: "Extremo derecho del intervalo",
      placeholder: "3",
      defaultValue: "3",
      kind: "number",
    },
    TOLERANCE_INPUT,
    MAX_ITERATIONS_INPUT,
  ],
  columns: [
    { key: "iteration", label: "Iteración", format: "decimal" },
    { key: "a", label: "a", format: "compact" },
    { key: "b", label: "b", format: "compact" },
    { key: "fa", label: "f(a)", format: "compact" },
    { key: "fb", label: "f(b)", format: "compact" },
    { key: "xr", label: "xr", format: "compact" },
    { key: "fxr", label: "f(xr)", format: "compact" },
    { key: "error", label: "Error absoluto", format: "compact" },
    { key: "errorPercent", label: "Error %", format: "percent" },
  ],
  theory: [
    {
      title: "¿Qué es?",
      content:
        "Es un método que sustituye la curva por la recta que une los puntos (a, f(a)) y (b, f(b)). El corte de esa recta con el eje X se toma como aproximación de la raíz.",
    },
    {
      title: "¿Para qué sirve?",
      content:
        "Para aproximar la raíz de f(x) = 0 cuando se conoce un intervalo donde la función cambia de signo, incluso si la función es difícil de derivar.",
    },
    {
      title: "¿Por qué se llama falsa posición?",
      content:
        "Porque la recta ocupa una posición falsa de la curva: se cruza con el eje X en un punto que se usa como si fuera la raíz, aunque todavía es solo una aproximación.",
    },
    {
      title: "¿Qué significa método cerrado?",
      content:
        "Que la raíz queda atrapada dentro de un intervalo. En cada iteración el intervalo se reduce y la raíz permanece en su interior, así que el método no puede escapar de la zona de la solución.",
    },
    {
      title: "¿Qué condiciones necesita?",
      content:
        "Que f sea continua en [a, b] y que exista cambio de signo: f(a)·f(b) < 0. Si el producto es positivo no se puede garantizar la existencia de la raíz en ese intervalo.",
    },
    {
      title: "¿Cómo funciona?",
      content:
        "Calcula xr con la fórmula de interpolación y reemplaza el extremo cuyo signo coincide con el de f(xr). El intervalo se estrecha y la aproximación avanza hacia la raíz.",
    },
    {
      title: "¿Cómo converge?",
      content:
        "Converge siempre que exista el cambio de signo, pero de forma lineal: el error baja de manera sostenida, aunque más despacio que en Newton-Raphson.",
    },
    {
      title: "Ventajas",
      content:
        "Nunca se sale del intervalo inicial, no necesita la derivada y garantiza la convergencia con el cambio de signo.",
    },
    {
      title: "Desventajas",
      content:
        "Es más lento que los métodos abiertos y si un extremo se estanca el avance puede volverse muy lento.",
    },
  ],
}

export const NEWTON_RAPHSON: MethodConfig = {
  id: "newton-raphson",
  code: "02",
  name: "Newton-Raphson",
  subtitle: "Método de la tangente",
  kind: "Método abierto",
  description:
    "Método abierto que utiliza la derivada de la función para generar aproximaciones sucesivas.",
  formula: "xn+1 = xn − f(xn) / f'(xn)",
  procedure: [
    "Partir de una aproximación inicial x0.",
    "Calcular f(xn) y f'(xn) en la aproximación actual.",
    "Comprobar que f'(xn) ≠ 0; si la derivada es cero el método no puede continuar.",
    "Calcular xn+1 = xn − f(xn)/f'(xn).",
    "Calcular el error absoluto |xn+1 − xn| y el error porcentual.",
    "Repetir hasta que el error sea menor o igual que la tolerancia.",
  ],
  reportFileName: "reporte-newton-raphson",
  inputs: [
    {
      key: "function",
      label: "f(x)",
      hint: "Función a la que se busca la raíz",
      placeholder: "x^2 - 4",
      defaultValue: "x^2 - 4",
      kind: "expression",
    },
    {
      key: "derivative",
      label: "f'(x)",
      hint: "Derivada de la función",
      placeholder: "2*x",
      defaultValue: "2*x",
      kind: "expression",
    },
    {
      key: "x0",
      label: "x0",
      hint: "Aproximación inicial",
      placeholder: "3",
      defaultValue: "3",
      kind: "number",
    },
    TOLERANCE_INPUT,
    MAX_ITERATIONS_INPUT,
  ],
  columns: [
    { key: "iteration", label: "Iteración", format: "decimal" },
    { key: "xn", label: "xn", format: "compact" },
    { key: "fxn", label: "f(xn)", format: "compact" },
    { key: "dfxn", label: "f'(xn)", format: "compact" },
    { key: "xnNext", label: "xn+1", format: "compact" },
    { key: "error", label: "Error", format: "compact" },
    { key: "errorPercent", label: "Error %", format: "percent" },
  ],
  theory: [
    {
      title: "¿Qué es?",
      content:
        "Es un método abierto que traza la recta tangente a la curva en el punto actual y toma como nueva aproximación el punto donde esa tangente corta el eje X.",
    },
    {
      title: "¿Para qué sirve?",
      content:
        "Para encontrar raíces con muy pocas iteraciones cuando se dispone de la derivada de la función y de una aproximación inicial cercana a la raíz.",
    },
    {
      title: "¿Qué significa método abierto?",
      content:
        "Que no se trabaja con un intervalo que contenga la raíz: el método avanza solo con el punto actual, por lo que puede converger muy rápido o alejarse si el punto inicial es malo.",
    },
    {
      title: "¿Qué condiciones necesita?",
      content:
        "La función debe ser derivable, la derivada no puede ser cero en la aproximación actual y x0 debe estar suficientemente cerca de la raíz.",
    },
    {
      title: "¿Cómo converge?",
      content:
        "Con convergencia cuadrática: aproximadamente el número de cifras correctas se duplica en cada iteración cuando la aproximación inicial es adecuada.",
    },
    {
      title: "Ventajas",
      content:
        "Converge muy rápido, necesita pocas iteraciones y su fórmula es simple de implementar.",
    },
    {
      title: "Desventajas",
      content:
        "Requiere la derivada, falla si f'(xn) = 0 y no garantiza encontrar la raíz cuando el punto inicial está lejos.",
    },
  ],
}

export const SECANTE: MethodConfig = {
  id: "secante",
  code: "03",
  name: "Secante",
  subtitle: "Método de la recta secante",
  kind: "Método abierto",
  description:
    "Método abierto que utiliza dos aproximaciones para construir una recta secante y obtener la siguiente.",
  formula: "xn+1 = xn - [ f(xn)·(xn - xn-1) ] / [ f(xn) - f(xn-1) ]",
  procedure: [
    "Evaluar f(x0) y f(x1) en las dos aproximaciones iniciales.",
    "Comprobar que el denominador f(xn) - f(xn-1) no sea cero.",
    "Calcular x2 con la fórmula de la secante.",
    "Calcular el error absoluto |xn+1 - xn|.",
    "Desplazar las aproximaciones: xn-1 pasa a ser xn y xn pasa a ser xn+1.",
    "Repetir hasta que el error sea menor o igual que la tolerancia.",
  ],
  reportFileName: "reporte-secante",
  inputs: [
    {
      key: "function",
      label: "f(x)",
      hint: "Función a la que se busca la raíz",
      placeholder: "x^2 - 4",
      defaultValue: "x^2 - 4",
      kind: "expression",
    },
    {
      key: "x0",
      label: "x0",
      hint: "Primera aproximación",
      placeholder: "1",
      defaultValue: "1",
      kind: "number",
    },
    {
      key: "x1",
      label: "x1",
      hint: "Segunda aproximación",
      placeholder: "3",
      defaultValue: "3",
      kind: "number",
    },
    TOLERANCE_INPUT,
    MAX_ITERATIONS_INPUT,
  ],
  columns: [
    { key: "iteration", label: "Iteración", format: "decimal" },
    { key: "previous", label: "xn-1", format: "compact" },
    { key: "current", label: "xn", format: "compact" },
    { key: "fPrevious", label: "f(xn-1)", format: "compact" },
    { key: "fCurrent", label: "f(xn)", format: "compact" },
    { key: "next", label: "xn+1", format: "compact" },
    { key: "error", label: "Error", format: "compact" },
    { key: "errorPercent", label: "Error %", format: "percent" },
  ],
  theory: [
    {
      title: "¿Qué es?",
      content:
        "Es un método que aproxima la derivada con la recta secante que pasa por las dos últimas aproximaciones y usa su corte con el eje X como nueva aproximación.",
    },
    {
      title: "¿Para qué sirve?",
      content:
        "Para encontrar raíces sin calcular la derivada analítica: la secante entre dos puntos hace el papel de la tangente.",
    },
    {
      title: "¿Qué significa método abierto?",
      content:
        "Que no se exige un intervalo con cambio de signo: basta con dos aproximaciones iniciales, por lo que puede converger rápido o divergir si los puntos son inadecuados.",
    },
    {
      title: "¿Qué condiciones necesita?",
      content:
        "Que la función sea continua en el entorno de trabajo, que f(xn) - f(xn-1) no sea cero y que las aproximaciones iniciales estén cerca de la raíz.",
    },
    {
      title: "¿Cómo converge?",
      content:
        "Su orden de convergencia es aproximadamente 1.618 (el número áureo): más rápido que la regla falsa y algo más lento que Newton-Raphson.",
    },
    {
      title: "Ventajas",
      content:
        "No requiere la derivada analítica, converge más rápido que los métodos cerrados y necesita pocas evaluaciones por iteración.",
    },
    {
      title: "Desventajas",
      content:
        "No garantiza la convergencia, falla si el denominador es cero y puede ser inestable cuando las evaluaciones están muy próximas entre sí.",
    },
  ],
}
export const PUNTO_FIJO: MethodConfig = {
  id: "punto-fijo",
  code: "04",
  name: "Punto Fijo",
  subtitle: "Iteración de punto fijo",
  kind: "Método iterativo",
  description:
    "Método iterativo que transforma f(x) = 0 en x = g(x) y busca el punto fijo de g mediante iteraciones sucesivas.",
  formula: "xn+1 = g(xn)",
  procedure: [
    "Transformar la ecuación f(x) = 0 en la forma x = g(x).",
    "Partir de una aproximación inicial x0.",
    "Evaluar xn+1 = g(xn) en cada iteración.",
    "Calcular el error absoluto |xn+1 - xn| y su error porcentual cuando sea posible.",
    "Continuar hasta que el error sea menor o igual que la tolerancia.",
    "Si el error crece de forma sostenida, el método no está convergiendo.",
  ],
  reportFileName: "reporte-punto-fijo",
  inputs: [
    {
      key: "function",
      label: "g(x)",
      hint: "Función de iteración despejada de f(x) = 0",
      placeholder: "cos(x)",
      defaultValue: "cos(x)",
      kind: "expression",
    },
    {
      key: "x0",
      label: "x0",
      hint: "Aproximación inicial",
      placeholder: "0.5",
      defaultValue: "0.5",
      kind: "number",
    },
    TOLERANCE_INPUT,
    MAX_ITERATIONS_INPUT,
  ],
  columns: [
    { key: "iteration", label: "Iteración", format: "decimal" },
    { key: "xn", label: "xn", format: "compact" },
    { key: "gxn", label: "g(xn)", format: "compact" },
    { key: "xnNext", label: "xn+1", format: "compact" },
    { key: "error", label: "Error", format: "compact" },
    { key: "errorPercent", label: "Error %", format: "percent" },
  ],
  theory: [
    {
      title: "¿Qué es?",
      content:
        "Es un método iterativo que busca un punto fijo: un valor x que cumple x = g(x). Si la ecuación f(x) = 0 se reescribe de esa forma, el punto fijo es también la raíz buscada.",
    },
    {
      title: "¿Para qué sirve?",
      content:
        "Para resolver ecuaciones que se pueden despejar en la forma x = g(x), aprovechando que la iteración se reduce a evaluar la función una y otra vez.",
    },
    {
      title: "Fundamento",
      content:
        "Cuando el error |xn+1 - xn| tiende a cero, la sucesión se estabiliza y el valor obtenido cumple xn+1 = g(xn), es decir, es el punto fijo de la función.",
    },
    {
      title: "¿Qué condiciones necesita?",
      content:
        "Que g sea continua y que |g'(x)| < 1 en el entorno de la raíz. Si el módulo de la derivada es mayor que uno, el método tiende a divergir.",
    },
    {
      title: "¿Cómo converge?",
      content:
        "La convergencia es lineal: cuando |g'(x)| es pequeño el error baja rápido y de forma estable; cuando se acerca a uno la convergencia se vuelve lenta.",
    },
    {
      title: "Ventajas",
      content:
        "Es muy simple de implementar, no necesita derivadas ni intervalos y resulta útil cuando la ecuación se despeja con facilidad.",
    },
    {
      title: "Desventajas",
      content:
        "Depende por completo de la forma g elegida: un mal despeje puede hacer que el método no converja bajo las condiciones actuales.",
    },
  ],
}

export const METHODS: MethodConfig[] = [
  REGLA_FALSA,
  NEWTON_RAPHSON,
  SECANTE,
  PUNTO_FIJO,
]

export function getMethodConfig(id: MethodId) {
  const config = METHODS.find((method) => method.id === id)

  if (!config) {
    throw new Error(`Método desconocido: ${id}`)
  }

  return config
}

export function defaultInputs(config: MethodConfig): Record<string, string> {
  return config.inputs.reduce<Record<string, string>>((values, input) => {
    values[input.key] = input.defaultValue
    return values
  }, {})
}
