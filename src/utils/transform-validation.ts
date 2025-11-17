/**
 * Transform Validation Utilities
 * Provides validation functions for all transform operations
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validate that data is not empty
 */
export function validateDataNotEmpty(data: any[]): void {
  if (!data || data.length === 0) {
    throw new ValidationError('Data is empty. Cannot apply transform to empty dataset.')
  }
}

/**
 * Validate that a column exists in the data
 */
export function validateColumnExists(data: any[], columnName: string): void {
  if (!data || data.length === 0) return

  const firstRow = data[0]
  if (!(columnName in firstRow)) {
    const availableColumns = Object.keys(firstRow).join(', ')
    throw new ValidationError(
      `Column "${columnName}" does not exist. Available columns: ${availableColumns}`
    )
  }
}

/**
 * Validate that multiple columns exist in the data
 */
export function validateColumnsExist(data: any[], columnNames: string[]): void {
  if (!data || data.length === 0 || !columnNames || columnNames.length === 0) return

  const firstRow = data[0]
  const availableColumns = Object.keys(firstRow)
  const missingColumns = columnNames.filter(col => !(col in firstRow))

  if (missingColumns.length > 0) {
    throw new ValidationError(
      `Column(s) not found: ${missingColumns.join(', ')}. Available columns: ${availableColumns.join(', ')}`
    )
  }
}

/**
 * Validate that a column contains numeric values
 */
export function validateColumnIsNumeric(data: any[], columnName: string): void {
  if (!data || data.length === 0) return

  validateColumnExists(data, columnName)

  // Check first few non-null values
  const sampleSize = Math.min(10, data.length)
  const samples = data.slice(0, sampleSize).filter(row => row[columnName] != null)

  if (samples.length === 0) {
    // All values are null, skip validation
    return
  }

  const hasNonNumeric = samples.some(row => {
    const value = row[columnName]
    return isNaN(Number(value)) || value === '' || value === null
  })

  if (hasNonNumeric) {
    throw new ValidationError(
      `Column "${columnName}" contains non-numeric values. This operation requires numeric data.`
    )
  }
}

/**
 * Validate that multiple columns contain numeric values
 */
export function validateColumnsAreNumeric(data: any[], columnNames: string[]): void {
  columnNames.forEach(col => validateColumnIsNumeric(data, col))
}

/**
 * Validate that a column contains date/time values
 */
export function validateColumnIsDate(data: any[], columnName: string): void {
  if (!data || data.length === 0) return

  validateColumnExists(data, columnName)

  // Check first few non-null values
  const sampleSize = Math.min(10, data.length)
  const samples = data.slice(0, sampleSize).filter(row => row[columnName] != null)

  if (samples.length === 0) {
    // All values are null, skip validation
    return
  }

  const hasInvalidDate = samples.some(row => {
    const value = row[columnName]
    if (value instanceof Date) return false

    const date = new Date(value)
    return isNaN(date.getTime())
  })

  if (hasInvalidDate) {
    throw new ValidationError(
      `Column "${columnName}" contains invalid date values. This operation requires valid dates.`
    )
  }
}

/**
 * Validate parameter is not null or undefined
 */
export function validateRequired(paramName: string, value: any): void {
  if (value === null || value === undefined) {
    throw new ValidationError(`Parameter "${paramName}" is required but was not provided.`)
  }
}

/**
 * Validate parameter is a non-empty string
 */
export function validateRequiredString(paramName: string, value: any): void {
  validateRequired(paramName, value)
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`Parameter "${paramName}" must be a non-empty string.`)
  }
}

/**
 * Validate parameter is a number
 */
export function validateNumber(paramName: string, value: any): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`Parameter "${paramName}" must be a valid number.`)
  }
}

/**
 * Validate parameter is a number within range
 */
export function validateNumberInRange(
  paramName: string,
  value: any,
  min?: number,
  max?: number
): void {
  validateNumber(paramName, value)

  if (min !== undefined && value < min) {
    throw new ValidationError(`Parameter "${paramName}" must be >= ${min}, got ${value}.`)
  }

  if (max !== undefined && value > max) {
    throw new ValidationError(`Parameter "${paramName}" must be <= ${max}, got ${value}.`)
  }
}

/**
 * Validate parameter is a positive integer
 */
export function validatePositiveInteger(paramName: string, value: any): void {
  validateNumber(paramName, value)
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`Parameter "${paramName}" must be a positive integer.`)
  }
}

