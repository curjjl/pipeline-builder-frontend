/**
 * 数据转换引擎
 * 支持各种数据清洗、转换、聚合操作
 */

import {
  validateDataNotEmpty,
  validateColumnExists,
  validateColumnsExist,
  validateColumnIsNumeric,
  validateColumnsAreNumeric,
  validateColumnIsDate,
  validateRequired,
  validateRequiredString,
  validateNumber,
  validateNumberInRange,
  validatePositiveInteger,
  validateNonNegativeInteger,
  validateArray,
  validateNonEmptyArray,
  validateEnum,
  validateRegex,
  validateColumnNotExists,
  validateOutputColumns,
  validateConditionExpression,
  validateDateFormat,
  ValidationError
} from './transform-validation'

export type TransformType =
  // 基础操作
  | 'filter'           // 筛选
  | 'select'           // 选择列（旧版）
  | 'selectColumns'    // 选择列（新版，支持include/exclude）
  | 'rename'           // 重命名列（旧版）
  | 'renameColumns'    // 重命名列（新版，支持批量）
  | 'removeColumn'     // 删除列（旧版，单次调用）
  | 'removeColumns'    // 删除列（新版，批量）
  | 'sort'             // 排序
  | 'distinct'         // 去重
  | 'addColumn'        // 添加列
  | 'fillNull'         // 填充空值

  // 字符串处理
  | 'trim'             // 去除空白（旧版，单列）
  | 'trimWhitespace'   // 去除空白（新版，多列）
  | 'split'            // 拆分列（旧版）
  | 'splitColumns'     // 拆分列（新版，增强）
  | 'replace'          // 替换值（旧版，简单）
  | 'replaceValues'    // 替换值（新版，多模式）
  | 'cleanString'      // 清理字符串（Palantir官方）
  | 'titleCase'        // 标题大小写（Palantir官方）
  | 'uppercase'        // 转大写
  | 'lowercase'        // 转小写
  | 'concatenate'      // 连接字符串
  | 'extract'          // 提取子串
  | 'regexExtract'     // 正则提取
  | 'padString'        // 字符串填充
  | 'parseJson'        // 解析JSON
  | 'parseUrl'         // 解析URL

  // 数值处理
  | 'cast'             // 类型转换
  | 'round'            // 四舍五入
  | 'floor'            // 向下取整
  | 'ceiling'          // 向上取整
  | 'absolute'         // 绝对值
  | 'add'              // 加法
  | 'subtract'         // 减法
  | 'multiply'         // 乘法
  | 'divide'           // 除法
  | 'modulo'           // 取模
  | 'power'            // 幂运算

  // 日期时间处理
  | 'formatDate'       // 格式化日期
  | 'parseDate'        // 解析日期
  | 'extractYear'      // 提取年份
  | 'extractMonth'     // 提取月份
  | 'extractDay'       // 提取日期
  | 'extractHour'      // 提取小时
  | 'extractMinute'    // 提取分钟
  | 'addDays'          // 添加天数
  | 'addMonths'        // 添加月数
  | 'addYears'         // 添加年数
  | 'dateDiff'         // 日期差值

  // 聚合与分组
  | 'join'             // 连接表
  | 'union'            // 合并表
  | 'groupBy'          // 分组聚合
  | 'pivot'            // 数据透视
  | 'unpivot'          // 逆透视

  // 高级操作
  | 'conditionalColumn' // 条件列（if-then-else）
  | 'rank'             // 排名
  | 'rowNumber'        // 行号
  | 'lag'              // 上一行
  | 'lead'             // 下一行
  | 'cumSum'           // 累计求和
  | 'percentile'       // 百分位数

export interface Transform {
  id: string
  type: TransformType
  name?: string
  config?: any  // 新版使用config而不是params
  params?: any  // 保留兼容旧版
  enabled?: boolean
}

export interface TransformResult {
  data: any[]
  columns: string[]
  rowCount: number
  error?: string
}

/**
 * 应用单个转换
 */
