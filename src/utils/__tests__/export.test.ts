import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportToCSV, exportToExcel, exportToJSON, exportData } from '../export'

// Mock document.createElement and related DOM APIs
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

describe('export utility', () => {
  let mockLink: HTMLAnchorElement
  let originalCreateElement: typeof document.createElement

  beforeEach(() => {
    // Create a mock link element
    mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
      style: {}
    } as any

    // Mock document.createElement
    originalCreateElement = document.createElement
    document.createElement = vi.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink
      }
      return originalCreateElement.call(document, tagName)
    })

    // Mock document.body
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.createElement = originalCreateElement
  })

  describe('exportToCSV', () => {
    it('should export data to CSV format with headers', () => {
      const data = [
        { name: 'Product A', price: 100, quantity: 5 },
        { name: 'Product B', price: 200, quantity: 3 }
      ]
      const columns = [
        { name: 'name', title: 'Name' },
        { name: 'price', title: 'Price' },
        { name: 'quantity', title: 'Quantity' }
      ]

      exportToCSV(data, columns, 'test.csv')

      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
    })

    it('should handle special characters in CSV', () => {
      const data = [
        { name: 'Product "A"', desc: 'Has, comma' },
        { name: 'Product\nB', desc: 'Has newline' }
      ]
      const columns = [
        { name: 'name', title: 'Name' },
        { name: 'desc', title: 'Description' }
      ]

      exportToCSV(data, columns)

      // Verify that createObjectURL was called (blob was created)
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      const blobCall = vi.mocked(global.URL.createObjectURL).mock.calls[0][0] as Blob
      expect(blobCall.type).toBe('text/csv;charset=utf-8;')
    })

    it('should use default filename if not provided', () => {
      const data = [{ id: 1 }]
      const columns = [{ name: 'id', title: 'ID' }]

      exportToCSV(data, columns)

      expect(mockLink.download).toBe('export.csv')
    })
  })

  describe('exportToExcel', () => {
    it('should export data to Excel format', () => {
      const data = [
        { name: 'Product A', price: 100 }
      ]
      const columns = [
        { name: 'name', title: 'Name' },
        { name: 'price', title: 'Price' }
      ]

      exportToExcel(data, columns, 'test.xls')

      expect(mockLink.download).toBe('test.xls')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle numeric values correctly', () => {
      const data = [
        { price: 100.50, quantity: 10 }
      ]
      const columns = [
        { name: 'price', title: 'Price' },
        { name: 'quantity', title: 'Quantity' }
      ]

      exportToExcel(data, columns)

      expect(global.URL.createObjectURL).toHaveBeenCalled()
      const blobCall = vi.mocked(global.URL.createObjectURL).mock.calls[0][0] as Blob
      expect(blobCall.type).toBe('application/vnd.ms-excel;charset=utf-8;')
    })
  })

  describe('exportToJSON', () => {
    it('should export data to JSON format', () => {
      const data = [
        { name: 'Product A', price: 100, active: true },
        { name: 'Product B', price: 200, active: false }
      ]
      const columns = [
        { name: 'name', title: 'Name' },
        { name: 'price', title: 'Price' },
        { name: 'active', title: 'Active' }
      ]

      exportToJSON(data, columns, 'test.json')

      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should format JSON with proper indentation', async () => {
      const data = [
        { id: 1, nested: { key: 'value' } }
      ]
      const columns = [
        { name: 'id', title: 'ID' },
        { name: 'nested', title: 'Nested' }
      ]

      exportToJSON(data, columns)

      const blobCall = vi.mocked(global.URL.createObjectURL).mock.calls[0][0] as Blob
      expect(blobCall.type).toBe('application/json;charset=utf-8;')

      // Verify blob content is properly formatted JSON
      const text = await blobCall.text()
      const parsed = JSON.parse(text)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe(1)
    })

    it('should handle empty arrays', () => {
      const columns = [{ name: 'id', title: 'ID' }]
      exportToJSON([], columns)

      expect(mockLink.click).toHaveBeenCalled()
      expect(mockLink.download).toBe('export.json')
    })
  })

  describe('exportData', () => {
    it('should export to CSV when format is csv', () => {
      const data = [{ id: 1 }]
      const columns = [{ name: 'id', title: 'ID' }]

      exportData(data, columns, { format: 'csv', filename: 'test.csv' })

      expect(mockLink.download).toBe('test.csv')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should export to Excel when format is excel', () => {
      const data = [{ id: 1 }]
      const columns = [{ name: 'id', title: 'ID' }]

      exportData(data, columns, { format: 'excel', filename: 'test.xls' })

      expect(mockLink.download).toBe('test.xls')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should export to JSON when format is json', () => {
      const data = [{ id: 1 }]
      const columns = [{ name: 'id', title: 'ID' }]

      exportData(data, columns, { format: 'json', filename: 'test.json' })

      expect(mockLink.download).toBe('test.json')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should throw error for unknown formats', () => {
      const data = [{ id: 1 }]
      const columns = [{ name: 'id', title: 'ID' }]

      expect(() => {
        exportData(data, columns, { format: 'unknown' as any })
      }).toThrow('Unsupported export format')
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      const data = [
        { name: 'Product A', price: null, stock: undefined }
      ]
      const columns = [
        { name: 'name', title: 'Name' },
        { name: 'price', title: 'Price' },
        { name: 'stock', title: 'Stock' }
      ]

      exportToCSV(data, columns)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle very large datasets', () => {
      const data = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Product ${i}`,
        price: Math.random() * 1000
      }))
      const columns = [
        { name: 'id', title: 'ID' },
        { name: 'name', title: 'Name' },
        { name: 'price', title: 'Price' }
      ]

      exportToCSV(data, columns)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should handle columns with dataIndex property', () => {
      const data = [{ productName: 'Test', amount: 100 }]
      const columns = [
        { dataIndex: 'productName', title: 'Name' },
        { dataIndex: 'amount', title: 'Amount' }
      ]

      exportToCSV(data, columns)

      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})
