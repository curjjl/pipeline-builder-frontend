/**
 * 数据导出工具
 * 支持 CSV, Excel (通过 CSV), JSON 格式
 */

export interface ExportOptions {
  filename?: string
  format: 'csv' | 'json' | 'excel'
  includeHeaders?: boolean
}

/**
 * 导出为 CSV 格式
 */
export function exportToCSV(data: any[], columns: any[], filename = 'export.csv') {
  try {
    // 构建 CSV 内容
    const headers = columns.map(col => col.name || col.title || col.dataIndex)
    const csvRows = []

    // 添加标题行
    csvRows.push(headers.map(escapeCSVValue).join(','))

    // 添加数据行
    data.forEach(row => {
      const values = columns.map(col => {
        const key = col.dataIndex || col.name
        const value = row[key]
        return escapeCSVValue(value)
      })
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')

    // 下载文件
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
  } catch (error: any) {
    throw new Error(`Failed to export CSV: ${error.message}`)
  }
}

/**
 * 导出为 Excel 格式 (实际上是 CSV，但使用 .xls 扩展名以便在 Excel 中打开)
 */
export function exportToExcel(data: any[], columns: any[], filename = 'export.xls') {
  try {
    // Excel 可以打开 CSV 文件，所以我们生成 CSV 格式但使用 .xls 扩展名
    const headers = columns.map(col => col.name || col.title || col.dataIndex)
    const csvRows = []

    // 添加 UTF-8 BOM 以便 Excel 正确识别编码
    csvRows.push('\uFEFF')

    // 添加标题行
    csvRows.push(headers.map(escapeCSVValue).join(','))

    // 添加数据行
    data.forEach(row => {
      const values = columns.map(col => {
        const key = col.dataIndex || col.name
        const value = row[key]
        return escapeCSVValue(value)
      })
      csvRows.push(values.join(','))
    })

    const csvContent = csvRows.join('\n')

    // 下载文件
    downloadFile(csvContent, filename, 'application/vnd.ms-excel;charset=utf-8;')
  } catch (error: any) {
    throw new Error(`Failed to export Excel: ${error.message}`)
  }
}

/**
 * 导出为 JSON 格式
 */
export function exportToJSON(data: any[], columns: any[], filename = 'export.json') {
  try {
    // 只导出指定列的数据
    const exportData = data.map(row => {
      const obj: any = {}
      columns.forEach(col => {
        const key = col.dataIndex || col.name
        obj[key] = row[key]
      })
      return obj
    })

    const jsonContent = JSON.stringify(exportData, null, 2)

    // 下载文件
    downloadFile(jsonContent, filename, 'application/json;charset=utf-8;')
  } catch (error: any) {
    throw new Error(`Failed to export JSON: ${error.message}`)
  }
}

/**
 * 转义 CSV 值
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  let str = String(value)

  // 如果包含逗号、引号或换行符，需要用引号包裹并转义引号
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"'
  }

  return str
}

/**
 * 触发文件下载
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  // 创建 Blob
  const blob = new Blob([content], { type: mimeType })

  // 创建下载链接
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'

  // 触发下载
  document.body.appendChild(link)
  link.click()

  // 清理
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

/**
 * 统一导出接口
 */
export function exportData(data: any[], columns: any[], options: ExportOptions) {
  const { format, filename } = options

  const baseFilename = filename || `export_${Date.now()}`

  switch (format) {
    case 'csv':
      exportToCSV(data, columns, baseFilename.endsWith('.csv') ? baseFilename : `${baseFilename}.csv`)
      break
    case 'excel':
      exportToExcel(data, columns, baseFilename.endsWith('.xls') ? baseFilename : `${baseFilename}.xls`)
      break
    case 'json':
      exportToJSON(data, columns, baseFilename.endsWith('.json') ? baseFilename : `${baseFilename}.json`)
      break
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}
