/**
 * 模拟数据集
 * 包含3张表：products（产品）、customers（客户）、transactions（交易）
 */

export interface Product {
  product_id: string
  product_name: string
  category: string
  price: number
  cost: number
  stock: number
  supplier: string
  created_at: string
}

export interface Customer {
  customer_id: string
  name: string
  email: string
  phone: string
  registration_date: string
  city: string
  country: string
  lifetime_value: number
  segment: string
}

export interface Transaction {
  transaction_id: string
  customer_id: string
  product_id: string
  quantity: number
  total_amount: number
  discount: number
  transaction_date: string
  payment_method: string
  status: string
}

// Products 表数据
export const productsData: Product[] = [
  {
    product_id: 'P001',
    product_name: 'Intelligent Concrete Towels',
    category: 'Kids',
    price: 987.00,
    cost: 450.00,
    stock: 234,
    supplier: 'Acme Corp',
    created_at: '2024-01-15'
  },
  {
    product_id: 'P002',
    product_name: 'Luxurious Wooden Mouse',
    category: 'Music',
    price: 493.00,
    cost: 250.00,
    stock: 156,
    supplier: 'Global Supplies',
    created_at: '2024-01-20'
  },
  {
    product_id: 'P003',
    product_name: 'Oriental Fresh Sausages',
    category: 'Shoes',
    price: 383.00,
    cost: 180.00,
    stock: 445,
    supplier: 'Premium Goods',
    created_at: '2024-02-01'
  },
  {
    product_id: 'P004',
    product_name: 'Awesome Bronze Towels',
    category: 'Home',
    price: 385.00,
    cost: 190.00,
    stock: 89,
    supplier: 'Home Essentials',
    created_at: '2024-02-10'
  },
  {
    product_id: 'P005',
    product_name: 'Luxurious Wooden Mouse',
    category: 'Health',
    price: 526.00,
    cost: 280.00,
    stock: 267,
    supplier: 'Health Plus',
    created_at: '2024-02-15'
  },
  {
    product_id: 'P006',
    product_name: 'Luxurious Wooden Mouse',
    category: 'Toys',
    price: 418.00,
    cost: 210.00,
    stock: 178,
    supplier: 'Toy World',
    created_at: '2024-03-01'
  },
  {
    product_id: 'P007',
    product_name: 'Awesome Concrete Sausages',
    category: 'Home',
    price: 872.00,
    cost: 420.00,
    stock: 334,
    supplier: 'Home Essentials',
    created_at: '2024-03-10'
  },
  {
    product_id: 'P008',
    product_name: 'Fantastic Rubber Cheese',
    category: 'Industrial',
    price: 304.00,
    cost: 150.00,
    stock: 556,
    supplier: 'Industrial Supply',
    created_at: '2024-03-15'
  },
  {
    product_id: 'P009',
    product_name: 'Intelligent Soft Table',
    category: 'Jewelery',
    price: 432.00,
    cost: 220.00,
    stock: 123,
    supplier: 'Jewelry Store',
    created_at: '2024-03-20'
  },
  {
    product_id: 'P010',
    product_name: 'Fantastic Rubber Cheese',
    category: 'Baby',
    price: 631.00,
    cost: 310.00,
    stock: 445,
    supplier: 'Baby Care',
    created_at: '2024-04-01'
  },
  {
    product_id: 'P011',
    product_name: 'Oriental Fresh Sausages',
    category: 'Sports',
    price: 351.00,
    cost: 170.00,
    stock: 289,
    supplier: 'Sports Arena',
    created_at: '2024-04-10'
  },
  {
    product_id: 'P012',
    product_name: 'Small Rubber Shoes',
    category: 'Beauty',
    price: 564.00,
    cost: 280.00,
    stock: 167,
    supplier: 'Beauty Brands',
    created_at: '2024-04-15'
  }
]

