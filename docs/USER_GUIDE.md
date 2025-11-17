# 📖 Pipeline Builder - User Guide

Welcome to Pipeline Builder! This comprehensive guide will help you master all features of the visual data pipeline builder.

---

## 📚 Table of Contents

1. [Getting Started](#getting-started)
2. [Core Features](#core-features)
3. [Advanced Features](#advanced-features)
4. [Tips & Tricks](#tips--tricks)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Getting Started

### What is Pipeline Builder?

Pipeline Builder is a visual tool for creating data transformation pipelines. Think of it as a flowchart where each box represents a data operation, and arrows show how data flows between operations.

### First Pipeline

1. **Add Data Source**
   - Click "Add Data" button in toolbar
   - Choose from available datasets (Products, Customers, Transactions)
   - Or import your own CSV/JSON file

2. **Add Transform**
   - Double-click a dataset node
   - Choose a transform (Filter, Sort, Group By, etc.)
   - Configure the transform parameters
   - Click "Apply Transform"

3. **Run Pipeline**
   - Click the "Run" button (▶️) in toolbar
   - Watch real-time execution monitor
   - View results in the preview panel

---

## 🎯 Core Features

### 1. Graph Canvas Operations

#### Navigation
- **Pan**: Hold `Ctrl/Cmd` + Drag
- **Zoom In**: `Ctrl/Cmd` + Scroll Up or `+` button
- **Zoom Out**: `Ctrl/Cmd` + Scroll Down or `-` button
- **Fit to Screen**: Click compress icon button

#### Node Operations
- **Add Node**: Drag from node palette or use toolbar
- **Move Node**: Click and drag
- **Select Node**: Single click
- **Multi-Select**: `Shift` + Drag (rubberband selection)
- **Connect Nodes**: Drag from output port to input port

#### Keyboard Shortcuts
```
Ctrl/Cmd + C     Copy selected nodes
Ctrl/Cmd + V     Paste nodes
Ctrl/Cmd + A     Select all
Ctrl/Cmd + Z     Undo
Ctrl/Cmd + Y     Redo
Delete           Delete selected
Esc              Clear selection
```

### 2. Data Import/Export

#### Import Data
**Three Ways to Import**:

1. **CSV File**
   - Click "Add Data" → "Import from File"
   - Drag & drop or browse for CSV file
   - Configure delimiter (comma, semicolon, tab, pipe)
   - Check "First row is header" if applicable
   - Preview first 5 rows
   - Click "Import"

2. **JSON File**
   - Same process as CSV
   - Supports JSON array format
   - Auto-parses structure

3. **Manual Paste**
   - Click "Add Data" → "Paste Data"
   - Paste CSV-formatted text
   - Preview and import

#### Export Data
**Export Results**:

1. Run your pipeline
2. Click on an output node
3. In the preview panel, click "Export" dropdown
4. Choose format:
   - **CSV**: Standard comma-separated values
   - **Excel**: .xls file (opens in Excel)
   - **JSON**: Structured JSON array

**File Naming**: Automatically names files as `{NodeName}_{Date}.{ext}`

### 3. Transform Types (17 Available)

#### Basic Operations
- **Filter**: Keep rows matching conditions (10 operators)
- **Sort**: Order by columns (ascending/descending)
- **Distinct**: Remove duplicate rows

#### Column Operations
- **Select Columns**: Choose which columns to keep/exclude
- **Rename Columns**: Batch rename columns
- **Add Column**: Create calculated columns
- **Remove Columns**: Delete unwanted columns

#### String Transformations
- **Trim Whitespace**: Remove leading/trailing spaces
- **Clean String**: Clean and normalize text
- **Title Case**: Convert to title case
- **Replace Values**: Find and replace (exact/contains/regex)
- **Split Columns**: Split one column into multiple

#### Aggregations
- **Group By**: Group and aggregate data (7 functions: count, sum, avg, min, max, first, last)

#### Type Conversions
- **Cast**: Convert column types

#### Code-Based Transforms
- **Python Code**: Write custom Python (pandas)
- **SQL Query**: Write SQL queries

### 4. Node Types

#### Dataset Node (Blue)
- Represents a data source
- 0 inputs, 1 output
- Shows row count and column count

#### Transform Node (Purple)
- Applies transformations
- 1 input, 1 output
- Can stack multiple transforms

#### Join Node (Orange)
- Combines two datasets
- 2 inputs, 1 output
- Supports Inner/Left/Right/Full join
- Configure join keys and conditions

#### Output Node (Purple)
- Saves results
- 1 input, 0 outputs
- Marks the end of a pipeline branch

---

## 🔥 Advanced Features

### 1. Node Search & Highlighting

**Quick Find Nodes**:
1. Look for the search panel (top-right)
2. Type to search:
   - Node names
   - Node types
   - Data content
3. Use options:
   - ☑️ Case sensitive
   - ☑️ Whole word
   - ☑️ Regex

**Navigation**:
- Click a result to jump to node
- Use ↑↓ arrows to navigate matches
- Press `Enter` for next match
- Press `Esc` to clear

**Visual Feedback**:
- Matched nodes: Orange dashed border
- Camera smoothly pans to node
- Auto-selects for editing

### 2. Find and Replace

**Global Search & Replace**:
1. Press `Ctrl/Cmd + F` (if keyboard shortcut enabled)
2. Or use menu: Tools → Find and Replace
3. Enter find text
4. Enter replacement text
5. Choose scope:
   - ☑️ Node names
   - ☑️ Transform configs
   - ☑️ Column names
6. Options:
   - Case sensitive
   - Whole word matching
   - Regular expressions

**Replace Actions**:
- **Find**: Highlight all matches
- **Replace**: Replace current match
- **Replace All**: Replace all at once

**Example Use Cases**:
- Rename column `old_name` → `new_name` across all transforms
- Fix typos in node names
- Update dataset references

### 3. Code Editor (Python & SQL)

#### Python Transform

**Quick Start Templates**:
1. Add Column: Create calculated columns
2. Filter Rows: Complex filtering logic
3. Aggregate: Custom aggregations
4. Merge: Join with external data
5. Pivot: Create pivot tables

**Example - Add Column**:
```python
# Input: df (pandas DataFrame)
df['total_price'] = df['quantity'] * df['unit_price']
return df
```

**Available Libraries**:
- `pandas` (as pd)
- `numpy` (as np)

**Editor Features**:
- Line numbers
- Cursor position (line, column)
- Character count
- Tab = 2 spaces
- Copy code button
- Format JSON button

#### SQL Transform

**Quick Start Templates**:
1. Select All
2. Select Columns
3. Filter with WHERE
4. Group By & Aggregate
5. Join Tables
6. Order By

**Example - Aggregate**:
```sql
SELECT
  category,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount
FROM input_table
GROUP BY category
HAVING COUNT(*) > 5
ORDER BY total_amount DESC
```

**Table Names**:
- Input table: `input_table`
- Click column names to insert

### 4. Execution Monitoring

**Real-time Pipeline Execution**:

When you click "Run":
1. **Monitor appears** (bottom-right corner)
2. **Shows overall progress**: X / Y nodes completed
3. **Progress bar**: Visual percentage
4. **Node list**: Expand to see each node
   - ⏸️ Pending (gray)
   - ▶️ Running (blue, animated)
   - ✅ Success (green)
   - ❌ Error (red)
5. **Timing**: Live execution time
6. **Row counts**: Results per node

**Status Colors**:
- Blue: Running
- Green: Success
- Red: Error
- Gray: Not started

**Actions**:
- Click expand/collapse to toggle node list
- Click X to close (stays in history)
- View errors with full stack traces

### 5. Structured Logging

**View Pipeline Logs**:
1. Open bottom panel
2. Switch to "Logs" tab
3. See all execution logs

**Log Levels**:
- 🐛 DEBUG: Detailed debug info
- ℹ️ INFO: Normal operations
- ⚠️ WARN: Warnings (non-critical)
- ❌ ERROR: Errors and failures

**Features**:
- **Filter by level**: Show only errors, etc.
- **Search logs**: Find specific messages
- **Export**: Download as JSON or CSV
- **Clear**: Remove old logs

**Log Entry Format**:
```
[12:34:56] [INFO] Pipeline execution started
           Node: Products Dataset
```

### 6. Multi-Node Selection

**Select Multiple Nodes**:
- **Rubberband**: `Shift` + Drag
- **Add to selection**: `Shift` + Click
- **Select all**: `Ctrl/Cmd + A`

**Bulk Operations**:
- Copy: `Ctrl/Cmd + C`
- Delete: `Delete` key
- Move: Drag any selected node

**Visual Feedback**:
- Selection counter badge (top-center)
- "3 items selected"
- Pulsing selection boxes

### 7. Smart Copy-Paste

**Incremental Positioning**:
1. Select and copy nodes (`Ctrl + C`)
2. Paste once (`Ctrl + V`): +30px offset
3. Paste again: +50px offset
4. Paste again: +70px offset
5. Continue: +20px each time

**Visual Feedback**:
- Green flash when pasting
- 3-stage animation (600ms)
- Auto-selects pasted nodes

**Reset**:
- Copy again: Resets to 30px
- Click canvas: Resets counter

---

## 💡 Tips & Tricks

### Performance Tips

1. **Large Datasets**:
   - Filter early in pipeline
   - Remove unnecessary columns
   - Use sampling for development

2. **Complex Pipelines**:
   - Use descriptive node names
   - Group related operations
   - Add comments in Python/SQL transforms

3. **Collaboration**:
   - Export pipeline as JSON
   - Share configuration
   - Use consistent naming conventions

### Workflow Best Practices

1. **Start Simple**:
   - Begin with small sample data
   - Test transforms one at a time
   - Build complexity gradually

2. **Use Transforms Effectively**:
   - One operation per transform (easier to debug)
   - Name nodes clearly: "Filter Active Users"
   - Preview at each step

3. **Debug Issues**:
   - Check logs for errors
   - Use execution monitor
   - Test with small data first

### Keyboard Power User

**Essential Shortcuts**:
```
Ctrl + S        Save pipeline
Ctrl + C/V      Copy/Paste
Ctrl + Z/Y      Undo/Redo
Ctrl + F        Find and Replace
Ctrl + A        Select All
Delete          Delete selection
Esc             Clear selection
Shift + Drag    Multi-select
```

### Data Quality

**Before Running**:
- ✅ Check column types (Cast transform)
- ✅ Handle nulls (Filter or Fill)
- ✅ Remove duplicates (Distinct)
- ✅ Validate data ranges

**After Running**:
- ✅ Review row counts
- ✅ Check for unexpected nulls
- ✅ Verify calculations
- ✅ Export and validate externally

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "No data preview"
**Solution**:
1. Ensure pipeline has run successfully
2. Check node has input connection
3. Look for errors in execution monitor
4. Review logs for details

#### Issue: "Transform not applying"
**Solution**:
1. Click "Apply Transform" button
2. Check transform configuration is valid
3. Ensure column names match exactly
4. Review error messages

#### Issue: "Export button disabled"
**Solution**:
1. Run pipeline first
2. Select a node with data
3. Check execution completed successfully
4. Verify data exists (check row count)

#### Issue: "Nodes overlapping after paste"
**Solution**:
- This is fixed! Paste uses smart offset
- Each paste increments position
- Click canvas to reset offset counter

#### Issue: "Can't find my node"
**Solution**:
1. Use Node Search panel (top-right)
2. Type node name
3. Click result to jump to node
4. Or use Find and Replace for bulk edits

#### Issue: "Pipeline runs slow"
**Solution**:
1. Check data size (millions of rows?)
2. Add filters early in pipeline
3. Remove unnecessary columns
4. Consider sampling for development
5. Use Python/SQL for complex operations

### Error Messages

#### "Circular dependency detected"
**Meaning**: Pipeline has a loop
**Fix**: Remove connection creating the cycle

#### "Column not found: X"
**Meaning**: Transform references missing column
**Fix**:
1. Check previous transforms
2. Verify column name spelling
3. Ensure transform order is correct

#### "Type mismatch"
**Meaning**: Operation on wrong data type
**Fix**: Use Cast transform first

### Getting Help

1. **Documentation**: Check this guide
2. **Logs**: Review execution logs
3. **Community**: Join discussions
4. **Report Bug**: Create GitHub issue

---

## 🎓 Tutorials

### Tutorial 1: Basic Data Cleaning

**Goal**: Clean customer data

**Steps**:
1. Import `customers.csv`
2. Add **Trim Whitespace** transform
   - Select all text columns
3. Add **Filter** transform
   - Condition: `email` is not null
4. Add **Remove Columns** transform
   - Remove: `internal_notes`
5. Add **Sort** transform
   - By: `last_name` ascending
6. Run and export

### Tutorial 2: Sales Analysis

**Goal**: Analyze sales by category

**Steps**:
1. Import `transactions.csv`
2. Add **Filter** transform
   - `date >= '2024-01-01'`
   - `status = 'completed'`
3. Add **Group By** transform
   - Group by: `category`
   - Aggregations:
     - `amount`: Sum → `total_sales`
     - `amount`: Count → `num_transactions`
     - `amount`: Avg → `avg_transaction`
4. Add **Sort** transform
   - By: `total_sales` descending
5. Run and export

### Tutorial 3: Join Two Datasets

**Goal**: Combine customers and transactions

**Steps**:
1. Add `customers` dataset
2. Add `transactions` dataset
3. Add **Join** node
   - Connect both datasets
   - Type: Left Join
   - Key: `customer_id = customer_id`
4. Add **Select Columns** transform
   - Choose relevant columns
5. Add **Sort** transform
   - By: `transaction_date` descending
6. Run and view results

### Tutorial 4: Python Transform

**Goal**: Calculate custom metrics

**Steps**:
1. Add dataset
2. Add **Python Transform**
3. Use template: "Add Column"
4. Modify code:
```python
# Calculate discount percentage
df['discount_pct'] = (
    (df['original_price'] - df['sale_price']) / df['original_price'] * 100
).round(2)

# Add price tier
def price_tier(price):
    if price < 50: return 'Budget'
    elif price < 150: return 'Standard'
    else: return 'Premium'

df['price_tier'] = df['sale_price'].apply(price_tier)

return df
```
5. Click "Apply Transform"
6. Run pipeline

---

## 📊 Feature Matrix

| Feature | Keyboard | Mouse | Touch |
|---------|----------|-------|-------|
| Pan Canvas | Ctrl+Drag | Ctrl+Drag | 2-finger drag |
| Zoom | Ctrl+Scroll | Buttons | Pinch |
| Select | Ctrl+Click | Click | Tap |
| Multi-Select | Shift+Drag | Shift+Drag | - |
| Copy/Paste | Ctrl+C/V | Context Menu | - |
| Delete | Delete | Context Menu | - |
| Undo/Redo | Ctrl+Z/Y | Toolbar | - |

---

## 🚀 What's New in Latest Version

### Version 0.2.0 (Latest)

**New Features**:
- ✨ Code Editor (Python & SQL transforms)
- ✨ Real-time Execution Monitor
- ✨ Structured Logging System
- ✨ Find and Replace
- ✨ Data Export (CSV/Excel/JSON)
- ✨ Enhanced Selection UI
- ✨ Smart Copy-Paste
- ✨ Node Search with Highlighting

**Improvements**:
- 🎨 17 Transform types (up from 6)
- 🎨 Better visual feedback
- 🎨 Smoother animations
- ⚡ Performance optimizations

**Bug Fixes**:
- 🐛 Fixed overlapping paste issue
- 🐛 Improved error handling
- 🐛 Better TypeScript types

---

## 📞 Support

- **Documentation**: `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@example.com

---

**Happy Pipeline Building!** 🚀

*Last Updated: 2024*