export function applyTransform(data: any[], transform: Transform): TransformResult {
  try {
    let result: any[] = []
    const params = transform.config || transform.params  // 支持新旧两种参数格式

    switch (transform.type) {
      case 'filter':
        result = applyFilter(data, params)
        break
      case 'select':
        result = applySelect(data, params)
        break
      case 'selectColumns':
        result = applySelectColumns(data, params)
        break
      case 'rename':
        result = applyRename(data, params)
        break
      case 'renameColumns':
        result = applyRenameColumns(data, params)
        break
      case 'cast':
        result = applyCast(data, params)
        break
      case 'trim':
        result = applyTrim(data, params)
        break
      case 'trimWhitespace':
        result = applyTrimWhitespace(data, params)
        break
      case 'split':
        result = applySplit(data, params)
        break
      case 'splitColumns':
        result = applySplitColumns(data, params)
        break
      case 'groupBy':
        result = applyGroupBy(data, params)
        break
      case 'sort':
        result = applySort(data, params)
        break
      case 'distinct':
        result = applyDistinct(data, params)
        break
      case 'addColumn':
        result = applyAddColumn(data, params)
        break
      case 'removeColumn':
        result = applyRemoveColumn(data, params)
        break
      case 'removeColumns':
        result = applyRemoveColumns(data, params)
        break
      case 'fillNull':
        result = applyFillNull(data, params)
        break
      case 'replace':
        result = applyReplace(data, params)
        break
      case 'replaceValues':
        result = applyReplaceValues(data, params)
        break
      case 'cleanString':
        result = applyCleanString(data, params)
        break
      case 'titleCase':
        result = applyTitleCase(data, params)
        break

      // 字符串处理 - 新增
      case 'uppercase':
        result = applyUppercase(data, params)
        break
      case 'lowercase':
        result = applyLowercase(data, params)
        break
      case 'concatenate':
        result = applyConcatenate(data, params)
        break
      case 'extract':
        result = applyExtract(data, params)
        break
      case 'regexExtract':
        result = applyRegexExtract(data, params)
        break
      case 'padString':
        result = applyPadString(data, params)
        break
      case 'parseJson':
        result = applyParseJson(data, params)
        break
      case 'parseUrl':
        result = applyParseUrl(data, params)
        break

      // 数值处理 - 新增
      case 'round':
        result = applyRound(data, params)
        break
      case 'floor':
        result = applyFloor(data, params)
        break
      case 'ceiling':
        result = applyCeiling(data, params)
        break
      case 'absolute':
        result = applyAbsolute(data, params)
        break
      case 'add':
        result = applyAdd(data, params)
        break
      case 'subtract':
        result = applySubtract(data, params)
        break
      case 'multiply':
        result = applyMultiply(data, params)
        break
      case 'divide':
        result = applyDivide(data, params)
        break
      case 'modulo':
        result = applyModulo(data, params)
        break
      case 'power':
        result = applyPower(data, params)
        break

      // 日期时间处理 - 新增
      case 'formatDate':
        result = applyFormatDate(data, params)
        break
      case 'parseDate':
        result = applyParseDate(data, params)
        break
      case 'extractYear':
        result = applyExtractYear(data, params)
        break
      case 'extractMonth':
        result = applyExtractMonth(data, params)
        break
      case 'extractDay':
        result = applyExtractDay(data, params)
        break
      case 'extractHour':
        result = applyExtractHour(data, params)
        break
      case 'extractMinute':
        result = applyExtractMinute(data, params)
        break
      case 'addDays':
        result = applyAddDays(data, params)
        break
      case 'addMonths':
        result = applyAddMonths(data, params)
        break
      case 'addYears':
        result = applyAddYears(data, params)
        break
      case 'dateDiff':
        result = applyDateDiff(data, params)
        break

      // 高级操作 - 新增
      case 'pivot':
        result = applyPivot(data, params)
        break
      case 'unpivot':
        result = applyUnpivot(data, params)
        break
      case 'conditionalColumn':
        result = applyConditionalColumn(data, params)
        break
      case 'rank':
        result = applyRank(data, params)
        break
      case 'rowNumber':
        result = applyRowNumber(data, params)
        break
      case 'lag':
        result = applyLag(data, params)
        break
      case 'lead':
        result = applyLead(data, params)
        break
      case 'cumSum':
        result = applyCumSum(data, params)
        break
      case 'percentile':
        result = applyPercentile(data, params)
        break

      default:
        result = data
    }

    return {
      data: result,
      columns: result.length > 0 ? Object.keys(result[0]) : [],
      rowCount: result.length
    }
  } catch (error: any) {
    return {
      data: [],
      columns: [],
      rowCount: 0,
      error: error.message
    }
  }
}

/**
 * 应用多个转换（管道）
 */
export function applyTransforms(data: any[], transforms: Transform[]): TransformResult {
  let result = data

  for (const transform of transforms) {
    if (transform.enabled) {
      const transformResult = applyTransform(result, transform)
      if (transformResult.error) {
        return transformResult
      }
      result = transformResult.data
    }
  }

  return {
    data: result,
    columns: result.length > 0 ? Object.keys(result[0]) : [],
    rowCount: result.length
  }
}

/**
 * Filter - 筛选行
 * params: { column: string, operator: string, value: any }
 */
function applyFilter(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequired('column', params?.column)
  validateRequired('operator', params?.operator)
  validateColumnExists(data, params.column)

  const { column, operator, value } = params

  return data.filter(row => {
    const cellValue = row[column]

    switch (operator) {
      case 'equals':
      case 'is equal to':
        return cellValue === value
      case 'not equals':
      case 'is not equal to':
        return cellValue !== value
      case 'contains':
        return String(cellValue).includes(String(value))
      case 'not contains':
        return !String(cellValue).includes(String(value))
      case 'starts with':
        return String(cellValue).startsWith(String(value))
      case 'ends with':
        return String(cellValue).endsWith(String(value))
      case 'greater than':
      case '>':
        return Number(cellValue) > Number(value)
      case 'less than':
      case '<':
        return Number(cellValue) < Number(value)
      case 'greater than or equal':
      case '>=':
        return Number(cellValue) >= Number(value)
      case 'less than or equal':
      case '<=':
        return Number(cellValue) <= Number(value)
      case 'is null':
        return cellValue == null || cellValue === ''
      case 'is not null':
        return cellValue != null && cellValue !== ''
      default:
        return true
    }
  })
}

/**
 * Select - 选择列
 * params: { columns: string[] }
 */
