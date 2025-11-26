# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pipeline Builder Frontend - A visual data pipeline builder inspired by Palantir Foundry, built with Vue 3, TypeScript, and AntV X6. This is an enterprise-level ETL/data transformation platform with a drag-and-drop graph editor.

**Tech Stack:**
- Vue 3.4+ (Composition API)
- TypeScript 5.x
- Vite 5.x
- Ant Design Vue 4.x
- AntV X6 2.x (graph editor)
- Pinia 2.x (state management)
- Vue Router 4.x

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
npm run test:ui          # With UI
npm run test:coverage    # With coverage

# Code quality
npm run lint             # ESLint check and auto-fix
npm run format           # Prettier formatting
```

### Environment Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

## Architecture Overview

### Directory Structure
```
src/
├── api/                    # API layer (currently using mock data)
├── assets/                 # Static assets (styles, images)
├── components/             # Vue components
│   ├── common/            # Reusable components (ContextMenu, ToolButton, etc.)
│   └── pipeline/          # Pipeline-specific components
│       └── transforms/    # Transform configuration components
├── composables/           # Composition API logic
├── layouts/               # Layout components
├── locales/               # i18n translations (zh-CN, en-US)
├── mock/                  # Mock data for development
├── router/                # Vue Router configuration
├── stores/                # Pinia state management
│   └── modules/           # Store modules (app, user, pipeline, history)
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── views/                 # Page components
    ├── pipeline/          # Pipeline views (List, Editor)
    └── execution/         # Execution views
```

### Core Architecture

#### State Management (Pinia)
The application uses Pinia for state management with the following stores:

**`usePipelineStore`** (`src/stores/modules/pipeline.ts`):
- Manages pipeline data: nodes, edges, current pipeline
- Handles node/edge CRUD operations
- Implements data caching with `nodeDataCache` and `transformCache` (Map objects)
- Performs topological sorting for pipeline execution
- **Important**: Map objects require initialization via `ensureMapsInitialized()` due to persistence issues
- Implements cycle detection for DAG validation

**`useHistoryStore`** (`src/stores/modules/history.ts`):
- Undo/redo functionality with history stack
- Max 50 history entries

**`useAppStore`** and **`useUserStore`**:
- Global application state and user preferences

#### Graph Editor (AntV X6)
The visual editor is built on AntV X6 with extensive plugins:
- `@antv/x6-plugin-clipboard` - Copy/paste
- `@antv/x6-plugin-history` - History management
- `@antv/x6-plugin-keyboard` - Keyboard shortcuts
- `@antv/x6-plugin-minimap` - Minimap navigation
- `@antv/x6-plugin-scroller` - Canvas scrolling
- `@antv/x6-plugin-selection` - Multi-selection
- `@antv/x6-plugin-snapline` - Alignment guides
- `@antv/x6-plugin-transform` - Node transformation

**Main canvas component**: `src/components/pipeline/GraphCanvas.vue`

#### Node Types
The system supports multiple node types defined in the pipeline store:
- `dataset` - Data source nodes
- `transform` - Data transformation nodes (with configurable transforms)
- `join` - Data join operations
- `output` - Output/sink nodes

Each node has:
- Unique ID
- Type identifier
- Position (x, y)
- Configuration data specific to type
- Cached data for performance

#### Data Transformation Engine
**Location**: `src/utils/transform.ts`

Implements 60+ transform operations including:
- Basic: filter, select, rename, sort, distinct
- String: trim, split, replace, uppercase, lowercase, concatenate
- Numeric: cast, round, add, subtract, multiply, divide
- Date: formatDate, parseDate, extractYear, addDays, dateDiff
- Advanced: groupBy, pivot, join, conditionalColumn, rank

**Transform validation**: `src/utils/transform-validation.ts`
- Type-safe validation for all transform parameters
- Comprehensive error messages

**Transform UI**: `src/components/pipeline/transforms/`
- Each transform type has a dedicated Vue component
- Generic transform component for simple operations
- Special components for complex transforms (Join, GroupBy, Python, SQL)

#### Data Flow
1. User interacts with canvas (GraphCanvas.vue)
2. Actions dispatch to Pinia stores
3. Stores update state and manage caching
4. Vue reactivity updates UI
5. Data transformations applied via transform.ts engine

### Key Design Patterns

#### Composables Pattern
Reusable logic extracted into composables:
- `useLocale.ts` - i18n locale management

#### Auto-Import
The project uses unplugin-auto-import and unplugin-vue-components:
- Vue APIs (ref, computed, watch, etc.) auto-imported
- Ant Design Vue components auto-imported
- Component types generated in `src/types/components.d.ts`
- API types generated in `src/types/auto-imports.d.ts`

#### Path Aliases
Configured in `vite.config.ts` and `tsconfig.json`:
```typescript
'@' → 'src/'
'@components' → 'src/components/'
'@views' → 'src/views/'
'@stores' → 'src/stores/'
'@utils' → 'src/utils/'
'@api' → 'src/api/'
'@types' → 'src/types/'
'@assets' → 'src/assets/'
```

## Important Implementation Details

### Pipeline Store Map Persistence
The pipeline store uses `Map` objects for caching, which don't serialize well with persistence plugins. Always call `ensureMapsInitialized()` before accessing `nodeDataCache` or `transformCache`:

```typescript
this.ensureMapsInitialized()
const data = this.nodeDataCache.get(nodeId)
```

### Node Data Computation
Node data is computed lazily and cached:
1. Check cache first (`nodeDataCache`)
2. If not cached, compute based on node type:
   - Dataset: Load from mock data
   - Transform: Get input data + apply transforms
   - Join: Get two inputs + apply join operation
   - Output: Pass through input data
3. Cache result for performance

### Transform Configuration
Transforms are stored separately in `transformCache` Map:
```typescript
// Add transform to node
pipelineStore.addTransform(nodeId, transformConfig)

