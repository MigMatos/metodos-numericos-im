type Token =
  | { kind: "number"; value: number }
  | { kind: "name"; value: string }
  | { kind: "operator"; value: "+" | "-" | "*" | "/" | "^" }
  | { kind: "parenthesis"; value: "(" | ")" }

type Node =
  | { kind: "number"; value: number }
  | { kind: "variable" }
  | { kind: "negate"; operand: Node }
  | {
      kind: "binary"
      operator: "+" | "-" | "*" | "/" | "^"
      left: Node
      right: Node
    }
  | {
      kind: "call"
      name: string
      fn: (value: number) => number
      argument: Node
    }

type Parser = {
  tokens: Token[]
  index: number
}

export type Expression = {
  source: string
  evaluate: (variable: number) => number
}

export type CompileResult =
  { ok: true; expression: Expression } | { ok: false; message: string }

const VARIABLE_NAME = "x"

const FUNCTIONS = new Map<string, (value: number) => number>([
  ["sin", Math.sin],
  ["cos", Math.cos],
  ["tan", Math.tan],
  ["asin", Math.asin],
  ["acos", Math.acos],
  ["atan", Math.atan],
  ["sinh", Math.sinh],
  ["cosh", Math.cosh],
  ["tanh", Math.tanh],
  ["sqrt", Math.sqrt],
  ["abs", Math.abs],
  ["exp", Math.exp],
  ["ln", Math.log],
  ["log", Math.log10],
  ["log10", Math.log10],
])

const CONSTANTS = new Map<string, number>([
  ["pi", Math.PI],
  ["e", Math.E],
])

class ExpressionError extends Error {}

function isLetter(character: string) {
  return /[a-zA-Z_]/.test(character)
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let index = 0

  while (index < source.length) {
    const character = source[index] as string

    if (/\s/.test(character)) {
      index += 1
      continue
    }

    if ((character >= "0" && character <= "9") || character === ".") {
      let literal = ""
      let dots = 0

      while (index < source.length) {
        const current = source[index] as string

        if (current === ".") {
          dots += 1
        } else if (current < "0" || current > "9") {
          break
        }

        literal += current
        index += 1
      }

      const value = Number(literal)

      if (dots > 1 || !Number.isFinite(value)) {
        throw new ExpressionError(`Número inválido: "${literal}".`)
      }

      tokens.push({ kind: "number", value })
      continue
    }

    if (isLetter(character)) {
      let name = ""

      while (
        index < source.length &&
        /[a-zA-Z0-9_]/.test(source[index] as string)
      ) {
        name += source[index]
        index += 1
      }

      tokens.push({ kind: "name", value: name.toLowerCase() })
      continue
    }

    switch (character) {
      case "+":
      case "-":
      case "*":
      case "/":
      case "^":
        tokens.push({ kind: "operator", value: character })
        break
      case "(":
      case ")":
        tokens.push({ kind: "parenthesis", value: character })
        break
      default:
        throw new ExpressionError(`Carácter no válido: "${character}".`)
    }

    index += 1
  }

  return tokens
}

function currentToken(parser: Parser) {
  return parser.tokens[parser.index]
}

function parseExpression(parser: Parser): Node {
  let node = parseTerm(parser)

  while (true) {
    const token = currentToken(parser)

    if (
      token?.kind !== "operator" ||
      (token.value !== "+" && token.value !== "-")
    ) {
      return node
    }

    parser.index += 1
    node = {
      kind: "binary",
      operator: token.value,
      left: node,
      right: parseTerm(parser),
    }
  }
}

function parseTerm(parser: Parser): Node {
  let node = parseUnary(parser)

  while (true) {
    const token = currentToken(parser)

    if (
      token?.kind !== "operator" ||
      (token.value !== "*" && token.value !== "/")
    ) {
      return node
    }

    parser.index += 1
    node = {
      kind: "binary",
      operator: token.value,
      left: node,
      right: parseUnary(parser),
    }
  }
}

