/**
 * 安全的表达式求值器
 * 替代 eval() 和 new Function()，防止代码注入攻击
 *
 * 支持的操作：
 * - 列访问：row.columnName 或 row['columnName']
 * - 数学运算：+, -, *, /, %, **
 * - 比较运算：>, <, >=, <=, ==, !=, ===, !==
 * - 逻辑运算：&&, ||, !
 * - 三元运算符：condition ? trueValue : falseValue
 * - 函数调用：Math.abs(), Math.round(), String(), Number() 等
 * - 括号优先级
 */

interface EvaluationContext {
  row: Record<string, any>
}

/**
 * 安全的表达式求值
 * @param expression 表达式字符串
 * @param row 数据行对象
 * @returns 计算结果
 */
export function evaluateExpression(expression: string, row: Record<string, any>): any {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Expression must be a non-empty string')
  }

  const context: EvaluationContext = { row }

  try {
    return evaluateSafe(expression.trim(), context)
  } catch (error: any) {
    throw new Error(`Expression evaluation failed: ${error.message}`)
  }
}

/**
 * 安全求值核心函数
 */
function evaluateSafe(expr: string, context: EvaluationContext): any {
  expr = expr.trim()

  // 1. 处理字面量
  if (isNumberLiteral(expr)) {
    return parseFloat(expr)
  }
  if (isStringLiteral(expr)) {
    return expr.slice(1, -1) // 去掉引号
  }
  if (expr === 'true') return true
  if (expr === 'false') return false
  if (expr === 'null') return null
  if (expr === 'undefined') return undefined

  // 2. 处理列访问：row.columnName 或 row['columnName']
  if (expr.startsWith('row.') || expr.startsWith('row[')) {
    return getColumnValue(expr, context.row)
  }

  // 3. 处理括号
  if (expr.startsWith('(') && expr.endsWith(')')) {
    return evaluateSafe(expr.slice(1, -1), context)
  }

  // 4. 处理三元运算符：condition ? trueValue : falseValue
  const ternaryMatch = matchTernary(expr)
  if (ternaryMatch) {
    const condition = evaluateSafe(ternaryMatch.condition, context)
    return condition
      ? evaluateSafe(ternaryMatch.trueValue, context)
      : evaluateSafe(ternaryMatch.falseValue, context)
  }

  // 5. 处理逻辑运算符：&&, ||
  const logicalOp = findOperator(expr, ['||', '&&'])
  if (logicalOp) {
    const left = evaluateSafe(expr.slice(0, logicalOp.index), context)
    const right = evaluateSafe(expr.slice(logicalOp.index + logicalOp.operator.length), context)

    if (logicalOp.operator === '&&') return left && right
    if (logicalOp.operator === '||') return left || right
  }

  // 6. 处理比较运算符：==, !=, ===, !==, >, <, >=, <=
  const comparisonOp = findOperator(expr, ['===', '!==', '==', '!=', '>=', '<=', '>', '<'])
  if (comparisonOp) {
    const left = evaluateSafe(expr.slice(0, comparisonOp.index), context)
    const right = evaluateSafe(expr.slice(comparisonOp.index + comparisonOp.operator.length), context)

    switch (comparisonOp.operator) {
      case '===': return left === right
      case '!==': return left !== right
      case '==': return left == right
      case '!=': return left != right
      case '>': return left > right
      case '<': return left < right
      case '>=': return left >= right
      case '<=': return left <= right
    }
  }

  // 7. 处理算术运算符：+, -, *, /, %, **
  const arithmeticOp = findOperator(expr, ['+', '-', '*', '/', '%', '**'])
  if (arithmeticOp) {
    const left = evaluateSafe(expr.slice(0, arithmeticOp.index), context)
    const right = evaluateSafe(expr.slice(arithmeticOp.index + arithmeticOp.operator.length), context)

    switch (arithmeticOp.operator) {
      case '+': return Number(left) + Number(right)
      case '-': return Number(left) - Number(right)
      case '*': return Number(left) * Number(right)
      case '/': return Number(left) / Number(right)
      case '%': return Number(left) % Number(right)
      case '**': return Math.pow(Number(left), Number(right))
    }
  }

  // 8. 处理一元运算符：-, !
  if (expr.startsWith('!')) {
    return !evaluateSafe(expr.slice(1), context)
  }
  if (expr.startsWith('-') && expr.length > 1) {
    return -evaluateSafe(expr.slice(1), context)
  }

  // 9. 处理安全的函数调用
  const functionCall = matchFunctionCall(expr)
  if (functionCall) {
    return callSafeFunction(functionCall.name, functionCall.args, context)
  }

  // 10. 如果都不匹配，尝试作为列名直接访问
  if (isValidIdentifier(expr)) {
    return context.row[expr]
  }

  throw new Error(`Unsupported expression: ${expr}`)
}

/**
 * 获取列值：支持 row.columnName 和 row['columnName']
 */