function applySelect(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateNonEmptyArray('columns', params?.columns)
  validateColumnsExist(data, params.columns)

  const { columns } = params

  return data.map(row => {
    const newRow: any = {}
    columns.forEach((col: string) => {
      if (col in row) {
        newRow[col] = row[col]
      }
    })
    return newRow
  })
}

/**
 * Rename - 重命名列
 * params: { oldName: string, newName: string }
 */
function applyRename(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('oldName', params?.oldName)
  validateRequiredString('newName', params?.newName)
  validateColumnExists(data, params.oldName)
  // Don't check if newName exists - renaming can overwrite

  const { oldName, newName } = params

  return data.map(row => {
    const newRow = { ...row }
    if (oldName in newRow) {
      newRow[newName] = newRow[oldName]
      delete newRow[oldName]
    }
    return newRow
  })
}

/**
 * Cast - 类型转换
 * params: { column: string, toType: 'String' | 'Number' | 'Date' | 'Boolean' }
 */
function applyCast(data: any[], params: any): any[] {
  const { column, toType } = params

  return data.map(row => {
    const newRow = { ...row }
    const value = newRow[column]

    try {
      switch (toType) {
        case 'String':
          newRow[column] = String(value)
          break
        case 'Number':
          newRow[column] = Number(value)
          break
        case 'Date':
          newRow[column] = new Date(value).toISOString().split('T')[0]
          break
        case 'Boolean':
          newRow[column] = Boolean(value)
          break
      }
    } catch (error) {
      // 转换失败保持原值
    }

    return newRow
  })
}

/**
 * Trim - 去除字符串空白
 * params: { column: string, type: 'both' | 'left' | 'right' }
 */
function applyTrim(data: any[], params: any): any[] {
  const { column, type = 'both' } = params

  return data.map(row => {
    const newRow = { ...row }
    const value = String(newRow[column] || '')

    switch (type) {
      case 'left':
        newRow[column] = value.trimStart()
        break
      case 'right':
        newRow[column] = value.trimEnd()
        break
      case 'both':
      default:
        newRow[column] = value.trim()
        break
    }

    return newRow
  })
}

/**
 * Split - 拆分列
 * params: { column: string, delimiter: string, into: string[] }
 */
function applySplit(data: any[], params: any): any[] {
  const { column, delimiter, into } = params

  return data.map(row => {
    const newRow = { ...row }
    const value = String(newRow[column] || '')
    const parts = value.split(delimiter)

    into.forEach((newCol: string, index: number) => {
      newRow[newCol] = parts[index] || ''
    })

    return newRow
  })
}

/**
 * GroupBy - 分组聚合
 * params: {
 *   groupBy: string[],
 *   aggregations: Array<{ column: string, func: 'sum' | 'avg' | 'count' | 'min' | 'max', as?: string }>
 * }
 */
function applyGroupBy(data: any[], params: any): any[] {
  const { groupBy, aggregations } = params

  // 按分组字段分组
  const groups = new Map<string, any[]>()

  data.forEach(row => {
    const key = groupBy.map((col: string) => row[col]).join('|||')
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(row)
  })

  // 对每个分组应用聚合函数
  const result: any[] = []

  groups.forEach((groupRows, key) => {
    const newRow: any = {}

    // 添加分组字段
    const keyParts = key.split('|||')
    groupBy.forEach((col: string, index: number) => {
      newRow[col] = keyParts[index]
    })

    // 应用聚合函数
    aggregations.forEach((agg: any) => {
      const { column, func, as } = agg
      const outputColumn = as || `${func}_${column}`
      const values = groupRows.map(row => Number(row[column])).filter(v => !isNaN(v))

      switch (func) {
        case 'sum':
          newRow[outputColumn] = values.reduce((a, b) => a + b, 0)
          break
        case 'avg':
          newRow[outputColumn] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0
          break
        case 'count':
          newRow[outputColumn] = groupRows.length
          break
        case 'min':
          newRow[outputColumn] = values.length > 0 ? Math.min(...values) : null
          break
        case 'max':
          newRow[outputColumn] = values.length > 0 ? Math.max(...values) : null
          break
      }
    })

    result.push(newRow)
  })

  return result
}

/**
 * Sort - 排序
 * params: { column: string, order: 'asc' | 'desc' }
 */
function applySort(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  if (params.order) {
    validateEnum('order', params.order, ['asc', 'desc'])
  }

  const { column, order = 'asc' } = params

  return [...data].sort((a, b) => {
    const aVal = a[column]
    const bVal = b[column]

    let comparison = 0
    if (aVal < bVal) comparison = -1
    if (aVal > bVal) comparison = 1

    return order === 'desc' ? -comparison : comparison
  })
}

/**
 * Distinct - 去重
 * params: { columns?: string[] } // 如果不指定列，则对所有列去重
 */
function applyDistinct(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  if (params?.columns) {
    validateNonEmptyArray('columns', params.columns)
    validateColumnsExist(data, params.columns)
  }

  const { columns } = params || {}

  const seen = new Set<string>()
  const result: any[] = []

  data.forEach(row => {
    const key = columns
      ? columns.map((col: string) => row[col]).join('|||')
      : JSON.stringify(row)

    if (!seen.has(key)) {
      seen.add(key)
      result.push(row)
    }
  })

  return result
}

/**
 * RemoveColumn - 删除列
 * params: { columns: string[] }
 */
