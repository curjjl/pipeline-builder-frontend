/**
 * 数据转换引擎
 * 支持各种数据清洗、转换、聚合操作
 */

export type TransformType =
  | 'filter'           // 筛选
  | 'select'           // 选择列（旧版）
  | 'selectColumns'    // 选择列（新版，支持include/exclude）
  | 'rename'           // 重命名列（旧版）
  | 'renameColumns'    // 重命名列（新版，支持批量）
  | 'cast'             // 类型转换
  | 'trim'             // 去除空白
  | 'split'            // 拆分列
  | 'join'             // 连接表
  | 'union'            // 合并表
  | 'groupBy'          // 分组聚合
  | 'sort'             // 排序
  | 'distinct'         // 去重
  | 'addColumn'        // 添加列
  | 'removeColumn'     // 删除列
  | 'fillNull'         // 填充空值
  | 'replace'          // 替换值

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
      case 'split':
        result = applySplit(data, params)
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
      case 'fillNull':
        result = applyFillNull(data, params)
        break
      case 'replace':
        result = applyReplace(data, params)
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