/**
 * Validate parameter is a non-negative integer
 */
export function validateNonNegativeInteger(paramName: string, value: any): void {
  validateNumber(paramName, value)
  if (!Number.isInteger(value) || value < 0) {
    throw new ValidationError(`Parameter "${paramName}" must be a non-negative integer.`)
  }
}

/**
 * Validate parameter is an array
 */
export function validateArray(paramName: string, value: any): void {
  if (!Array.isArray(value)) {
    throw new ValidationError(`Parameter "${paramName}" must be an array.`)
  }
}

/**
 * Validate parameter is a non-empty array
 */
export function validateNonEmptyArray(paramName: string, value: any): void {
  validateArray(paramName, value)
  if (value.length === 0) {
    throw new ValidationError(`Parameter "${paramName}" must be a non-empty array.`)
  }
}

/**
 * Validate parameter is one of the allowed values
 */
export function validateEnum<T>(paramName: string, value: T, allowedValues: T[]): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `Parameter "${paramName}" must be one of: ${allowedValues.join(', ')}. Got: ${value}`
    )
  }
}

/**
 * Validate regular expression pattern
 */
export function validateRegex(paramName: string, pattern: string): void {
  validateRequiredString(paramName, pattern)
  try {
    new RegExp(pattern)
  } catch (error) {
    throw new ValidationError(`Parameter "${paramName}" is not a valid regular expression: ${pattern}`)
  }
}

/**
 * Validate column name doesn't already exist (for new columns)
 */
export function validateColumnNotExists(data: any[], columnName: string): void {
  if (!data || data.length === 0) return

  const firstRow = data[0]
  if (columnName in firstRow) {
    throw new ValidationError(
      `Column "${columnName}" already exists. Choose a different name or remove the existing column first.`
    )
  }
}

/**
 * Validate output columns don't conflict with existing columns
 */
export function validateOutputColumns(data: any[], outputColumns: string[]): void {
  if (!data || data.length === 0 || !outputColumns || outputColumns.length === 0) return

  const firstRow = data[0]
  const existingColumns = Object.keys(firstRow)
  const conflicts = outputColumns.filter(col => existingColumns.includes(col))

  if (conflicts.length > 0) {
    throw new ValidationError(
      `Output column(s) already exist: ${conflicts.join(', ')}. Choose different names.`
    )
  }
}

/**
 * Validate condition expression syntax (basic check)
 */
export function validateConditionExpression(paramName: string, expression: string): void {
  validateRequiredString(paramName, expression)

  // Basic syntax check - should contain comparison operators
  const validOperators = ['==', '!=', '>', '<', '>=', '<=', '&&', '||', 'includes', 'startsWith', 'endsWith']
  const hasOperator = validOperators.some(op => expression.includes(op))

  if (!hasOperator && !expression.includes('?')) {
    throw new ValidationError(
      `Parameter "${paramName}" appears to be an invalid condition expression. ` +
      `Expected comparison operators (==, !=, >, <, etc.) or ternary operator (?).`
    )
  }
}

/**
 * Validate JSON string
 */
export function validateJsonString(paramName: string, jsonStr: string): void {
  validateRequiredString(paramName, jsonStr)
  try {
    JSON.parse(jsonStr)
  } catch (error) {
    throw new ValidationError(`Parameter "${paramName}" is not valid JSON.`)
  }
}

/**
 * Validate date format string
 */
export function validateDateFormat(paramName: string, format: string): void {
  validateRequiredString(paramName, format)

  // Common date format tokens
  const validTokens = ['YYYY', 'YY', 'MM', 'M', 'DD', 'D', 'HH', 'H', 'mm', 'm', 'ss', 's', 'A', 'a']
  const hasValidToken = validTokens.some(token => format.includes(token))

  if (!hasValidToken) {
    throw new ValidationError(
      `Parameter "${paramName}" does not appear to be a valid date format. ` +
      `Expected tokens like YYYY, MM, DD, HH, mm, ss.`
    )
  }
}

/**
 * Comprehensive parameter validation for transform operations
 */
export function validateTransformParams(
  data: any[],
  transformType: string,
  params: any
): void {
  // This will be populated with specific validations for each transform type
  // in the main transform.ts file
  validateDataNotEmpty(data)

  if (!params) {
    throw new ValidationError(`Transform "${transformType}" requires parameters but none were provided.`)
  }
}