function applyRemoveColumn(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateNonEmptyArray('columns', params?.columns)
  validateColumnsExist(data, params.columns)

  const { columns } = params

  return data.map(row => {
    const newRow = { ...row }
    columns.forEach((col: string) => {
      delete newRow[col]
    })
    return newRow
  })
}

/**
 * FillNull - 填充空值
 * params: { column: string, value: any }
 */
function applyFillNull(data: any[], params: any): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  validateRequired('value', params?.value)

  const { column, value } = params

  return data.map(row => {
    const newRow = { ...row }
    if (newRow[column] == null || newRow[column] === '') {
      newRow[column] = value
    }
    return newRow
  })
}

/**
 * Replace - 替换值
 * params: { column: string, from: any, to: any }
 */
function applyReplace(data: any[], params: any): any[] {
  const { column, from, to } = params

  return data.map(row => {
    const newRow = { ...row }
    if (newRow[column] === from) {
      newRow[column] = to
    }
    return newRow
  })
}

/**
 * Join - 连接两个表
 * params: {
 *   leftData: any[],
 *   rightData: any[],
 *   leftKey: string,
 *   rightKey: string,
 *   type: 'inner' | 'left' | 'right' | 'outer'
 * }
 */
export function joinDatasets(params: {
  leftData: any[]
  rightData: any[]
  leftKey: string
  rightKey: string
  type: 'inner' | 'left' | 'right' | 'outer'
}): any[] {
  const { leftData, rightData, leftKey, rightKey, type } = params
  const result: any[] = []

  // 创建右表索引
  const rightIndex = new Map<any, any[]>()
  rightData.forEach(rightRow => {
    const key = rightRow[rightKey]
    if (!rightIndex.has(key)) {
      rightIndex.set(key, [])
    }
    rightIndex.get(key)!.push(rightRow)
  })

  // 执行连接
  leftData.forEach(leftRow => {
    const key = leftRow[leftKey]
    const rightRows = rightIndex.get(key) || []

    if (rightRows.length > 0) {
      // 匹配到右表数据
      rightRows.forEach(rightRow => {
        result.push({ ...leftRow, ...rightRow })
      })
    } else if (type === 'left' || type === 'outer') {
      // 左连接：保留左表数据
      result.push({ ...leftRow })
    }
  })

  // 外连接：添加右表未匹配的数据
  if (type === 'outer' || type === 'right') {
    const leftKeys = new Set(leftData.map(row => row[leftKey]))
    rightData.forEach(rightRow => {
      if (!leftKeys.has(rightRow[rightKey])) {
        result.push({ ...rightRow })
      }
    })
  }

  return result
}

/**
 * Union - 合并两个表
 */
export function unionDatasets(data1: any[], data2: any[]): any[] {
  return [...data1, ...data2]
}

/**
 * Select Columns - 选择列（新版，支持include/exclude模式）
 * params: { mode: 'include' | 'exclude', columns: string[] }
 */
function applySelectColumns(data: any[], params: any): any[] {
  const { mode, columns } = params

  if (mode === 'include') {
    // Include模式：只保留选中的列
    return data.map(row => {
      const newRow: any = {}
      columns.forEach((col: string) => {
        if (col in row) {
          newRow[col] = row[col]
        }
      })
      return newRow
    })
  } else {
    // Exclude模式：排除选中的列
    return data.map(row => {
      const newRow = { ...row }
      columns.forEach((col: string) => {
        delete newRow[col]
      })
      return newRow
    })
  }
}

/**
 * Rename Columns - 重命名列（新版，支持批量）
 * params: { renames: Array<{ from: string, to: string }> }
 */
function applyRenameColumns(data: any[], params: any): any[] {
  const { renames } = params

  return data.map(row => {
    const newRow = { ...row }
    renames.forEach(({ from, to }: { from: string; to: string }) => {
      if (from in newRow) {
        newRow[to] = newRow[from]
        delete newRow[from]
      }
    })
    return newRow
  })
}

/**
 * Add Column - 添加计算列（增强版，支持复杂表达式）
 * params: { columnName: string, expression: string, dataType?: string }
 */
function applyAddColumn(data: any[], params: any): any[] {
  const { columnName, expression, dataType = 'auto' } = params

  return data.map(row => {
    const newRow = { ...row }

    try {
      // 解析表达式并计算值
      let value: any

      // 简单表达式解析（支持 row.column 访问和基本运算）
      if (expression.includes('row.')) {
        // 使用Function创建表达式求值器
        const func = new Function('row', `return ${expression}`)
        value = func(row)
      } else {
        // 常量表达式
        value = eval(expression)
      }

      // 类型转换
      if (dataType !== 'auto') {
        switch (dataType) {
          case 'string':
            value = String(value)
            break
          case 'number':
            value = Number(value)
            break
          case 'boolean':
            value = Boolean(value)
            break
        }
      }

      newRow[columnName] = value
    } catch (error) {
      // 表达式执行失败，设置为null
      newRow[columnName] = null
    }

    return newRow
  })
}

/**
 * Remove Columns - 删除多列（新版）
 * params: { columns: string[] }
 */
function applyRemoveColumns(data: any[], params: any): any[] {
  const { columns } = params

  return data.map(row => {
    const newRow = { ...row }
    columns.forEach((col: string) => {
      delete newRow[col]
    })
    return newRow
  })
}