// Customers 表数据
export const customersData: Customer[] = [
  {
    customer_id: 'C001',
    name: "Margaret O'Kon",
    email: 'margaret.okonexample.com',
    phone: '+1-555-0101',
    registration_date: '2024-01-10',
    city: 'New York',
    country: 'USA',
    lifetime_value: 5420.50,
    segment: 'Premium'
  },
  {
    customer_id: 'C002',
    name: 'Jim Barber',
    email: 'jim.barber@example.com',
    phone: '+1-555-0102',
    registration_date: '2024-01-15',
    city: 'Los Angeles',
    country: 'USA',
    lifetime_value: 3280.00,
    segment: 'Standard'
  },
  {
    customer_id: 'C003',
    name: 'Marly Lockman',
    email: 'marly.lockman@example.com',
    phone: '+1-555-0103',
    registration_date: '2024-01-20',
    city: 'Chicago',
    country: 'USA',
    lifetime_value: 7650.75,
    segment: 'VIP'
  },
  {
    customer_id: 'C004',
    name: 'Kristian Baxter',
    email: 'kristian.baxter@example.com',
    phone: '+1-555-0104',
    registration_date: '2024-02-01',
    city: 'Houston',
    country: 'USA',
    lifetime_value: 2100.00,
    segment: 'Standard'
  },
  {
    customer_id: 'C005',
    name: 'Mr. Kristen Bins',
    email: 'kristen.bins@example.com',
    phone: '+1-555-0105',
    registration_date: '2024-02-05',
    city: 'Phoenix',
    country: 'USA',
    lifetime_value: 4890.25,
    segment: 'Premium'
  },
  {
    customer_id: 'C006',
    name: 'Garrett Braun',
    email: 'garrett.braun@example.com',
    phone: '+1-555-0106',
    registration_date: '2024-02-10',
    city: 'Philadelphia',
    country: 'USA',
    lifetime_value: 1850.00,
    segment: 'Standard'
  },
  {
    customer_id: 'C007',
    name: 'Stan Nicolette',
    email: 'stan.nicolette@example.com',
    phone: '+1-555-0107',
    registration_date: '2024-02-15',
    city: 'San Antonio',
    country: 'USA',
    lifetime_value: 9320.50,
    segment: 'VIP'
  },
  {
    customer_id: 'C008',
    name: 'Dr. Brett Monohan I',
    email: 'brett.monohan@example.com',
    phone: '+1-555-0108',
    registration_date: '2024-02-20',
    city: 'San Diego',
    country: 'USA',
    lifetime_value: 3540.00,
    segment: 'Standard'
  },
  {
    customer_id: 'C009',
    name: 'Courtney Schneider',
    email: 'courtney.schneider@example.com',
    phone: '+1-555-0109',
    registration_date: '2024-03-01',
    city: 'Dallas',
    country: 'USA',
    lifetime_value: 6210.75,
    segment: 'Premium'
  },
  {
    customer_id: 'C010',
    name: 'Sue Larson',
    email: 'sue.larson@example.com',
    phone: '+1-555-0110',
    registration_date: '2024-03-05',
    city: 'San Jose',
    country: 'USA',
    lifetime_value: 4120.00,
    segment: 'Premium'
  }
]