function getColumnValue(expr: string, row: Record<string, any>): any {
  if (expr.startsWith('row.')) {
    const columnName = expr.slice(4)
    return row[columnName]
  }

  if (expr.startsWith('row[')) {
    const match = expr.match(/^row\[['"](.+?)['"]\]$/)
    if (match) {
      return row[match[1]]
    }
  }

  throw new Error(`Invalid column access: ${expr}`)
}

/**
 * 查找运算符（从右到左，支持运算符优先级）
 */
function findOperator(expr: string, operators: string[]): { operator: string; index: number } | null {
  let depth = 0
  let inString = false
  let stringChar = ''

  // 从右到左扫描，找到最外层的运算符
  for (let i = expr.length - 1; i >= 0; i--) {
    const char = expr[i]

    // 处理字符串
    if ((char === '"' || char === "'") && (i === 0 || expr[i - 1] !== '\\')) {
      if (inString && stringChar === char) {
        inString = false
        stringChar = ''
      } else if (!inString) {
        inString = true
        stringChar = char
      }
      continue
    }

    if (inString) continue

    // 处理括号深度
    if (char === ')') depth++
    if (char === '(') depth--

    // 只在最外层（depth === 0）查找运算符
    if (depth === 0) {
      for (const op of operators) {
        if (expr.slice(i, i + op.length) === op) {
          // 避免误匹配（如 "==" 误匹配为 "="）
          if (i > 0 && op === '=' && (expr[i - 1] === '=' || expr[i - 1] === '!' || expr[i - 1] === '>' || expr[i - 1] === '<')) {
            continue
          }
          return { operator: op, index: i }
        }
      }
    }
  }

  return null
}

/**
 * 匹配三元运算符
 */
function matchTernary(expr: string): { condition: string; trueValue: string; falseValue: string } | null {
  let depth = 0
  let inString = false
  let stringChar = ''
  let questionIndex = -1
  let colonIndex = -1

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]

    if ((char === '"' || char === "'") && (i === 0 || expr[i - 1] !== '\\')) {
      if (inString && stringChar === char) {
        inString = false
        stringChar = ''
      } else if (!inString) {
        inString = true
        stringChar = char
      }
      continue
    }

    if (inString) continue

    if (char === '(') depth++
    if (char === ')') depth--

    if (depth === 0) {
      if (char === '?' && questionIndex === -1) {
        questionIndex = i
      } else if (char === ':' && questionIndex !== -1 && colonIndex === -1) {
        colonIndex = i
      }
    }
  }

  if (questionIndex !== -1 && colonIndex !== -1) {
    return {
      condition: expr.slice(0, questionIndex).trim(),
      trueValue: expr.slice(questionIndex + 1, colonIndex).trim(),
      falseValue: expr.slice(colonIndex + 1).trim()
    }
  }

  return null
}

/**
 * 匹配函数调用
 */
function matchFunctionCall(expr: string): { name: string; args: string[] } | null {
  const match = expr.match(/^(\w+(?:\.\w+)*)\((.*)\)$/)
  if (!match) return null

  const name = match[1]
  const argsStr = match[2].trim()

  if (!argsStr) {
    return { name, args: [] }
  }

  // 分割参数（考虑括号和引号）
  const args = splitArguments(argsStr)

  return { name, args }
}

/**
 * 分割函数参数
 */
function splitArguments(argsStr: string): string[] {
  const args: string[] = []
  let current = ''
  let depth = 0
  let inString = false
  let stringChar = ''

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i]

    if ((char === '"' || char === "'") && (i === 0 || argsStr[i - 1] !== '\\')) {
      if (inString && stringChar === char) {
        inString = false
        stringChar = ''
      } else if (!inString) {
        inString = true
        stringChar = char
      }
    }

    if (!inString) {
      if (char === '(') depth++
      if (char === ')') depth--
    }

    if (char === ',' && depth === 0 && !inString) {
      args.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  if (current.trim()) {
    args.push(current.trim())
  }

  return args
}

/**
 * 调用安全的白名单函数
 */
function callSafeFunction(name: string, args: string[], context: EvaluationContext): any {
  // 求值参数
  const evaluatedArgs = args.map(arg => evaluateSafe(arg, context))

  // 白名单函数
  const safeFunctions: Record<string, (...args: any[]) => any> = {
    // Math 函数
    'Math.abs': Math.abs,
    'Math.ceil': Math.ceil,
    'Math.floor': Math.floor,
    'Math.round': Math.round,
    'Math.max': Math.max,
    'Math.min': Math.min,
    'Math.pow': Math.pow,
    'Math.sqrt': Math.sqrt,
    'Math.sin': Math.sin,
    'Math.cos': Math.cos,
    'Math.tan': Math.tan,

    // 类型转换
    'String': String,
    'Number': Number,
    'Boolean': Boolean,
    'parseInt': parseInt,
    'parseFloat': parseFloat,

    // 字符串函数
    'toUpperCase': (str: any) => String(str).toUpperCase(),
    'toLowerCase': (str: any) => String(str).toLowerCase(),
    'trim': (str: any) => String(str).trim(),
    'length': (str: any) => String(str).length,
  }

  const func = safeFunctions[name]
  if (!func) {
    throw new Error(`Function not allowed: ${name}`)
  }

  return func(...evaluatedArgs)
}

/**
 * 检查是否为数字字面量
 */
function isNumberLiteral(expr: string): boolean {
  return /^-?\d+(\.\d+)?$/.test(expr)
}

/**
 * 检查是否为字符串字面量
 */
function isStringLiteral(expr: string): boolean {
  return (expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))
}

/**
 * 检查是否为有效标识符
 */
function isValidIdentifier(expr: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr)
}

/**
 * 简化版表达式求值（用于向后兼容）
 * 支持简单的列访问和常量
 */
export function evaluateSimple(expression: string, row: Record<string, any>): any {
  expression = expression.trim()

  // 列访问
  if (expression.startsWith('row.')) {
    const columnName = expression.slice(4)
    return row[columnName]
  }

  // 数字
  if (isNumberLiteral(expression)) {
    return parseFloat(expression)
  }

  // 字符串
  if (isStringLiteral(expression)) {
    return expression.slice(1, -1)
  }

  // 布尔值
  if (expression === 'true') return true
  if (expression === 'false') return false
  if (expression === 'null') return null

  // 直接列名
  if (isValidIdentifier(expression)) {
    return row[expression]
  }

  // 其他情况使用完整求值
  return evaluateExpression(expression, row)
}