function parseUnary(parser: Parser): Node {
  const token = currentToken(parser)

  if (
    token?.kind === "operator" &&
    (token.value === "-" || token.value === "+")
  ) {
    parser.index += 1
    const operand = parseUnary(parser)
    return token.value === "-" ? { kind: "negate", operand } : operand
  }

  return parsePower(parser)
}

function parsePower(parser: Parser): Node {
  const base = parsePrimary(parser)
  const token = currentToken(parser)

  if (token?.kind === "operator" && token.value === "^") {
    parser.index += 1
    return {
      kind: "binary",
      operator: "^",
      left: base,
      right: parseUnary(parser),
    }
  }

  return base
}

function parsePrimary(parser: Parser): Node {
  const token = currentToken(parser)

  if (!token) {
    throw new ExpressionError("La expresión está incompleta.")
  }

  if (token.kind === "number") {
    parser.index += 1
    return { kind: "number", value: token.value }
  }

  if (token.kind === "parenthesis") {
    if (token.value !== "(") {
      throw new ExpressionError("Los paréntesis no están balanceados.")
    }

    parser.index += 1
    const node = parseExpression(parser)

    if (currentToken(parser)?.kind !== "parenthesis") {
      throw new ExpressionError("Falta cerrar un paréntesis.")
    }

    parser.index += 1
    return node
  }

  if (token.kind === "name") {
    const name = token.value
    parser.index += 1

    if (name === VARIABLE_NAME) {
      return { kind: "variable" }
    }

    const constant = CONSTANTS.get(name)
    if (constant !== undefined) {
      return { kind: "number", value: constant }
    }

    const fn = FUNCTIONS.get(name)
    if (!fn) {
      throw new ExpressionError(`La función o variable "${name}" no existe.`)
    }

    if (currentToken(parser)?.kind !== "parenthesis") {
      throw new ExpressionError(`Falta un paréntesis después de "${name}".`)
    }

    parser.index += 1
    const argument = parseExpression(parser)

    if (currentToken(parser)?.kind !== "parenthesis") {
      throw new ExpressionError(`Falta cerrar el paréntesis de "${name}".`)
    }

    parser.index += 1
    return { kind: "call", name, fn, argument }
  }

  throw new ExpressionError(`Elemento no válido: "${token.value}".`)
}

function evaluateNode(node: Node, variable: number): number {
  switch (node.kind) {
    case "number":
      return node.value
    case "variable":
      return variable
    case "negate":
      return -evaluateNode(node.operand, variable)
    case "call":
      return node.fn(evaluateNode(node.argument, variable))
    case "binary": {
      const left = evaluateNode(node.left, variable)
      const right = evaluateNode(node.right, variable)

      switch (node.operator) {
        case "+":
          return left + right
        case "-":
          return left - right
        case "*":
          return left * right
        case "/":
          return left / right
        case "^":
          return left ** right
      }
    }
  }
}

export function compileExpression(source: string): CompileResult {
  const trimmed = source.trim()

  if (trimmed === "") {
    return { ok: false, message: "Escribe una expresión matemática." }
  }

  try {
    const parser: Parser = { tokens: tokenize(trimmed), index: 0 }
    const node = parseExpression(parser)

    if (parser.index < parser.tokens.length) {
      return {
        ok: false,
        message: "La expresión tiene elementos inesperados al final.",
      }
    }

    return {
      ok: true,
      expression: {
        source: trimmed,
        evaluate: (variable: number) => evaluateNode(node, variable),
      },
    }
  } catch (error) {
    if (error instanceof ExpressionError) {
      return { ok: false, message: error.message }
    }

    return { ok: false, message: "La expresión no es válida." }
  }
}

export function compileExpressions(
  sources: Record<string, string>
):
  | { ok: true; expressions: Record<string, Expression> }
  | { ok: false; message: string } {
  const expressions: Record<string, Expression> = {}

  for (const [key, source] of Object.entries(sources)) {
    const result = compileExpression(source)

    if (!result.ok) {
      return { ok: false, message: result.message }
    }

    expressions[key] = result.expression
  }

  return { ok: true, expressions }
}