// Transactions 表数据
export const transactionsData: Transaction[] = [
  {
    transaction_id: 'T001',
    customer_id: 'C001',
    product_id: 'P001',
    quantity: 2,
    total_amount: 1974.00,
    discount: 0.00,
    transaction_date: '2024-03-15',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T002',
    customer_id: 'C002',
    product_id: 'P002',
    quantity: 1,
    total_amount: 493.00,
    discount: 49.30,
    transaction_date: '2024-03-16',
    payment_method: 'PayPal',
    status: 'Completed'
  },
  {
    transaction_id: 'T003',
    customer_id: 'C003',
    product_id: 'P003',
    quantity: 3,
    total_amount: 1149.00,
    discount: 0.00,
    transaction_date: '2024-03-17',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T004',
    customer_id: 'C001',
    product_id: 'P004',
    quantity: 1,
    total_amount: 385.00,
    discount: 38.50,
    transaction_date: '2024-03-18',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T005',
    customer_id: 'C004',
    product_id: 'P005',
    quantity: 2,
    total_amount: 1052.00,
    discount: 0.00,
    transaction_date: '2024-03-19',
    payment_method: 'Debit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T006',
    customer_id: 'C005',
    product_id: 'P001',
    quantity: 1,
    total_amount: 987.00,
    discount: 98.70,
    transaction_date: '2024-03-20',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T007',
    customer_id: 'C006',
    product_id: 'P006',
    quantity: 2,
    total_amount: 836.00,
    discount: 0.00,
    transaction_date: '2024-03-21',
    payment_method: 'PayPal',
    status: 'Completed'
  },
  {
    transaction_id: 'T008',
    customer_id: 'C007',
    product_id: 'P007',
    quantity: 1,
    total_amount: 872.00,
    discount: 0.00,
    transaction_date: '2024-03-22',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T009',
    customer_id: 'C003',
    product_id: 'P008',
    quantity: 4,
    total_amount: 1216.00,
    discount: 121.60,
    transaction_date: '2024-03-23',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T010',
    customer_id: 'C008',
    product_id: 'P009',
    quantity: 1,
    total_amount: 432.00,
    discount: 0.00,
    transaction_date: '2024-03-24',
    payment_method: 'Debit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T011',
    customer_id: 'C009',
    product_id: 'P010',
    quantity: 2,
    total_amount: 1262.00,
    discount: 0.00,
    transaction_date: '2024-03-25',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T012',
    customer_id: 'C010',
    product_id: 'P002',
    quantity: 1,
    total_amount: 493.00,
    discount: 0.00,
    transaction_date: '2024-03-26',
    payment_method: 'PayPal',
    status: 'Pending'
  },
  {
    transaction_id: 'T013',
    customer_id: 'C001',
    product_id: 'P011',
    quantity: 3,
    total_amount: 1053.00,
    discount: 105.30,
    transaction_date: '2024-03-27',
    payment_method: 'Credit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T014',
    customer_id: 'C002',
    product_id: 'P012',
    quantity: 1,
    total_amount: 564.00,
    discount: 0.00,
    transaction_date: '2024-03-28',
    payment_method: 'Debit Card',
    status: 'Completed'
  },
  {
    transaction_id: 'T015',
    customer_id: 'C005',
    product_id: 'P003',
    quantity: 2,
    total_amount: 766.00,
    discount: 76.60,
    transaction_date: '2024-03-29',
    payment_method: 'Credit Card',
    status: 'Completed'
  }
]

// 数据集元信息
export interface DatasetMeta {
  id: string
  name: string
  displayName: string
  columns: ColumnMeta[]
  rowCount: number
  description: string
}

export interface ColumnMeta {
  name: string
  type: 'String' | 'Number' | 'Date' | 'Boolean'
  nullable: boolean
  description?: string
}

