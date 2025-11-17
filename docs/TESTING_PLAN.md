# 🧪 Testing Plan - Pipeline Builder Frontend

## Overview

This document outlines the comprehensive testing strategy for Pipeline Builder v0.2.0, covering all new features and existing functionality.

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Feature Test Cases](#feature-test-cases)
3. [Browser Compatibility](#browser-compatibility)
4. [Performance Benchmarks](#performance-benchmarks)
5. [Regression Testing](#regression-testing)
6. [User Acceptance Testing](#user-acceptance-testing)

---

## Testing Strategy

### Test Levels

1. **Manual Testing** (Current Phase)
   - Feature functionality verification
   - UI/UX validation
   - Cross-browser testing
   - Exploratory testing

2. **Unit Testing** (Planned)
   - Utility functions (export, logger)
   - Core business logic
   - State management

3. **Integration Testing** (Future)
   - Component interactions
   - Pipeline execution flow
   - Data transformation chain

4. **E2E Testing** (Future)
   - Complete user workflows
   - Real-world scenarios

### Testing Environment

- **Browsers**: Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- **Screen Resolutions**: 1920×1080, 1366×768, 2560×1440
- **Operating Systems**: Windows 11, macOS Sonoma, Ubuntu 22.04

---

## Feature Test Cases

### 1. Data Export System

**Test Case 1.1: Export to CSV**
- **Steps**:
  1. Load sample data (Products dataset)
  2. Run pipeline
  3. Click Export → Export as CSV
  4. Verify downloaded file
- **Expected**:
  - File downloads with name format: `{NodeName}_{timestamp}.csv`
  - File contains UTF-8 BOM
  - All data rows present and correct
  - Special characters properly escaped (quotes, commas)
- **Status**: ⏳ Pending

**Test Case 1.2: Export to Excel**
- **Steps**:
  1. Load dataset with 1000+ rows
  2. Run pipeline with transformations
  3. Export as Excel (.xls)
  4. Open in Microsoft Excel or LibreOffice
- **Expected**:
  - File opens without errors
  - All columns and rows intact
  - Number formatting preserved
  - Unicode characters display correctly
- **Status**: ⏳ Pending

**Test Case 1.3: Export to JSON**
- **Steps**:
  1. Create pipeline with join operation
  2. Run and export as JSON
  3. Validate JSON syntax
- **Expected**:
  - Valid JSON array format
  - Proper indentation (2 spaces)
  - All nested structures preserved
  - Parseable by JSON.parse()
- **Status**: ⏳ Pending

**Test Case 1.4: Export Empty Dataset**
- **Steps**:
  1. Apply filter that results in 0 rows
  2. Attempt export
- **Expected**:
  - Warning message shown
  - Export still proceeds with headers only
- **Status**: ⏳ Pending

---

### 2. Enhanced Selection UI

**Test Case 2.1: Selection Counter Badge**
- **Steps**:
  1. Select 1 node
  2. Select 3 nodes (Shift+Click)
  3. Select 10 nodes (rubberband)
  4. Deselect all (click canvas)
- **Expected**:
  - Badge shows "1 item selected"
  - Badge shows "3 items selected"
  - Badge shows "10 items selected"
  - Badge disappears when selection is empty
- **Status**: ⏳ Pending

**Test Case 2.2: Rubberband Selection**
- **Steps**:
  1. Shift+Drag to create selection box
  2. Verify nodes inside box are selected
  3. Release Shift, drag again
- **Expected**:
  - Selection box appears with dashed border
  - Only fully contained nodes selected
  - Previous selection cleared on new drag
- **Status**: ⏳ Pending

**Test Case 2.3: Multi-Select Actions**
- **Steps**:
  1. Select 5 nodes
  2. Press Delete
  3. Undo (Ctrl+Z)
  4. Select 3 nodes, Copy (Ctrl+C), Paste (Ctrl+V)
- **Expected**:
  - All 5 nodes deleted
  - All 5 nodes restored
  - 3 new nodes created with offset
- **Status**: ⏳ Pending

---

### 3. Smart Copy-Paste

**Test Case 3.1: Incremental Offset**
- **Steps**:
  1. Copy 1 node (Ctrl+C)
  2. Paste 5 times (Ctrl+V × 5)
  3. Measure offsets
- **Expected**:
  - 1st paste: +30px from original
  - 2nd paste: +50px from original
  - 3rd paste: +70px from original
  - 4th paste: +90px from original
  - 5th paste: +110px from original
- **Status**: ⏳ Pending

**Test Case 3.2: Flash Animation**
- **Steps**:
  1. Copy and paste a node
  2. Observe visual feedback
- **Expected**:
  - Green flash animation (600ms)
  - 3 stages: 0% → 70% → 30% → 0% opacity
  - Node auto-selected after paste
- **Status**: ⏳ Pending

**Test Case 3.3: Offset Reset**
- **Steps**:
  1. Paste node 3 times
  2. Click canvas
  3. Paste again
- **Expected**:
  - First 3 pastes: +30, +50, +70
  - After canvas click: Reset to +30
- **Status**: ⏳ Pending

---

### 4. Node Search & Highlighting

**Test Case 4.1: Search by Name**
- **Steps**:
  1. Create 5 nodes: "Products", "Filter Products", "Sort Products", "Customers", "Join"
  2. Search for "Products"
  3. Navigate results with ↓↑ arrows
- **Expected**:
  - 3 results found
  - Results list shows all matches
  - Camera pans to each node when selected
  - Orange dashed border on matched nodes
- **Status**: ⏳ Pending

**Test Case 4.2: Case Sensitive Search**
- **Steps**:
  1. Create nodes: "Products", "products", "PRODUCTS"
  2. Search "Products" with case-sensitive ON
  3. Search "Products" with case-sensitive OFF
- **Expected**:
  - Case ON: 1 match
  - Case OFF: 3 matches
- **Status**: ⏳ Pending

**Test Case 4.3: Regex Search**
- **Steps**:
  1. Create nodes: "Filter_v1", "Filter_v2", "Sort_v1"
  2. Search with regex: `Filter_v\d+`
- **Expected**:
  - 2 matches (Filter_v1, Filter_v2)
  - Regex errors shown for invalid patterns
- **Status**: ⏳ Pending

**Test Case 4.4: Search in Data Content**
- **Steps**:
  1. Load Products dataset (contains "Electronics")
  2. Search "Electronics" with "Data" scope enabled
- **Expected**:
  - Dataset node highlighted
  - Search result shows data match type
- **Status**: ⏳ Pending

---

### 5. Code Editor (Python & SQL)

**Test Case 5.1: Python Transform - Add Column**
- **Steps**:
  1. Add Python Transform
  2. Select "Add Column" template
  3. Modify code to create `total = quantity * price`
  4. Apply transform
- **Expected**:
  - Template loaded correctly
  - Syntax highlighting applied
  - Line numbers visible
  - Transform executes successfully
  - New column appears in data preview
- **Status**: ⏳ Pending

**Test Case 5.2: SQL Transform - Group By**
- **Steps**:
  1. Add SQL Transform
  2. Select "Group By & Aggregate" template
  3. Modify to: `SELECT category, COUNT(*) FROM input_table GROUP BY category`
  4. Apply transform
- **Expected**:
  - SQL template loaded
  - Column suggestions clickable
  - Query executes against mock data
  - Aggregated results shown
- **Status**: ⏳ Pending

**Test Case 5.3: Code Editor - Line Numbers & Cursor**
- **Steps**:
  1. Open code editor
  2. Type 10 lines of code
  3. Move cursor to line 5, column 10
- **Expected**:
  - Line numbers 1-10 shown on left
  - Footer shows "Ln 5, Col 10"
  - Character count updates in real-time
- **Status**: ⏳ Pending

**Test Case 5.4: Code Editor - Copy Code**
- **Steps**:
  1. Write code in editor
  2. Click "Copy Code" button
  3. Paste into external text editor
- **Expected**:
  - Success message shown
  - Code copied to clipboard
  - Formatting preserved
- **Status**: ⏳ Pending

---

### 6. Execution Monitor

**Test Case 6.1: Real-time Progress**
- **Steps**:
  1. Create pipeline with 5 nodes
  2. Click Run
  3. Observe monitor panel
- **Expected**:
  - Monitor slides up from bottom-right
  - Title: "Executing Pipeline..."
  - Progress bar: 0% → 20% → 40% → 60% → 80% → 100%
  - Node count: "X / 5 nodes completed"
  - Execution time updates every 100ms
- **Status**: ⏳ Pending

**Test Case 6.2: Node Status Tracking**
- **Steps**:
  1. Run pipeline
  2. Expand node list
  3. Observe each node status
- **Expected**:
  - Pending nodes: Gray icon, no background
  - Running node: Blue icon, blue background
  - Success nodes: Green icon, normal background
  - Row counts shown for completed nodes
  - Duration shown for each node
- **Status**: ⏳ Pending

**Test Case 6.3: Error Handling**
- **Steps**:
  1. Create invalid transform (e.g., reference non-existent column)
  2. Run pipeline
- **Expected**:
  - Monitor shows "Pipeline Execution Failed"
  - Failed node: Red icon, red background
  - Error alert displayed at bottom
  - Stack trace or error message visible
- **Status**: ⏳ Pending

**Test Case 6.4: Monitor Controls**
- **Steps**:
  1. Run pipeline
  2. Click expand/collapse button
  3. Click close (X) button
  4. Run pipeline again
- **Expected**:
  - Node list toggles visibility
  - Monitor slides down and disappears
  - New execution shows fresh monitor
- **Status**: ⏳ Pending

---

### 7. Structured Logging System

**Test Case 7.1: Log Level Filtering**
- **Steps**:
  1. Run pipeline (generates logs at all levels)
  2. Open Logs panel
  3. Filter by: Debug, Info, Warn, Error, All
- **Expected**:
  - All filter: Shows all logs
  - Debug filter: Only debug messages
  - Error filter: Only error messages
  - Log count badge updates accordingly
- **Status**: ⏳ Pending

**Test Case 7.2: Log Search**
- **Steps**:
  1. Generate 50+ log entries
  2. Search for "Pipeline"
  3. Search for specific node name
- **Expected**:
  - Results filtered in real-time
  - Matching text highlighted
  - Search in message and node name
- **Status**: ⏳ Pending

**Test Case 7.3: Log Export**
- **Steps**:
  1. Generate logs
  2. Export as JSON
  3. Export as CSV
- **Expected**:
  - JSON: Valid array of log objects with all fields
  - CSV: Headers + rows, proper escaping
  - Filename: `pipeline-logs-{timestamp}.{ext}`
- **Status**: ⏳ Pending

**Test Case 7.4: Log Entry Format**
- **Steps**:
  1. Check log entry display
  2. Verify all components
- **Expected**:
  - Time: HH:MM:SS format
  - Level: Colored tag (DEBUG/INFO/WARN/ERROR)
  - Message: Full text
  - Node name: Gray pill badge (if present)
  - Border color: Yellow for WARN, Red for ERROR
- **Status**: ⏳ Pending

**Test Case 7.5: Real-time Updates**
- **Steps**:
  1. Open Logs panel
  2. Run pipeline
  3. Observe logs appearing
- **Expected**:
  - New logs appear automatically
  - No page refresh needed
  - Logs ordered newest-first
  - Auto-scroll to latest (optional)
- **Status**: ⏳ Pending

---

### 8. Find and Replace

**Test Case 8.1: Find in Node Names**
- **Steps**:
  1. Create nodes: "Old Name 1", "Old Name 2", "Other"
  2. Find "Old Name"
  3. Check "Node Names" scope
- **Expected**:
  - 2 matches found
  - Matched nodes highlighted on canvas
  - Results list shows both nodes
- **Status**: ⏳ Pending

**Test Case 8.2: Replace in Transform Configs**
- **Steps**:
  1. Create Filter transform with column "old_column"
  2. Create Sort transform with "old_column"
  3. Find "old_column" in Transform Configs
  4. Replace with "new_column"
  5. Click "Replace All"
- **Expected**:
  - 2 matches found
  - Both transforms updated
  - Confirmation message: "Replaced 2 occurrences"
  - Transforms still functional
- **Status**: ⏳ Pending

**Test Case 8.3: Regex Replace**
- **Steps**:
  1. Create nodes: "Node_v1", "Node_v2", "Node_v3"
  2. Find with regex: `Node_v(\d+)`
  3. Replace with: `Transform_version_$1`
  4. Replace All
- **Expected**:
  - 3 matches found
  - Nodes renamed to: "Transform_version_1", "Transform_version_2", "Transform_version_3"
  - Regex capture groups work correctly
- **Status**: ⏳ Pending

**Test Case 8.4: Case Sensitive Replace**
- **Steps**:
  1. Create nodes with "Product" and "product"
  2. Find "product" (case-sensitive ON)
  3. Replace with "Item"
- **Expected**:
  - Only lowercase "product" replaced
  - "Product" unchanged
- **Status**: ⏳ Pending

**Test Case 8.5: Whole Word Matching**
- **Steps**:
  1. Create nodes: "Count", "Counter", "Recount"
  2. Find "Count" (whole word ON)
  3. Replace with "Total"
- **Expected**:
  - Only "Count" matched
  - "Counter" and "Recount" not matched
- **Status**: ⏳ Pending

---

### 9. Integration Tests

**Test Case 9.1: Complete Pipeline Workflow**
- **Steps**:
  1. Import CSV data
  2. Add Filter transform
  3. Add Group By transform
  4. Run pipeline
  5. View execution monitor
  6. Check logs
  7. Export results as Excel
- **Expected**:
  - All steps execute without errors
  - Data flows correctly through transforms
  - Monitor shows accurate progress
  - Logs capture all operations
  - Export contains expected results
- **Status**: ⏳ Pending

**Test Case 9.2: Search → Edit → Replace Workflow**
- **Steps**:
  1. Create 10-node pipeline
  2. Use Node Search to find specific node
  3. Edit node name
  4. Use Find & Replace to update references
  5. Run pipeline
- **Expected**:
  - Search highlights correct nodes
  - Edit persists correctly
  - Replace updates all references
  - Pipeline executes successfully
- **Status**: ⏳ Pending

**Test Case 9.3: Copy-Paste → Modify → Execute**
- **Steps**:
  1. Create transform chain (3 nodes)
  2. Copy all 3 nodes
  3. Paste (verify offset)
  4. Modify pasted nodes
  5. Run both chains in parallel
- **Expected**:
  - Paste creates exact copies
  - Offset prevents overlap
  - Both chains execute independently
  - No data interference
- **Status**: ⏳ Pending

---

## Browser Compatibility

### Compatibility Matrix

| Feature | Chrome 120+ | Firefox 121+ | Safari 17+ | Edge 120+ |
|---------|-------------|--------------|------------|-----------|
| Data Export | ⏳ | ⏳ | ⏳ | ⏳ |
| Selection UI | ⏳ | ⏳ | ⏳ | ⏳ |
| Copy-Paste | ⏳ | ⏳ | ⏳ | ⏳ |
| Node Search | ⏳ | ⏳ | ⏳ | ⏳ |
| Code Editor | ⏳ | ⏳ | ⏳ | ⏳ |
| Execution Monitor | ⏳ | ⏳ | ⏳ | ⏳ |
| Logging | ⏳ | ⏳ | ⏳ | ⏳ |
| Find & Replace | ⏳ | ⏳ | ⏳ | ⏳ |
| Graph Canvas | ⏳ | ⏳ | ⏳ | ⏳ |
| File Import | ⏳ | ⏳ | ⏳ | ⏳ |

### Known Issues

- **Safari**: Clipboard API may require additional permissions
- **Firefox**: CSS animations may have slight timing differences
- **Edge**: Full compatibility expected (Chromium-based)

---

## Performance Benchmarks

### Load Performance

**Test Case P.1: Large Dataset (10,000 rows)**
- **Target**: Load and render < 2 seconds
- **Measure**: Time from data import to canvas ready
- **Status**: ⏳ Pending

**Test Case P.2: Complex Pipeline (20+ nodes)**
- **Target**: Canvas rendering < 1 second
- **Measure**: Time to render all nodes and edges
- **Status**: ⏳ Pending

### Execution Performance

**Test Case P.3: Transform Execution**
- **Target**: < 500ms per transform (10k rows)
- **Measure**: Individual transform execution time
- **Status**: ⏳ Pending

**Test Case P.4: Full Pipeline (10 nodes)**
- **Target**: < 5 seconds total (10k rows)
- **Measure**: Start to completion time
- **Status**: ⏳ Pending

### UI Responsiveness

**Test Case P.5: Search Performance**
- **Target**: < 100ms for search results
- **Measure**: Time from keypress to results display
- **Status**: ⏳ Pending

**Test Case P.6: Selection Animation**
- **Target**: 60 FPS during rubberband selection
- **Measure**: Frame rate during selection
- **Status**: ⏳ Pending

---

## Regression Testing

### Core Functionality Checklist

- [ ] **Node Operations**
  - [ ] Add dataset node
  - [ ] Add transform node
  - [ ] Add join node
  - [ ] Delete node
  - [ ] Move node
  - [ ] Connect nodes
  - [ ] Disconnect nodes

- [ ] **Transform Types** (All 17)
  - [ ] Filter
  - [ ] Sort
  - [ ] Distinct
  - [ ] Select Columns
  - [ ] Rename Columns
  - [ ] Add Column
  - [ ] Remove Columns
  - [ ] Group By
  - [ ] Join
  - [ ] Trim Whitespace
  - [ ] Clean String
  - [ ] Title Case
  - [ ] Replace Values
  - [ ] Split Columns
  - [ ] Cast
  - [ ] Python Transform
  - [ ] SQL Transform

- [ ] **Canvas Operations**
  - [ ] Pan (Ctrl+Drag)
  - [ ] Zoom (Ctrl+Scroll)
  - [ ] Fit to screen
  - [ ] Mini-map navigation
  - [ ] Undo/Redo
  - [ ] Keyboard shortcuts

- [ ] **Data Operations**
  - [ ] Import CSV
  - [ ] Import JSON
  - [ ] Preview data
  - [ ] Run pipeline
  - [ ] View results

---

## User Acceptance Testing

### UAT Scenarios

**Scenario 1: Data Analyst - Sales Report**
- **User Story**: As a data analyst, I want to analyze monthly sales data
- **Steps**:
  1. Import sales CSV
  2. Filter for Q4 2024
  3. Group by product category
  4. Sort by total revenue
  5. Export as Excel for presentation
- **Acceptance**: Complete report generated in < 5 minutes
- **Status**: ⏳ Pending

**Scenario 2: Business User - Customer Segmentation**
- **User Story**: As a business user, I want to segment customers by purchase behavior
- **Steps**:
  1. Import customer and transaction data
  2. Join datasets on customer_id
  3. Use Python transform to calculate RFM score
  4. Filter high-value customers
  5. Export list as CSV
- **Acceptance**: Accurate segmentation with no technical issues
- **Status**: ⏳ Pending

**Scenario 3: Developer - Data Pipeline Debug**
- **User Story**: As a developer, I want to debug why my pipeline is failing
- **Steps**:
  1. Load existing pipeline
  2. Run pipeline
  3. Check execution monitor for failed node
  4. Review logs for error details
  5. Fix transform configuration
  6. Re-run successfully
- **Acceptance**: Error identified and fixed using built-in tools
- **Status**: ⏳ Pending

---

## Test Execution Schedule

### Phase 1: Core Feature Testing (Week 1)
- Data Export (4 tests)
- Enhanced Selection (3 tests)
- Smart Copy-Paste (3 tests)
- **Target**: 90% pass rate

### Phase 2: Advanced Features (Week 2)
- Node Search (4 tests)
- Code Editor (4 tests)
- Execution Monitor (4 tests)
- **Target**: 85% pass rate

### Phase 3: System Testing (Week 3)
- Logging System (5 tests)
- Find & Replace (5 tests)
- Integration tests (3 tests)
- **Target**: 80% pass rate

### Phase 4: Non-Functional Testing (Week 4)
- Browser compatibility (40 tests)
- Performance benchmarks (6 tests)
- UAT scenarios (3 scenarios)
- **Target**: All browsers green, performance targets met

---

## Test Reporting

### Test Metrics

- **Total Test Cases**: 65
- **Passed**: 0
- **Failed**: 0
- **Pending**: 65
- **Coverage**: 0%

### Exit Criteria

- ✅ 90% of test cases passed
- ✅ No critical bugs remaining
- ✅ All browsers supported
- ✅ Performance targets met
- ✅ UAT scenarios successful

---

## Bug Tracking Template

### Bug Report Format

```markdown
**Bug ID**: BUG-001
**Title**: [Short description]
**Severity**: Critical / High / Medium / Low
**Component**: [Component name]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]
**Actual**: [What actually happened]
**Browser**: [Chrome 120 / Firefox 121 / etc.]
**Screenshot**: [Attach if applicable]
**Logs**: [Relevant console errors]
```

---

## Appendix

### Testing Tools

- **Browser DevTools**: Performance profiling, network analysis
- **Vue DevTools**: Component inspection, state debugging
- **Lighthouse**: Performance auditing
- **Manual**: User workflows, visual inspection

### Test Data

- **products.csv**: 1000 rows, 8 columns
- **customers.csv**: 500 rows, 12 columns
- **transactions.csv**: 5000 rows, 10 columns
- **large_dataset.csv**: 50,000 rows, 20 columns

---

**Document Version**: 1.0
**Last Updated**: 2024
**Owner**: Development Team
**Status**: Ready for Execution