/**
 * Trim Whitespace - 去除空白（新版，支持多列和多模式）
 * params: { mode: 'both' | 'start' | 'end', columns: string[] }
 */
function applyTrimWhitespace(data: any[], params: any): any[] {
  const { mode = 'both', columns } = params

  return data.map(row => {
    const newRow = { ...row }

    columns.forEach((col: string) => {
      if (col in newRow) {
        const value = String(newRow[col] || '')

        switch (mode) {
          case 'start':
            newRow[col] = value.trimStart()
            break
          case 'end':
            newRow[col] = value.trimEnd()
            break
          case 'both':
          default:
            newRow[col] = value.trim()
            break
        }
      }
    })

    return newRow
  })
}

/**
 * Replace Values - 替换值（新版，支持多种模式）
 * params: {
 *   column: string,
 *   mode: 'exact' | 'contains' | 'regex',
 *   findValue: string,
 *   replaceValue: string,
 *   caseSensitive: boolean
 * }
 */
function applyReplaceValues(data: any[], params: any): any[] {
  const { column, mode, findValue, replaceValue, caseSensitive = true } = params

  return data.map(row => {
    const newRow = { ...row }

    if (column in newRow) {
      const value = String(newRow[column] || '')

      switch (mode) {
        case 'exact':
          // 精确匹配
          if (caseSensitive) {
            if (value === findValue) {
              newRow[column] = replaceValue
            }
          } else {
            if (value.toLowerCase() === findValue.toLowerCase()) {
              newRow[column] = replaceValue
            }
          }
          break

        case 'contains':
          // 包含匹配
          if (caseSensitive) {
            newRow[column] = value.replace(new RegExp(escapeRegex(findValue), 'g'), replaceValue)
          } else {
            newRow[column] = value.replace(new RegExp(escapeRegex(findValue), 'gi'), replaceValue)
          }
          break

        case 'regex':
          // 正则表达式匹配
          try {
            newRow[column] = value.replace(new RegExp(findValue, 'g'), replaceValue)
          } catch (error) {
            // 正则表达式无效，保持原值
          }
          break
      }
    }

    return newRow
  })
}

/**
 * Split Columns - 分割列（新版，支持更多选项）
 * params: {
 *   column: string,
 *   delimiter: string,
 *   numColumns: number,
 *   columnNames: string[],
 *   removeSource: boolean
 * }
 */
function applySplitColumns(data: any[], params: any): any[] {
  const { column, delimiter, numColumns, columnNames, removeSource = true } = params

  return data.map(row => {
    const newRow = { ...row }

    if (column in newRow) {
      const value = String(newRow[column] || '')
      const parts = value.split(delimiter)

      // 创建新列
      for (let i = 0; i < numColumns; i++) {
        const newColName = columnNames[i] || `${column}_${i + 1}`
        newRow[newColName] = parts[i] || ''
      }

      // 是否删除源列
      if (removeSource) {
        delete newRow[column]
      }
    }

    return newRow
  })
}

/**
 * 辅助函数：转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Clean String Transform
 * 清理字符串：去除空白、压缩多个空白、转换空字符串为 null
 */
export function applyCleanString(data: any[], params: {
  column: string
  convertEmptyToNull?: boolean
  reduceWhitespace?: boolean
  trimWhitespace?: boolean
}): any[] {
  const { column, convertEmptyToNull = true, reduceWhitespace = true, trimWhitespace = true } = params

  return data.map(row => {
    const newRow = { ...row }
    let value = row[column]

    // 只处理字符串类型
    if (typeof value === 'string') {
      // 1. Trim whitespace at beginning and end
      if (trimWhitespace) {
        value = value.trim()
      }

      // 2. Reduce multiple whitespace to single
      if (reduceWhitespace) {
        value = value.replace(/\s+/g, ' ')
      }

      // 3. Convert empty strings to null
      if (convertEmptyToNull && value === '') {
        value = null
      }

      newRow[column] = value
    }

    return newRow
  })
}

/**
 * Title Case Transform
 * 将字符串转换为标题大小写（每个单词首字母大写）
 */
export function applyTitleCase(data: any[], params: {
  column: string
}): any[] {
  const { column } = params

  return data.map(row => {
    const newRow = { ...row }
    const value = row[column]

    // 只处理字符串类型
    if (typeof value === 'string') {
      // 将每个单词的首字母大写
      newRow[column] = value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
    }

    return newRow
  })
}

// ============================================================================
// 新增字符串处理函数
// ============================================================================

/**
 * Uppercase - 转大写
 */
function applyUppercase(data: any[], params: { column: string }): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)

  const { column } = params
  return data.map(row => ({
    ...row,
    [column]: typeof row[column] === 'string' ? row[column].toUpperCase() : row[column]
  }))
}

/**
 * Lowercase - 转小写
 */
function applyLowercase(data: any[], params: { column: string }): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)

  const { column } = params
  return data.map(row => ({
    ...row,
    [column]: typeof row[column] === 'string' ? row[column].toLowerCase() : row[column]
  }))
}

/**
 * Concatenate - 连接字符串
 */