export const datasetsMeta: DatasetMeta[] = [
  {
    id: 'products',
    name: 'products',
    displayName: 'Products',
    description: '产品信息表，包含产品ID、名称、分类、价格等信息',
    rowCount: productsData.length,
    columns: [
      { name: 'product_id', type: 'String', nullable: false, description: '产品唯一标识' },
      { name: 'product_name', type: 'String', nullable: false, description: '产品名称' },
      { name: 'category', type: 'String', nullable: false, description: '产品分类' },
      { name: 'price', type: 'Number', nullable: false, description: '售价' },
      { name: 'cost', type: 'Number', nullable: false, description: '成本' },
      { name: 'stock', type: 'Number', nullable: false, description: '库存数量' },
      { name: 'supplier', type: 'String', nullable: false, description: '供应商' },
      { name: 'created_at', type: 'Date', nullable: false, description: '创建日期' }
    ]
  },
  {
    id: 'customers',
    name: 'customers',
    displayName: 'Customers',
    description: '客户信息表，包含客户ID、姓名、联系方式等信息',
    rowCount: customersData.length,
    columns: [
      { name: 'customer_id', type: 'String', nullable: false, description: '客户唯一标识' },
      { name: 'name', type: 'String', nullable: false, description: '客户姓名' },
      { name: 'email', type: 'String', nullable: false, description: '电子邮箱' },
      { name: 'phone', type: 'String', nullable: false, description: '电话号码' },
      { name: 'registration_date', type: 'Date', nullable: false, description: '注册日期' },
      { name: 'city', type: 'String', nullable: false, description: '城市' },
      { name: 'country', type: 'String', nullable: false, description: '国家' },
      { name: 'lifetime_value', type: 'Number', nullable: false, description: '终身价值' },
      { name: 'segment', type: 'String', nullable: false, description: '客户分层' }
    ]
  },
  {
    id: 'transactions',
    name: 'transactions',
    displayName: 'Transactions',
    description: '交易记录表，包含交易ID、客户、产品、金额等信息',
    rowCount: transactionsData.length,
    columns: [
      { name: 'transaction_id', type: 'String', nullable: false, description: '交易唯一标识' },
      { name: 'customer_id', type: 'String', nullable: false, description: '客户ID' },
      { name: 'product_id', type: 'String', nullable: false, description: '产品ID' },
      { name: 'quantity', type: 'Number', nullable: false, description: '购买数量' },
      { name: 'total_amount', type: 'Number', nullable: false, description: '总金额' },
      { name: 'discount', type: 'Number', nullable: false, description: '折扣金额' },
      { name: 'transaction_date', type: 'Date', nullable: false, description: '交易日期' },
      { name: 'payment_method', type: 'String', nullable: false, description: '支付方式' },
      { name: 'status', type: 'String', nullable: false, description: '交易状态' }
    ]
  }
]

// 获取数据集数据
export function getDatasetData(datasetId: string): any[] {
  switch (datasetId) {
    case 'products':
      return productsData
    case 'customers':
      return customersData
    case 'transactions':
      return transactionsData
    default:
      return []
  }
}

// 获取数据集元信息
export function getDatasetMeta(datasetId: string): DatasetMeta | undefined {
  return datasetsMeta.find(meta => meta.id === datasetId)
}

// 用户导入的数据集（内存存储）
const userDatasets: Map<string, {meta: DatasetMeta; data: any[]}> = new Map()

// 添加用户导入的数据集
export function addUserDataset(name: string, data: any[], columns: string[]): string {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 推断列类型
  const columnMetas: ColumnMeta[] = columns.map(col => {
    const sampleValue = data[0]?.[col]
    let type: 'String' | 'Number' | 'Date' | 'Boolean' = 'String'

    if (typeof sampleValue === 'number') {
      type = 'Number'
    } else if (typeof sampleValue === 'boolean') {
      type = 'Boolean'
    } else if (sampleValue instanceof Date || !isNaN(Date.parse(sampleValue))) {
      type = 'Date'
    }

    return {
      name: col,
      type,
      nullable: true
    }
  })

  const meta: DatasetMeta = {
    id,
    name: id,
    displayName: name,
    description: `User imported dataset: ${name}`,
    rowCount: data.length,
    columns: columnMetas
  }

  userDatasets.set(id, { meta, data })
  return id
}

// 获取数据集数据（支持用户数据集）
export function getDatasetDataById(datasetId: string): any[] {
  // 先检查用户数据集
  const userDataset = userDatasets.get(datasetId)
  if (userDataset) {
    return userDataset.data
  }

  // 再检查内置数据集
  switch (datasetId) {
    case 'products':
      return productsData
    case 'customers':
      return customersData
    case 'transactions':
      return transactionsData
    default:
      return []
  }
}

// 获取数据集元信息（支持用户数据集）
export function getDatasetMetaById(datasetId: string): DatasetMeta | undefined {
  // 先检查用户数据集
  const userDataset = userDatasets.get(datasetId)
  if (userDataset) {
    return userDataset.meta
  }

  // 再检查内置数据集
  return datasetsMeta.find(meta => meta.id === datasetId)
}

// 获取所有数据集列表（包含用户数据集）
export function getAllDatasets(): DatasetMeta[] {
  const userMetas = Array.from(userDatasets.values()).map(ds => ds.meta)
  return [...datasetsMeta, ...userMetas]
}