// Get node's transforms
const transforms = pipelineStore.getNodeTransforms(nodeId)
```

When transforms change, downstream caches are cleared via `clearDownstreamCache()`.

### Internationalization (i18n)
The app supports zh-CN and en-US locales:
- Locale files: `src/locales/`
- Use `$t()` in templates for translations
- Use `t()` from vue-i18n in script
- Locale switcher: `LocaleSwitcher.vue`

### Code Editors
The app integrates Monaco Editor for SQL/Python code editing:
- Configuration: `src/utils/monaco-config.ts`
- Used in: CodeEditor.vue, SQLTransform.vue, PythonTransform.vue

### Performance Monitoring
Performance tracking utilities in `src/utils/performance.ts`:
- Function execution timing
- Memory usage tracking
- Performance dashboard component

### Data Export
Export functionality in `src/utils/export.ts`:
- CSV export
- Excel export (using xlsx library)
- JSON export

## Development Guidelines

### Adding New Node Types
1. Add type to `NodeType` in pipeline store
2. Implement data loading logic in `getNodeData()` action
3. Create UI component in `src/components/pipeline/`
4. Register in node palette

### Adding New Transforms
1. Add transform type to `TransformType` in `src/utils/transform.ts`
2. Implement transform function in the same file
3. Add validation in `src/utils/transform-validation.ts`
4. Create configuration component in `src/components/pipeline/transforms/`
5. Test thoroughly with various data types

### Working with the Graph
- Access graph instance via GraphCanvas component
- Use X6 APIs for node/edge manipulation
- Keep graph state in sync with Pinia store
- Use graph events to trigger store updates

### State Management Best Practices
- Always use store actions for mutations
- Use getters for computed state
- Mark state as dirty when changes occur (isDirty flag)
- Clear caches when upstream data changes

### Testing
- Unit tests use Vitest
- Test files located in `__tests__` directories
- Run tests with coverage before committing

## API Design Reference

Full data structure specifications are documented in:
- `docs/09-前后端数据规范与API设计.md` - Complete API and data format specifications
- `docs/02-前端技术架构设计.md` - Architecture details

Key data structures:
- Pipeline: Contains metadata, graph (nodes + edges), configuration
- Node: Has id, type, position, ports, config, metadata
- Edge: Connects nodes with source/target ports
- Transform: Type-specific configuration for data operations

## Common Development Tasks

### Running the App
The app currently uses mock data, so no backend is required for development. Just run `npm run dev`.

### Debugging Graph Issues
1. Use browser DevTools Vue extension to inspect component state
2. Check Pinia stores for current graph state
3. Use X6's built-in debugging: `graph.toJSON()` to export current state
4. Check console for validation errors

### Modifying Transforms
1. Update transform function in `src/utils/transform.ts`
2. Update validation in `src/utils/transform-validation.ts`
3. Update or create UI component in `transforms/` directory
4. Add translations to locale files
5. Test with various data scenarios

### Styling
- Global styles: `src/assets/styles/`
- Ant Design theme customization: `vite.config.ts` (modifyVars)
- Scoped styles in components
- Less preprocessor enabled

## Known Patterns and Conventions

### Naming
- Components: PascalCase (e.g., `GraphCanvas.vue`)
- Composables: camelCase with "use" prefix (e.g., `useLocale.ts`)
- Store modules: camelCase (e.g., `pipeline.ts`)
- Utils: camelCase (e.g., `transform.ts`)

### File Organization
- Related components grouped in subdirectories
- Transforms have dedicated directory
- Tests co-located with source files in `__tests__`

### Vue Style
- Composition API with `<script setup>`
- TypeScript for type safety
- Props and emits explicitly typed
- Reactive state with `ref` and `reactive`

## Documentation

Comprehensive documentation in `docs/` directory:
- Architecture and design docs (in Chinese)
- Implementation guides
- Transform usage guide (`TRANSFORM_GUIDE.md`)
- Quick start guide (`QUICK_START.md`)
- API specifications

Refer to these docs for detailed implementation specifications and design decisions.