function applyConcatenate(data: any[], params: {
  columns: string[]
  outputColumn: string
  separator?: string
}): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateNonEmptyArray('columns', params?.columns)
  validateColumnsExist(data, params.columns)
  validateRequiredString('outputColumn', params?.outputColumn)

  const { columns, outputColumn, separator = '' } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: columns.map(col => row[col] || '').join(separator)
  }))
}

/**
 * Extract - 提取子串
 */
function applyExtract(data: any[], params: {
  column: string
  outputColumn: string
  startIndex: number
  length?: number
}): any[] {
  const { column, outputColumn, startIndex, length } = params
  return data.map(row => {
    const value = String(row[column] || '')
    const extracted = length !== undefined ? value.substr(startIndex, length) : value.substr(startIndex)
    return { ...row, [outputColumn]: extracted }
  })
}

/**
 * Regex Extract - 正则提取
 */
function applyRegexExtract(data: any[], params: {
  column: string
  outputColumn: string
  pattern: string
  groupIndex?: number
}): any[] {
  const { column, outputColumn, pattern, groupIndex = 0 } = params
  return data.map(row => {
    const value = String(row[column] || '')
    try {
      const match = value.match(new RegExp(pattern))
      const extracted = match ? match[groupIndex] || '' : ''
      return { ...row, [outputColumn]: extracted }
    } catch {
      return { ...row, [outputColumn]: '' }
    }
  })
}

/**
 * Pad String - 字符串填充
 */
function applyPadString(data: any[], params: {
  column: string
  length: number
  padChar?: string
  direction?: 'left' | 'right'
}): any[] {
  const { column, length, padChar = ' ', direction = 'left' } = params
  return data.map(row => {
    const value = String(row[column] || '')
    const padded = direction === 'left' ? value.padStart(length, padChar) : value.padEnd(length, padChar)
    return { ...row, [column]: padded }
  })
}

/**
 * Parse JSON - 解析JSON
 */
function applyParseJson(data: any[], params: {
  column: string
  outputColumns: string[]
}): any[] {
  const { column, outputColumns } = params
  return data.map(row => {
    const newRow = { ...row }
    try {
      const parsed = JSON.parse(row[column])
      outputColumns.forEach(col => {
        newRow[col] = parsed[col]
      })
    } catch {
      // JSON解析失败，设置为null
      outputColumns.forEach(col => {
        newRow[col] = null
      })
    }
    return newRow
  })
}

/**
 * Parse URL - 解析URL
 */
function applyParseUrl(data: any[], params: {
  column: string
  outputPrefix?: string
}): any[] {
  const { column, outputPrefix = 'url_' } = params
  return data.map(row => {
    const newRow = { ...row }
    try {
      const url = new URL(row[column])
      newRow[`${outputPrefix}protocol`] = url.protocol
      newRow[`${outputPrefix}host`] = url.host
      newRow[`${outputPrefix}pathname`] = url.pathname
      newRow[`${outputPrefix}search`] = url.search
      newRow[`${outputPrefix}hash`] = url.hash
    } catch {
      // URL解析失败
      newRow[`${outputPrefix}protocol`] = null
      newRow[`${outputPrefix}host`] = null
      newRow[`${outputPrefix}pathname`] = null
      newRow[`${outputPrefix}search`] = null
      newRow[`${outputPrefix}hash`] = null
    }
    return newRow
  })
}

// ============================================================================
// 新增数值处理函数
// ============================================================================

/**
 * Round - 四舍五入
 */
function applyRound(data: any[], params: {
  column: string
  decimals?: number
}): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  validateColumnIsNumeric(data, params.column)
  if (params.decimals !== undefined) {
    validateNonNegativeInteger('decimals', params.decimals)
  }

  const { column, decimals = 0 } = params
  const multiplier = Math.pow(10, decimals)
  return data.map(row => ({
    ...row,
    [column]: Math.round(Number(row[column]) * multiplier) / multiplier
  }))
}

/**
 * Floor - 向下取整
 */
function applyFloor(data: any[], params: { column: string }): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  validateColumnIsNumeric(data, params.column)

  const { column } = params
  return data.map(row => ({
    ...row,
    [column]: Math.floor(Number(row[column]))
  }))
}

/**
 * Ceiling - 向上取整
 */
function applyCeiling(data: any[], params: { column: string }): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  validateColumnIsNumeric(data, params.column)

  const { column } = params
  return data.map(row => ({
    ...row,
    [column]: Math.ceil(Number(row[column]))
  }))
}

/**
 * Absolute - 绝对值
 */
function applyAbsolute(data: any[], params: { column: string }): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column', params?.column)
  validateColumnExists(data, params.column)
  validateColumnIsNumeric(data, params.column)

  const { column } = params
  return data.map(row => ({
    ...row,
    [column]: Math.abs(Number(row[column]))
  }))
}

/**
 * Add - 加法
 */
function applyAdd(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
}): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column1', params?.column1)
  validateRequiredString('column2', params?.column2)
  validateRequiredString('outputColumn', params?.outputColumn)
  validateColumnsExist(data, [params.column1, params.column2])
  validateColumnsAreNumeric(data, [params.column1, params.column2])

  const { column1, column2, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Number(row[column1]) + Number(row[column2])
  }))
}

/**
 * Subtract - 减法
 */
