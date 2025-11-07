# Pipeline Builder - 前后端数据规范与API设计

> 完整的数据结构定义、JSON Schema 规范和 API 接口设计
>
> 版本：v1.0
> 创建时间：2025年

## 目录

1. [核心概念](#1-核心概念)
2. [Pipeline 数据结构](#2-pipeline-数据结构)
3. [节点类型定义](#3-节点类型定义)
4. [API 接口规范](#4-api-接口规范)
5. [版本控制](#5-版本控制)
6. [数据验证规则](#6-数据验证规则)
7. [示例数据](#7-示例数据)

---

## 1. 核心概念

### 1.1 设计原则

1. **统一性** - 所有节点遵循统一的数据结构
2. **可扩展性** - 支持自定义节点类型
3. **向后兼容** - Schema版本化管理
4. **类型安全** - 完整的TypeScript类型定义
5. **可验证性** - JSON Schema验证支持

### 1.2 核心实体

```
Pipeline (管道)
├── Metadata (元信息)
├── Graph (图结构)
│   ├── Nodes (节点列表)
│   └── Edges (边列表)
├── Configuration (配置)
└── Execution (执行信息)
```

---

## 2. Pipeline 数据结构

### 2.1 Pipeline 完整定义

```typescript
/**
 * Pipeline 完整数据结构
 */
interface Pipeline {
  // ===== 基础信息 =====
  id: string                      // Pipeline唯一标识 (UUID)
  name: string                    // Pipeline名称
  description?: string            // 描述说明
  version: string                 // Schema版本号，如 "1.0.0"

  // ===== 元信息 =====
  metadata: PipelineMetadata

  // ===== 图结构 =====
  graph: PipelineGraph

  // ===== 配置 =====
  configuration: PipelineConfiguration

  // ===== 执行信息（只读，由后端维护）=====
  execution?: PipelineExecution

  // ===== 审计信息 =====
  createdAt: string               // ISO 8601格式，如 "2025-01-15T10:30:00Z"
  updatedAt: string
  createdBy: string               // 创建者ID
  updatedBy: string
}
```

### 2.2 Pipeline 元信息

```typescript
interface PipelineMetadata {
  // 分类与标签
  category: string                // 分类，如 "ETL", "Analytics", "ML"
  tags: string[]                  // 标签列表，如 ["production", "daily"]

  // 所有者与权限
  owner: string                   // 所有者用户ID
  team?: string                   // 所属团队
  visibility: "private" | "team" | "public"

  // 状态
  status: "draft" | "published" | "deprecated"

  // 文档
  documentation?: {
    readme?: string               // Markdown格式文档
    changeLog?: string            // 更新日志
    externalLinks?: {
      name: string
      url: string
    }[]
  }
}
```

### 2.3 Pipeline 图结构

```typescript
interface PipelineGraph {
  // 节点列表
  nodes: Node[]

  // 边列表
  edges: Edge[]

  // 布局信息（可选，用于保存画布布局）
  layout?: {
    zoom: number                  // 缩放比例，如 1.0
    center: {                     // 画布中心点
      x: number
      y: number
    }
  }

  // 分组信息（可选）
  groups?: NodeGroup[]
}
```

### 2.4 Pipeline 配置

```typescript
interface PipelineConfiguration {
  // 执行配置
  execution?: {
    mode: "sequential" | "parallel" | "auto"  // 执行模式
    timeout?: number              // 超时时间（秒）
    retryPolicy?: {
      maxRetries: number
      retryDelay: number          // 重试延迟（秒）
      exponentialBackoff: boolean
    }
  }

  // 调度配置（可选）
  schedule?: {
    enabled: boolean
    cron: string                  // Cron表达式，如 "0 0 * * *"
    timezone: string              // 时区，如 "Asia/Shanghai"
  }

  // 通知配置（可选）
  notifications?: {
    onSuccess?: NotificationConfig[]
    onFailure?: NotificationConfig[]
  }

  // 环境变量（可选）
  environment?: Record<string, string>

  // 全局参数（可选）
  parameters?: Record<string, any>
}

interface NotificationConfig {
  type: "email" | "slack" | "webhook"
  config: Record<string, any>
}
```

### 2.5 Pipeline 执行信息

```typescript
interface PipelineExecution {
  // 最近执行
  lastExecution?: {
    executionId: string
    status: "running" | "completed" | "failed" | "stopped"
    startedAt: string
    completedAt?: string
    duration?: number             // 执行时长（秒）
    error?: string
  }

  // 统计信息
  statistics: {
    totalExecutions: number
    successCount: number
    failureCount: number
    averageDuration: number       // 平均执行时长（秒）
  }

  // 健康状态
  health: "healthy" | "warning" | "error" | "unknown"
}
```

---

## 3. 节点类型定义

### 3.1 节点通用结构

```typescript
/**
 * 节点通用结构
 * 所有节点类型都遵循此基础结构
 */
interface Node {
  // ===== 基础标识 =====
  id: string                      // 节点唯一标识 (UUID)
  type: NodeType                  // 节点类型

  // ===== 显示信息 =====
  label: string                   // 节点显示名称
  description?: string            // 节点描述

  // ===== 位置信息 =====
  position: {
    x: number                     // X坐标
    y: number                     // Y坐标
  }

  // ===== 尺寸信息（可选）=====
  size?: {
    width: number
    height: number
  }

  // ===== 端口定义 =====
  ports: {
    input: Port[]                 // 输入端口
    output: Port[]                // 输出端口
  }

  // ===== 节点配置（根据type不同而不同）=====
  config: NodeConfig              // 具体配置见各节点类型定义

  // ===== 元信息 =====
  metadata: {
    color?: string                // 节点颜色（16进制）
    icon?: string                 // 图标名称或URL
    collapsed?: boolean           // 是否折叠（用于复杂节点）
    tags?: string[]               // 标签
  }

  // ===== 状态信息（运行时，只读）=====
  runtime?: {
    status: "idle" | "running" | "completed" | "failed"
    error?: string
    startedAt?: string
    completedAt?: string
  }

  // ===== 审计信息 =====
  createdAt: string
  updatedAt: string
}

/**
 * 节点类型枚举
 */
type NodeType =
  // 数据源
  | "dataset"                     // 数据集
  | "database-source"             // 数据库源
  | "api-source"                  // API数据源
  | "file-source"                 // 文件源

  // 转换
  | "sql-transform"               // SQL转换
  | "python-transform"            // Python脚本转换
  | "javascript-transform"        // JavaScript转换
  | "filter"                      // 数据筛选
  | "aggregate"                   // 数据聚合
  | "join"                        // 数据连接
  | "union"                       // 数据合并
  | "pivot"                       // 数据透视

  // 输出
  | "dataset-output"              // 输出到数据集
  | "database-sink"               // 输出到数据库
  | "api-sink"                    // 输出到API
  | "file-sink"                   // 输出到文件

  // 控制流
  | "condition"                   // 条件分支
  | "loop"                        // 循环
  | "group"                       // 分组容器

  // 其他
  | "custom"                      // 自定义节点
```

### 3.2 端口定义

```typescript
interface Port {
  id: string                      // 端口唯一标识
  label?: string                  // 端口标签

  // 数据类型约束（可选）
  dataType?: {
    type: "table" | "json" | "file" | "stream" | "any"
    schema?: DataSchema           // 数据Schema定义
  }

  // 连接约束
  multiple: boolean               // 是否允许多个连接
  required: boolean               // 是否必需连接

  // 位置（相对于节点，可选）
  position?: {
    side: "top" | "right" | "bottom" | "left"
    offset?: number               // 偏移量（0-1之间的比例）
  }
}
```

### 3.3 数据Schema定义

```typescript
interface DataSchema {
  type: "object" | "array"
  properties?: Record<string, DataColumn>
  items?: DataSchema              // 用于array类型
}

interface DataColumn {
  name: string
  type: "string" | "number" | "boolean" | "date" | "object" | "array"
  nullable?: boolean
  description?: string
  format?: string                 // 如 "date-time", "email", "uri"
}
```

### 3.4 具体节点类型配置

#### 3.4.1 Dataset Node（数据集节点）

```typescript
interface DatasetNodeConfig {
  // 数据集标识
  datasetId: string               // 数据集ID
  datasetName: string             // 数据集名称

  // 数据源信息
  source: {
    type: "foundry" | "external"
    path?: string                 // 数据集路径
  }

  // 快照配置
  snapshot: {
    enabled: boolean
    type: "latest" | "specific" | "transaction"
    value?: string                // 具体快照ID或transaction ID
  }

  // 列选择（可选）
  columns?: {
    mode: "all" | "include" | "exclude"
    list?: string[]               // 列名列表
  }

  // 数据Schema（自动推断或手动定义）
  schema?: DataSchema
}
```

#### 3.4.2 SQL Transform Node（SQL转换节点）

```typescript
interface SqlTransformNodeConfig {
  // SQL语句
  sql: string                     // SQL查询语句

  // 语言方言
  dialect: "standard" | "spark" | "postgres" | "mysql"

  // 输入别名映射
  inputAliases: Record<string, string>  // { [portId]: alias }
  // 例如: { "input-1": "table_a", "input-2": "table_b" }

  // 输出Schema（可选，可自动推断）
  outputSchema?: DataSchema

  // 验证配置
  validation?: {
    enabled: boolean
    checkSyntax: boolean
    checkSchema: boolean
  }

  // 优化提示
  hints?: string[]                // SQL优化提示
}
```

#### 3.4.3 Python Transform Node（Python转换节点）

```typescript
interface PythonTransformNodeConfig {
  // Python代码
  code: string                    // Python脚本

  // 运行时环境
  runtime: {
    version: "3.8" | "3.9" | "3.10" | "3.11"
    requirements?: string[]       // pip包依赖，如 ["pandas==1.5.0", "numpy"]
  }

  // 输入参数映射
  inputMappings: Record<string, string>  // { [portId]: variableName }
  // 例如: { "input-1": "df1", "input-2": "df2" }

  // 输出变量名
  outputVariable: string          // 如 "result_df"

  // 输出Schema（可选）
  outputSchema?: DataSchema

  // 超时配置
  timeout?: number                // 执行超时（秒）

  // 资源限制
  resources?: {
    memory?: string               // 如 "2Gi"
    cpu?: string                  // 如 "1"
  }
}
```

#### 3.4.4 Filter Node（筛选节点）

```typescript
interface FilterNodeConfig {
  // 筛选模式
  mode: "simple" | "advanced"

  // 简单模式：条件列表（AND关系）
  conditions?: FilterCondition[]

  // 高级模式：表达式
  expression?: string             // 如 "(age > 18 AND city = 'Beijing') OR vip = true"
}

interface FilterCondition {
  column: string                  // 列名
  operator: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "not_in" | "contains" | "starts_with" | "ends_with"
  value: any                      // 比较值
  dataType?: "string" | "number" | "boolean" | "date"
}
```

#### 3.4.5 Join Node（连接节点）

```typescript
interface JoinNodeConfig {
  // 连接类型
  joinType: "inner" | "left" | "right" | "full" | "cross"

  // 连接条件
  conditions: JoinCondition[]

  // 输出列选择
  outputColumns?: {
    mode: "all" | "custom"
    columns?: ColumnMapping[]
  }
}

interface JoinCondition {
  leftColumn: string              // 左表列名
  rightColumn: string             // 右表列名
  operator: "=" | "!=" | ">" | ">=" | "<" | "<="
}

interface ColumnMapping {
  sourcePort: string              // 源端口ID
  sourceColumn: string            // 源列名
  outputName: string              // 输出列名（可重命名）
}
```

#### 3.4.6 Database Source Node（数据库源节点）

```typescript
interface DatabaseSourceNodeConfig {
  // 连接信息
  connection: {
    id: string                    // 连接ID（引用预配置的连接）
    type: "mysql" | "postgresql" | "oracle" | "sqlserver" | "mongodb"
  }

  // 查询配置
  query: {
    type: "table" | "sql" | "stored_procedure"

    // table模式
    tableName?: string
    schema?: string               // 数据库schema

    // sql模式
    sql?: string

    // 存储过程模式
    procedureName?: string
    parameters?: Record<string, any>
  }

  // 增量配置（可选）
  incremental?: {
    enabled: boolean
    column: string                // 增量列
    mode: "append" | "upsert"
    primaryKey?: string[]
  }

  // 输出Schema
  schema?: DataSchema
}
```

### 3.5 边（连接）定义

```typescript
/**
 * 边（Edge）数据结构
 */
interface Edge {
  // ===== 基础标识 =====
  id: string                      // 边唯一标识 (UUID)

  // ===== 连接信息 =====
  source: {
    nodeId: string                // 源节点ID
    portId: string                // 源端口ID
  }

  target: {
    nodeId: string                // 目标节点ID
    portId: string                // 目标端口ID
  }

  // ===== 显示信息 =====
  label?: string                  // 边标签

  // ===== 样式信息（可选）=====
  style?: {
    type: "solid" | "dashed" | "dotted"
    color?: string
    width?: number
    animated?: boolean            // 是否显示动画
  }

  // ===== 路由信息（可选，用于自定义边的路径）=====
  route?: {
    type: "manhattan" | "bezier" | "straight" | "custom"
    vertices?: { x: number, y: number }[]  // 中间顶点
  }

  // ===== 数据传递配置（可选）=====
  dataFlow?: {
    // 数据转换（在传递过程中）
    transform?: string            // 简单的数据转换表达式

    // 数据验证
    validation?: {
      enabled: boolean
      schemaCheck: boolean
    }
  }

  // ===== 审计信息 =====
  createdAt: string
}
```

### 3.6 节点分组

```typescript
/**
 * 节点分组（可选功能）
 */
interface NodeGroup {
  id: string                      // 分组ID
  label: string                   // 分组名称
  nodeIds: string[]               // 包含的节点ID列表

  // 显示配置
  collapsed: boolean              // 是否折叠
  position?: { x: number, y: number }
  size?: { width: number, height: number }

  // 样式
  style?: {
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
  }
}
```

---

## 4. API 接口规范

### 4.1 RESTful API 设计原则

- **URL规范**：`/api/v1/resource`
- **HTTP方法**：GET (查询), POST (创建), PUT (完整更新), PATCH (部分更新), DELETE (删除)
- **响应格式**：统一的JSON响应包装
- **错误处理**：标准HTTP状态码 + 错误详情

### 4.2 通用响应格式

```typescript
/**
 * 成功响应
 */
interface SuccessResponse<T> {
  success: true
  data: T
  timestamp: string               // ISO 8601格式
  requestId: string               // 请求追踪ID
}

/**
 * 错误响应
 */
interface ErrorResponse {
  success: false
  error: {
    code: string                  // 错误代码，如 "VALIDATION_ERROR"
    message: string               // 用户友好的错误消息
    details?: any                 // 详细错误信息
    stack?: string                // 堆栈跟踪（仅开发环境）
  }
  timestamp: string
  requestId: string
}

/**
 * 分页响应
 */
interface PaginatedResponse<T> {
  success: true
  data: {
    items: T[]
    pagination: {
      page: number                // 当前页（从1开始）
      pageSize: number            // 每页数量
      total: number               // 总记录数
      totalPages: number          // 总页数
    }
  }
  timestamp: string
  requestId: string
}
```

### 4.3 Pipeline CRUD API

#### 4.3.1 创建Pipeline

```http
POST /api/v1/pipelines
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "name": "My Data Pipeline",
  "description": "Process user data",
  "metadata": {
    "category": "ETL",
    "tags": ["production"],
    "visibility": "team"
  },
  "graph": {
    "nodes": [],
    "edges": []
  },
  "configuration": {
    "execution": {
      "mode": "sequential"
    }
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "pipeline-123e4567-e89b-12d3-a456-426614174000",
    "name": "My Data Pipeline",
    ...
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-01-15T10:30:00Z"
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "req-abc123"
}
```

#### 4.3.2 获取Pipeline列表

```http
GET /api/v1/pipelines?page=1&pageSize=20&category=ETL&status=published&sort=updatedAt:desc
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "pipeline-123",
        "name": "My Data Pipeline",
        "metadata": { ... },
        "execution": { ... },
        ...
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "req-abc124"
}
```

#### 4.3.3 获取单个Pipeline

```http
GET /api/v1/pipelines/{pipelineId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "pipeline-123",
    "name": "My Data Pipeline",
    "version": "1.0.0",
    "graph": {
      "nodes": [ ... ],
      "edges": [ ... ]
    },
    ...
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "req-abc125"
}
```

#### 4.3.4 更新Pipeline

```http
PUT /api/v1/pipelines/{pipelineId}
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "name": "Updated Pipeline Name",
  "description": "Updated description",
  "graph": {
    "nodes": [ ... ],
    "edges": [ ... ]
  },
  "configuration": { ... }
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-01-15T10:35:00Z",
  "requestId": "req-abc126"
}
```

#### 4.3.5 部分更新Pipeline

```http
PATCH /api/v1/pipelines/{pipelineId}
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "name": "New Name",
  "metadata": {
    "tags": ["production", "v2"]
  }
}

Response: 200 OK
```

#### 4.3.6 删除Pipeline

```http
DELETE /api/v1/pipelines/{pipelineId}
Authorization: Bearer {token}

Response: 204 No Content
```

### 4.4 Pipeline 执行 API

#### 4.4.1 运行Pipeline

```http
POST /api/v1/pipelines/{pipelineId}/execute
Content-Type: application/json
Authorization: Bearer {token}

Request Body (可选):
{
  "parameters": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-15"
  },
  "environment": {
    "DEBUG": "false"
  }
}

Response: 202 Accepted
{
  "success": true,
  "data": {
    "executionId": "exec-456",
    "status": "running",
    "startedAt": "2025-01-15T10:40:00Z"
  },
  "timestamp": "2025-01-15T10:40:00Z",
  "requestId": "req-abc127"
}
```

#### 4.4.2 获取执行状态

```http
GET /api/v1/executions/{executionId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "executionId": "exec-456",
    "pipelineId": "pipeline-123",
    "status": "running",
    "progress": 45,
    "startedAt": "2025-01-15T10:40:00Z",
    "nodes": [
      {
        "nodeId": "node-1",
        "status": "completed",
        "startedAt": "2025-01-15T10:40:05Z",
        "completedAt": "2025-01-15T10:40:30Z"
      },
      {
        "nodeId": "node-2",
        "status": "running",
        "startedAt": "2025-01-15T10:40:31Z"
      }
    ]
  },
  "timestamp": "2025-01-15T10:41:00Z",
  "requestId": "req-abc128"
}
```

#### 4.4.3 停止执行

```http
POST /api/v1/executions/{executionId}/stop
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "executionId": "exec-456",
    "status": "stopped",
    "stoppedAt": "2025-01-15T10:42:00Z"
  },
  "timestamp": "2025-01-15T10:42:00Z",
  "requestId": "req-abc129"
}
```

#### 4.4.4 获取执行日志

```http
GET /api/v1/executions/{executionId}/logs?level=info&limit=100&offset=0
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2025-01-15T10:40:05.123Z",
        "level": "info",
        "nodeId": "node-1",
        "message": "Starting data load from database"
      },
      {
        "timestamp": "2025-01-15T10:40:06.456Z",
        "level": "info",
        "nodeId": "node-1",
        "message": "Loaded 10000 rows"
      }
    ],
    "hasMore": true
  },
  "timestamp": "2025-01-15T10:42:00Z",
  "requestId": "req-abc130"
}
```

### 4.5 数据预览 API

#### 4.5.1 预览节点输出

```http
POST /api/v1/pipelines/{pipelineId}/nodes/{nodeId}/preview
Content-Type: application/json
Authorization: Bearer {token}

Request Body (可选):
{
  "limit": 100,                   // 返回行数限制
  "parameters": { ... }           // 覆盖参数
}

Response: 200 OK
{
  "success": true,
  "data": {
    "schema": {
      "type": "object",
      "properties": {
        "id": { "name": "id", "type": "number" },
        "name": { "name": "name", "type": "string" },
        "age": { "name": "age", "type": "number" }
      }
    },
    "rows": [
      { "id": 1, "name": "Alice", "age": 25 },
      { "id": 2, "name": "Bob", "age": 30 }
    ],
    "totalRows": 2,
    "truncated": false
  },
  "timestamp": "2025-01-15T10:43:00Z",
  "requestId": "req-abc131"
}
```

### 4.6 版本控制 API

#### 4.6.1 创建版本

```http
POST /api/v1/pipelines/{pipelineId}/versions
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "message": "Add new transformation step",
  "tag": "v1.2.0"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "versionId": "ver-789",
    "pipelineId": "pipeline-123",
    "tag": "v1.2.0",
    "message": "Add new transformation step",
    "createdAt": "2025-01-15T10:45:00Z",
    "createdBy": "user-abc"
  },
  "timestamp": "2025-01-15T10:45:00Z",
  "requestId": "req-abc132"
}
```

#### 4.6.2 获取版本列表

```http
GET /api/v1/pipelines/{pipelineId}/versions?page=1&pageSize=20
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "items": [
      {
        "versionId": "ver-789",
        "tag": "v1.2.0",
        "message": "Add new transformation step",
        "createdAt": "2025-01-15T10:45:00Z",
        "createdBy": "user-abc"
      }
    ],
    "pagination": { ... }
  },
  "timestamp": "2025-01-15T10:46:00Z",
  "requestId": "req-abc133"
}
```

#### 4.6.3 回滚到指定版本

```http
POST /api/v1/pipelines/{pipelineId}/rollback
Content-Type: application/json
Authorization: Bearer {token}

Request Body:
{
  "versionId": "ver-789"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "pipelineId": "pipeline-123",
    "currentVersionId": "ver-789",
    "rolledBackAt": "2025-01-15T10:47:00Z"
  },
  "timestamp": "2025-01-15T10:47:00Z",
  "requestId": "req-abc134"
}
```

### 4.7 WebSocket 实时通信

#### 4.7.1 连接建立

```javascript
// 客户端连接
const socket = io('wss://api.example.com/executions', {
  auth: {
    token: 'Bearer xxx'
  }
})

// 订阅特定执行
socket.emit('subscribe', { executionId: 'exec-456' })
```

#### 4.7.2 事件定义

```typescript
/**
 * 服务端推送事件
 */

// 1. 执行状态更新
socket.on('execution:status', (data: {
  executionId: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  progress: number
  timestamp: string
}) => { ... })

// 2. 节点状态更新
socket.on('node:status', (data: {
  executionId: string
  nodeId: string
  status: 'running' | 'completed' | 'failed'
  timestamp: string
}) => { ... })

// 3. 实时日志
socket.on('execution:log', (data: {
  executionId: string
  timestamp: string
  level: 'debug' | 'info' | 'warning' | 'error'
  nodeId?: string
  message: string
}) => { ... })

// 4. 性能指标
socket.on('execution:metrics', (data: {
  executionId: string
  nodeId?: string
  metrics: {
    cpuUsage: number
    memoryUsage: number
    rowsProcessed: number
  }
  timestamp: string
}) => { ... })

// 5. 错误通知
socket.on('execution:error', (data: {
  executionId: string
  nodeId?: string
  error: {
    code: string
    message: string
    stack?: string
  }
  timestamp: string
}) => { ... })
```

---

## 5. 版本控制

### 5.1 Schema版本化

```typescript
/**
 * Pipeline Schema版本管理
 */
interface PipelineSchemaVersion {
  version: string                 // 如 "1.0.0"
  releaseDate: string
  breaking: boolean               // 是否包含破坏性变更
  changes: string[]               // 变更说明
  migrationGuide?: string         // 迁移指南URL
}

const SCHEMA_VERSIONS: PipelineSchemaVersion[] = [
  {
    version: "1.0.0",
    releaseDate: "2025-01-01",
    breaking: false,
    changes: [
      "初始版本",
      "支持基础节点类型",
      "支持DAG结构"
    ]
  },
  {
    version: "1.1.0",
    releaseDate: "2025-03-01",
    breaking: false,
    changes: [
      "新增Python Transform节点",
      "新增节点分组功能",
      "增强数据Schema定义"
    ]
  }
]
```

### 5.2 向后兼容策略

1. **版本检测**：后端读取Pipeline时检查`version`字段
2. **自动迁移**：旧版本数据自动升级到当前版本
3. **警告提示**：UI提示用户当前Pipeline使用旧版Schema
4. **版本锁定**：可选择锁定特定Schema版本

---

## 6. 数据验证规则

### 6.1 Pipeline级别验证

```typescript
/**
 * Pipeline验证规则
 */
interface PipelineValidationRules {
  // 1. 基础验证
  name: {
    required: true
    minLength: 1
    maxLength: 100
    pattern: /^[a-zA-Z0-9_\-\s]+$/
  }

  // 2. 图结构验证
  graph: {
    // 必须是有向无环图（DAG）
    acyclic: true

    // 节点ID唯一性
    uniqueNodeIds: true

    // 边的source和target必须存在
    validEdges: true

    // 至少包含一个节点
    minNodes: 1

    // 节点数量限制
    maxNodes: 1000
  }

  // 3. 连接验证
  connections: {
    // 必需端口必须连接
    requiredPortsConnected: true

    // 数据类型匹配
    dataTypeMatching: true
  }
}
```

### 6.2 节点级别验证

```typescript
/**
 * 节点配置验证
 */
interface NodeValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

interface ValidationError {
  field: string                   // 错误字段
  code: string                    // 错误代码
  message: string                 // 错误消息
}

interface ValidationWarning {
  field: string
  code: string
  message: string
  suggestion?: string             // 修复建议
}

// 示例：SQL Transform节点验证
function validateSqlTransformNode(node: Node): NodeValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // SQL不能为空
  if (!node.config.sql || node.config.sql.trim() === '') {
    errors.push({
      field: 'config.sql',
      code: 'REQUIRED',
      message: 'SQL statement is required'
    })
  }

  // 检查SQL语法
  if (!validateSqlSyntax(node.config.sql)) {
    errors.push({
      field: 'config.sql',
      code: 'SYNTAX_ERROR',
      message: 'Invalid SQL syntax'
    })
  }

  // 检查输入别名
  if (Object.keys(node.config.inputAliases).length === 0) {
    warnings.push({
      field: 'config.inputAliases',
      code: 'MISSING_INPUT_ALIAS',
      message: 'No input aliases defined',
      suggestion: 'Define aliases for input tables'
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
```

---

## 7. 示例数据

### 7.1 完整Pipeline示例

```json
{
  "id": "pipeline-550e8400-e29b-41d4-a716-446655440000",
  "name": "User Analytics Pipeline",
  "description": "Process user behavior data and generate analytics",
  "version": "1.0.0",

  "metadata": {
    "category": "Analytics",
    "tags": ["production", "user-analytics", "daily"],
    "owner": "user-123",
    "team": "data-team",
    "visibility": "team",
    "status": "published",
    "documentation": {
      "readme": "# User Analytics Pipeline\n\nThis pipeline processes user behavior data...",
      "externalLinks": [
        {
          "name": "Design Doc",
          "url": "https://docs.example.com/pipelines/user-analytics"
        }
      ]
    }
  },

  "graph": {
    "nodes": [
      {
        "id": "node-1",
        "type": "dataset",
        "label": "User Events",
        "description": "Raw user event data",
        "position": { "x": 100, "y": 100 },
        "ports": {
          "input": [],
          "output": [
            {
              "id": "node-1-out",
              "label": "events",
              "dataType": {
                "type": "table",
                "schema": {
                  "type": "object",
                  "properties": {
                    "user_id": { "name": "user_id", "type": "string" },
                    "event_type": { "name": "event_type", "type": "string" },
                    "timestamp": { "name": "timestamp", "type": "date" },
                    "properties": { "name": "properties", "type": "object" }
                  }
                }
              },
              "multiple": true,
              "required": false
            }
          ]
        },
        "config": {
          "datasetId": "dataset-user-events",
          "datasetName": "user_events",
          "source": {
            "type": "foundry",
            "path": "/raw/events/user_events"
          },
          "snapshot": {
            "enabled": true,
            "type": "latest"
          },
          "columns": {
            "mode": "all"
          }
        },
        "metadata": {
          "color": "#4285F4",
          "icon": "database"
        },
        "createdAt": "2025-01-15T10:00:00Z",
        "updatedAt": "2025-01-15T10:00:00Z"
      },
      {
        "id": "node-2",
        "type": "filter",
        "label": "Filter Active Users",
        "description": "Keep only events from active users",
        "position": { "x": 350, "y": 100 },
        "ports": {
          "input": [
            {
              "id": "node-2-in",
              "label": "input",
              "dataType": { "type": "table" },
              "multiple": false,
              "required": true
            }
          ],
          "output": [
            {
              "id": "node-2-out",
              "label": "filtered",
              "dataType": { "type": "table" },
              "multiple": true,
              "required": false
            }
          ]
        },
        "config": {
          "mode": "simple",
          "conditions": [
            {
              "column": "user_status",
              "operator": "=",
              "value": "active",
              "dataType": "string"
            },
            {
              "column": "timestamp",
              "operator": ">=",
              "value": "2025-01-01",
              "dataType": "date"
            }
          ]
        },
        "metadata": {
          "color": "#10B981"
        },
        "createdAt": "2025-01-15T10:05:00Z",
        "updatedAt": "2025-01-15T10:05:00Z"
      },
      {
        "id": "node-3",
        "type": "sql-transform",
        "label": "Aggregate by User",
        "description": "Calculate user-level statistics",
        "position": { "x": 600, "y": 100 },
        "ports": {
          "input": [
            {
              "id": "node-3-in",
              "label": "events",
              "dataType": { "type": "table" },
              "multiple": false,
              "required": true
            }
          ],
          "output": [
            {
              "id": "node-3-out",
              "label": "aggregated",
              "dataType": { "type": "table" },
              "multiple": false,
              "required": false
            }
          ]
        },
        "config": {
          "sql": "SELECT\n  user_id,\n  COUNT(*) as event_count,\n  COUNT(DISTINCT event_type) as unique_events,\n  MIN(timestamp) as first_event,\n  MAX(timestamp) as last_event\nFROM events\nGROUP BY user_id",
          "dialect": "standard",
          "inputAliases": {
            "node-3-in": "events"
          },
          "outputSchema": {
            "type": "object",
            "properties": {
              "user_id": { "name": "user_id", "type": "string" },
              "event_count": { "name": "event_count", "type": "number" },
              "unique_events": { "name": "unique_events", "type": "number" },
              "first_event": { "name": "first_event", "type": "date" },
              "last_event": { "name": "last_event", "type": "date" }
            }
          },
          "validation": {
            "enabled": true,
            "checkSyntax": true,
            "checkSchema": false
          }
        },
        "metadata": {
          "color": "#9334E6"
        },
        "createdAt": "2025-01-15T10:10:00Z",
        "updatedAt": "2025-01-15T10:15:00Z"
      },
      {
        "id": "node-4",
        "type": "dataset-output",
        "label": "User Analytics Output",
        "description": "Save aggregated results",
        "position": { "x": 850, "y": 100 },
        "ports": {
          "input": [
            {
              "id": "node-4-in",
              "label": "data",
              "dataType": { "type": "table" },
              "multiple": false,
              "required": true
            }
          ],
          "output": []
        },
        "config": {
          "datasetId": "dataset-user-analytics",
          "datasetName": "user_analytics",
          "destination": {
            "type": "foundry",
            "path": "/processed/analytics/user_analytics"
          },
          "writeMode": "overwrite",
          "createIfNotExists": true
        },
        "metadata": {
          "color": "#8B5CF6"
        },
        "createdAt": "2025-01-15T10:20:00Z",
        "updatedAt": "2025-01-15T10:20:00Z"
      }
    ],

    "edges": [
      {
        "id": "edge-1",
        "source": {
          "nodeId": "node-1",
          "portId": "node-1-out"
        },
        "target": {
          "nodeId": "node-2",
          "portId": "node-2-in"
        },
        "label": "events",
        "style": {
          "type": "solid",
          "animated": false
        },
        "createdAt": "2025-01-15T10:05:00Z"
      },
      {
        "id": "edge-2",
        "source": {
          "nodeId": "node-2",
          "portId": "node-2-out"
        },
        "target": {
          "nodeId": "node-3",
          "portId": "node-3-in"
        },
        "label": "filtered_events",
        "style": {
          "type": "solid",
          "animated": false
        },
        "createdAt": "2025-01-15T10:10:00Z"
      },
      {
        "id": "edge-3",
        "source": {
          "nodeId": "node-3",
          "portId": "node-3-out"
        },
        "target": {
          "nodeId": "node-4",
          "portId": "node-4-in"
        },
        "label": "aggregated",
        "style": {
          "type": "solid",
          "animated": false
        },
        "createdAt": "2025-01-15T10:20:00Z"
      }
    ],

    "layout": {
      "zoom": 1.0,
      "center": { "x": 475, "y": 150 }
    }
  },

  "configuration": {
    "execution": {
      "mode": "sequential",
      "timeout": 3600,
      "retryPolicy": {
        "maxRetries": 3,
        "retryDelay": 60,
        "exponentialBackoff": true
      }
    },
    "schedule": {
      "enabled": true,
      "cron": "0 2 * * *",
      "timezone": "Asia/Shanghai"
    },
    "notifications": {
      "onSuccess": [
        {
          "type": "email",
          "config": {
            "recipients": ["data-team@example.com"]
          }
        }
      ],
      "onFailure": [
        {
          "type": "slack",
          "config": {
            "channel": "#pipeline-alerts",
            "webhook": "https://hooks.slack.com/services/xxx"
          }
        }
      ]
    },
    "environment": {
      "SPARK_EXECUTOR_MEMORY": "4g",
      "SPARK_DRIVER_MEMORY": "2g"
    }
  },

  "execution": {
    "lastExecution": {
      "executionId": "exec-last-123",
      "status": "completed",
      "startedAt": "2025-01-15T02:00:00Z",
      "completedAt": "2025-01-15T02:15:30Z",
      "duration": 930
    },
    "statistics": {
      "totalExecutions": 45,
      "successCount": 43,
      "failureCount": 2,
      "averageDuration": 850
    },
    "health": "healthy"
  },

  "createdAt": "2025-01-10T14:30:00Z",
  "updatedAt": "2025-01-15T10:20:00Z",
  "createdBy": "user-123",
  "updatedBy": "user-123"
}
```

### 7.2 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Pipeline validation failed",
    "details": {
      "errors": [
        {
          "field": "graph.edges[2].source.nodeId",
          "code": "INVALID_NODE_REFERENCE",
          "message": "Source node 'node-99' does not exist"
        },
        {
          "field": "graph.nodes[1].config.sql",
          "code": "SQL_SYNTAX_ERROR",
          "message": "Syntax error at line 3: unexpected token 'FORM'"
        }
      ]
    }
  },
  "timestamp": "2025-01-15T10:50:00Z",
  "requestId": "req-abc135"
}
```

---

## 8. 前端实现指南

### 8.1 TypeScript类型定义文件

创建 `src/types/pipeline.ts`:

```typescript
// 导出所有类型定义
export * from './pipeline-schema'
export * from './node-types'
export * from './api-types'
```

### 8.2 数据转换工具

```typescript
// utils/pipelineTransform.ts

/**
 * 将X6 Graph数据转换为Pipeline JSON
 */
export function graphToPipeline(graph: Graph): Pipeline {
  const cells = graph.getCells()

  const nodes: Node[] = cells
    .filter(cell => cell.isNode())
    .map(cell => nodeToJson(cell))

  const edges: Edge[] = cells
    .filter(cell => cell.isEdge())
    .map(cell => edgeToJson(cell))

  return {
    // ... 构建Pipeline对象
    graph: { nodes, edges }
  }
}

/**
 * 将Pipeline JSON加载到X6 Graph
 */
export function pipelineToGraph(pipeline: Pipeline, graph: Graph): void {
  // 清空现有数据
  graph.clearCells()

  // 添加节点
  pipeline.graph.nodes.forEach(node => {
    graph.addNode(jsonToNode(node))
  })

  // 添加边
  pipeline.graph.edges.forEach(edge => {
    graph.addEdge(jsonToEdge(edge))
  })

  // 恢复布局
  if (pipeline.graph.layout) {
    graph.zoom(pipeline.graph.layout.zoom)
    graph.centerPoint(
      pipeline.graph.layout.center.x,
      pipeline.graph.layout.center.y
    )
  }
}
```

### 8.3 数据验证

```typescript
// utils/validation.ts
import Ajv from 'ajv'
import pipelineSchema from '@/schemas/pipeline.schema.json'

const ajv = new Ajv()
const validatePipeline = ajv.compile(pipelineSchema)

/**
 * 验证Pipeline数据
 */
export function validatePipelineData(pipeline: Pipeline): ValidationResult {
  const valid = validatePipeline(pipeline)

  if (!valid) {
    return {
      valid: false,
      errors: validatePipeline.errors || []
    }
  }

  // 额外的业务验证
  const businessErrors = performBusinessValidation(pipeline)

  return {
    valid: businessErrors.length === 0,
    errors: businessErrors
  }
}

function performBusinessValidation(pipeline: Pipeline): ValidationError[] {
  const errors: ValidationError[] = []

  // 检查DAG
  if (hasCycle(pipeline.graph)) {
    errors.push({
      field: 'graph',
      code: 'CYCLE_DETECTED',
      message: 'Pipeline graph contains cycles'
    })
  }

  // 检查连接有效性
  // ...

  return errors
}
```

---

## 9. 后端实现建议

### 9.1 数据库Schema设计

```sql
-- Pipeline表
CREATE TABLE pipelines (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  version VARCHAR(20) NOT NULL DEFAULT '1.0.0',

  -- JSON字段
  metadata JSONB NOT NULL,
  graph JSONB NOT NULL,
  configuration JSONB NOT NULL,
  execution JSONB,

  -- 审计字段
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,
  updated_by UUID NOT NULL,

  -- 索引
  CONSTRAINT pipelines_name_check CHECK (char_length(name) >= 1)
);

-- 创建索引
CREATE INDEX idx_pipelines_created_by ON pipelines(created_by);
CREATE INDEX idx_pipelines_metadata ON pipelines USING GIN(metadata);
CREATE INDEX idx_pipelines_status ON pipelines((metadata->>'status'));

-- Pipeline版本表
CREATE TABLE pipeline_versions (
  version_id UUID PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  tag VARCHAR(50),
  message TEXT,
  pipeline_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL,

  UNIQUE(pipeline_id, version_number)
);

-- 执行记录表
CREATE TABLE executions (
  execution_id UUID PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id),
  status VARCHAR(20) NOT NULL,
  parameters JSONB,
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  error TEXT,

  -- 节点执行状态
  node_statuses JSONB,

  created_by UUID NOT NULL
);

CREATE INDEX idx_executions_pipeline ON executions(pipeline_id);
CREATE INDEX idx_executions_status ON executions(status);
CREATE INDEX idx_executions_started_at ON executions(started_at DESC);
```

### 9.2 API实现示例（Node.js + Express）

```typescript
// routes/pipelines.ts
import express from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { PipelineService } from '../services/pipelineService'

const router = express.Router()
const pipelineService = new PipelineService()

// 创建Pipeline
router.post('/',
  body('name').isLength({ min: 1, max: 100 }),
  body('metadata').isObject(),
  body('graph').isObject(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: errors.array()
          }
        })
      }

      const pipeline = await pipelineService.create(req.body, req.user.id)

      res.status(201).json({
        success: true,
        data: pipeline,
        timestamp: new Date().toISOString(),
        requestId: req.id
      })
    } catch (error) {
      next(error)
    }
  }
)

// 获取Pipeline
router.get('/:id',
  param('id').isUUID(),
  async (req, res, next) => {
    try {
      const pipeline = await pipelineService.getById(req.params.id)

      if (!pipeline) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Pipeline not found'
          }
        })
      }

      res.json({
        success: true,
        data: pipeline,
        timestamp: new Date().toISOString(),
        requestId: req.id
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
```

---

## 10. 总结

这套数据规范涵盖了：

✅ **完整的数据结构定义** - Pipeline, Node, Edge等核心实体
✅ **类型安全** - 完整的TypeScript类型定义
✅ **扩展性** - 支持自定义节点类型和配置
✅ **RESTful API规范** - 标准的HTTP接口设计
✅ **实时通信** - WebSocket事件定义
✅ **版本控制** - Schema版本化和数据迁移
✅ **数据验证** - 完整的验证规则
✅ **示例数据** - 实际可用的JSON示例

这套规范可以直接用于：
1. 前端TypeScript类型定义
2. 后端API开发
3. 数据库Schema设计
4. API文档生成（如Swagger/OpenAPI）
5. 数据验证和测试

---

**文档版本**: v1.0
**创建日期**: 2025-01-15
**维护团队**: Pipeline Builder Team