function applySubtract(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
}): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column1', params?.column1)
  validateRequiredString('column2', params?.column2)
  validateRequiredString('outputColumn', params?.outputColumn)
  validateColumnsExist(data, [params.column1, params.column2])
  validateColumnsAreNumeric(data, [params.column1, params.column2])

  const { column1, column2, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Number(row[column1]) - Number(row[column2])
  }))
}

/**
 * Multiply - 乘法
 */
function applyMultiply(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
}): any[] {
  // Validation
  validateDataNotEmpty(data)
  validateRequiredString('column1', params?.column1)
  validateRequiredString('column2', params?.column2)
  validateRequiredString('outputColumn', params?.outputColumn)
  validateColumnsExist(data, [params.column1, params.column2])
  validateColumnsAreNumeric(data, [params.column1, params.column2])

  const { column1, column2, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Number(row[column1]) * Number(row[column2])
  }))
}

/**
 * Divide - 除法
 */
function applyDivide(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
}): any[] {
  const { column1, column2, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Number(row[column2]) !== 0 ? Number(row[column1]) / Number(row[column2]) : null
  }))
}

/**
 * Modulo - 取模
 */
function applyModulo(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
}): any[] {
  const { column1, column2, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Number(row[column1]) % Number(row[column2])
  }))
}

/**
 * Power - 幂运算
 */
function applyPower(data: any[], params: {
  column: string
  exponent: number
  outputColumn: string
}): any[] {
  const { column, exponent, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: Math.pow(Number(row[column]), exponent)
  }))
}

// ============================================================================
// 新增日期时间处理函数
// ============================================================================

/**
 * Format Date - 格式化日期
 */
function applyFormatDate(data: any[], params: {
  column: string
  format: string
}): any[] {
  const { column, format } = params
  return data.map(row => {
    const newRow = { ...row }
    try {
      const date = new Date(row[column])
      // 简单的日期格式化
      newRow[column] = format
        .replace('YYYY', date.getFullYear().toString())
        .replace('MM', String(date.getMonth() + 1).padStart(2, '0'))
        .replace('DD', String(date.getDate()).padStart(2, '0'))
        .replace('HH', String(date.getHours()).padStart(2, '0'))
        .replace('mm', String(date.getMinutes()).padStart(2, '0'))
        .replace('ss', String(date.getSeconds()).padStart(2, '0'))
    } catch {
      newRow[column] = null
    }
    return newRow
  })
}

/**
 * Parse Date - 解析日期
 */
function applyParseDate(data: any[], params: {
  column: string
  outputColumn?: string
}): any[] {
  const { column, outputColumn = column } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).toISOString()
  }))
}

/**
 * Extract Year - 提取年份
 */
function applyExtractYear(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).getFullYear()
  }))
}

/**
 * Extract Month - 提取月份
 */
function applyExtractMonth(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).getMonth() + 1
  }))
}

/**
 * Extract Day - 提取日期
 */
function applyExtractDay(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).getDate()
  }))
}

/**
 * Extract Hour - 提取小时
 */
function applyExtractHour(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).getHours()
  }))
}

/**
 * Extract Minute - 提取分钟
 */
function applyExtractMinute(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  return data.map(row => ({
    ...row,
    [outputColumn]: new Date(row[column]).getMinutes()
  }))
}

/**
 * Add Days - 添加天数
 */
function applyAddDays(data: any[], params: {
  column: string
  days: number
  outputColumn?: string
}): any[] {
  const { column, days, outputColumn = column } = params
  return data.map(row => {
    const date = new Date(row[column])
    date.setDate(date.getDate() + days)
    return { ...row, [outputColumn]: date.toISOString() }
  })
}

/**
 * Add Months - 添加月数
 */
function applyAddMonths(data: any[], params: {
  column: string
  months: number
  outputColumn?: string
}): any[] {
  const { column, months, outputColumn = column } = params
  return data.map(row => {
    const date = new Date(row[column])
    date.setMonth(date.getMonth() + months)
    return { ...row, [outputColumn]: date.toISOString() }
  })
}

/**
 * Add Years - 添加年数
 */
function applyAddYears(data: any[], params: {
  column: string
  years: number
  outputColumn?: string
}): any[] {
  const { column, years, outputColumn = column } = params
  return data.map(row => {
    const date = new Date(row[column])
    date.setFullYear(date.getFullYear() + years)
    return { ...row, [outputColumn]: date.toISOString() }
  })
}

/**
 * Date Diff - 日期差值
 */
function applyDateDiff(data: any[], params: {
  column1: string
  column2: string
  outputColumn: string
  unit?: 'days' | 'hours' | 'minutes'
}): any[] {
  const { column1, column2, outputColumn, unit = 'days' } = params
  const divisor = unit === 'days' ? 86400000 : unit === 'hours' ? 3600000 : 60000
  return data.map(row => {
    const date1 = new Date(row[column1]).getTime()
    const date2 = new Date(row[column2]).getTime()
    return { ...row, [outputColumn]: Math.floor((date1 - date2) / divisor) }
  })
}

// ============================================================================
// 新增高级操作函数
// ============================================================================

/**
 * Pivot - 数据透视
 */
function applyPivot(data: any[], params: {
  rowKey: string
  columnKey: string
  valueKey: string
  aggFunc?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}): any[] {
  const { rowKey, columnKey, valueKey, aggFunc = 'sum' } = params
  const pivoted = new Map()

  data.forEach(row => {
    const rowVal = row[rowKey]
    const colVal = row[columnKey]
    const value = Number(row[valueKey]) || 0

    if (!pivoted.has(rowVal)) {
      pivoted.set(rowVal, { [rowKey]: rowVal })
    }

    const pivotRow = pivoted.get(rowVal)
    if (!pivotRow[colVal]) {
      pivotRow[colVal] = []
    }
    pivotRow[colVal].push(value)
  })

  return Array.from(pivoted.values()).map(row => {
    const newRow = { ...row }
    Object.keys(row).forEach(key => {
      if (key !== rowKey && Array.isArray(row[key])) {
        const values = row[key]
        switch (aggFunc) {
          case 'sum':
            newRow[key] = values.reduce((a: number, b: number) => a + b, 0)
            break
          case 'avg':
            newRow[key] = values.reduce((a: number, b: number) => a + b, 0) / values.length
            break
          case 'count':
            newRow[key] = values.length
            break
          case 'min':
            newRow[key] = Math.min(...values)
            break
          case 'max':
            newRow[key] = Math.max(...values)
            break
        }
      }
    })
    return newRow
  })
}

/**
 * Unpivot - 逆透视
 */
function applyUnpivot(data: any[], params: {
  idColumns: string[]
  valueColumns: string[]
  variableColumn: string
  valueColumn: string
}): any[] {
  const { idColumns, valueColumns, variableColumn, valueColumn } = params
  const result: any[] = []

  data.forEach(row => {
    valueColumns.forEach(col => {
      const newRow: any = {}
      idColumns.forEach(idCol => {
        newRow[idCol] = row[idCol]
      })
      newRow[variableColumn] = col
      newRow[valueColumn] = row[col]
      result.push(newRow)
    })
  })

  return result
}

/**
 * Conditional Column - 条件列（if-then-else）
 */
function applyConditionalColumn(data: any[], params: {
  outputColumn: string
  conditions: Array<{ column: string; operator: string; value: any; result: any }>
  defaultValue: any
}): any[] {
  const { outputColumn, conditions, defaultValue } = params
  return data.map(row => {
    let result = defaultValue
    for (const condition of conditions) {
      const { column, operator, value, result: condResult } = condition
      const cellValue = row[column]

      let matched = false
      switch (operator) {
        case '=':
          matched = cellValue === value
          break
        case '!=':
          matched = cellValue !== value
          break
        case '>':
          matched = Number(cellValue) > Number(value)
          break
        case '>=':
          matched = Number(cellValue) >= Number(value)
          break
        case '<':
          matched = Number(cellValue) < Number(value)
          break
        case '<=':
          matched = Number(cellValue) <= Number(value)
          break
      }

      if (matched) {
        result = condResult
        break
      }
    }
    return { ...row, [outputColumn]: result }
  })
}

/**
 * Rank - 排名
 */
function applyRank(data: any[], params: {
  column: string
  outputColumn: string
  order?: 'asc' | 'desc'
}): any[] {
  const { column, outputColumn, order = 'desc' } = params
  const sorted = [...data].sort((a, b) => {
    const diff = Number(a[column]) - Number(b[column])
    return order === 'asc' ? diff : -diff
  })

  const ranks = new Map()
  sorted.forEach((row, index) => {
    ranks.set(row, index + 1)
  })

  return data.map(row => ({
    ...row,
    [outputColumn]: ranks.get(row)
  }))
}

/**
 * Row Number - 行号
 */
function applyRowNumber(data: any[], params: {
  outputColumn: string
  startFrom?: number
}): any[] {
  const { outputColumn, startFrom = 1 } = params
  return data.map((row, index) => ({
    ...row,
    [outputColumn]: index + startFrom
  }))
}

/**
 * Lag - 上一行
 */
function applyLag(data: any[], params: {
  column: string
  outputColumn: string
  offset?: number
  defaultValue?: any
}): any[] {
  const { column, outputColumn, offset = 1, defaultValue = null } = params
  return data.map((row, index) => ({
    ...row,
    [outputColumn]: index >= offset ? data[index - offset][column] : defaultValue
  }))
}

/**
 * Lead - 下一行
 */
function applyLead(data: any[], params: {
  column: string
  outputColumn: string
  offset?: number
  defaultValue?: any
}): any[] {
  const { column, outputColumn, offset = 1, defaultValue = null } = params
  return data.map((row, index) => ({
    ...row,
    [outputColumn]: index + offset < data.length ? data[index + offset][column] : defaultValue
  }))
}

/**
 * Cumulative Sum - 累计求和
 */
function applyCumSum(data: any[], params: {
  column: string
  outputColumn: string
}): any[] {
  const { column, outputColumn } = params
  let sum = 0
  return data.map(row => {
    sum += Number(row[column]) || 0
    return { ...row, [outputColumn]: sum }
  })
}

/**
 * Percentile - 百分位数
 */
function applyPercentile(data: any[], params: {
  column: string
  percentile: number
  outputColumn: string
}): any[] {
  const { column, percentile, outputColumn } = params
  const values = data.map(row => Number(row[column])).sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * values.length) - 1
  const percentileValue = values[Math.max(0, index)]

  return data.map(row => ({
    ...row,
    [outputColumn]: percentileValue
  }))
}
