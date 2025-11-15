<template>
  <div class="transform-config-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-left">
        <FunctionOutlined class="header-icon" />
        <h3>Transform Configuration</h3>
      </div>
      <a-button type="text" size="small" @click="handleClose">
        <CloseOutlined />
      </a-button>
    </div>

    <!-- Node Info -->
    <div class="node-info-section" v-if="node">
      <div class="info-row">
        <span class="info-label">Node:</span>
        <span class="info-value">{{ node.name }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Type:</span>
        <a-tag color="purple">Transform</a-tag>
      </div>
    </div>

    <a-divider style="margin: 12px 0" />

    <!-- Transform Type Selection -->
    <div class="config-section">
      <label class="section-label">{{ t('transform.actions.selectTransformType') }}</label>
      <a-select
        v-model:value="transformConfig.type"
        style="width: 100%"
        size="large"
        show-search
        :filter-option="filterTransformOption"
        @change="handleTypeChange"
      >
        <!-- 基础操作 -->
        <a-select-opt-group label="Basic Operations">
          <a-select-option value="filter">
            <FilterOutlined style="margin-right: 8px" />
            {{ t('transform.types.filter') }}
          </a-select-option>
          <a-select-option value="selectColumns">
            <CheckSquareOutlined style="margin-right: 8px" />
            {{ t('transform.types.selectColumns') }}
          </a-select-option>
          <a-select-option value="renameColumns">
            <EditOutlined style="margin-right: 8px" />
            {{ t('transform.types.renameColumns') }}
          </a-select-option>
          <a-select-option value="removeColumns">
            <DeleteOutlined style="margin-right: 8px" />
            {{ t('transform.types.removeColumns') }}
          </a-select-option>
          <a-select-option value="sort">
            <SortAscendingOutlined style="margin-right: 8px" />
            {{ t('transform.types.sort') }}
          </a-select-option>
          <a-select-option value="distinct">
            {{ t('transform.types.distinct') }}
          </a-select-option>
          <a-select-option value="fillNull">
            {{ t('transform.types.fillNull') }}
          </a-select-option>
        </a-select-opt-group>

        <!-- 字符串处理 -->
        <a-select-opt-group label="String Operations">
          <a-select-option value="trimWhitespace">
            {{ t('transform.types.trimWhitespace') }}
          </a-select-option>
          <a-select-option value="uppercase">
            {{ t('transform.types.uppercase') }}
          </a-select-option>
          <a-select-option value="lowercase">
            {{ t('transform.types.lowercase') }}
          </a-select-option>
          <a-select-option value="titleCase">
            {{ t('transform.types.titleCase') }}
          </a-select-option>
          <a-select-option value="concatenate">
            {{ t('transform.types.concatenate') }}
          </a-select-option>
          <a-select-option value="extract">
            {{ t('transform.types.extract') }}
          </a-select-option>
          <a-select-option value="regexExtract">
            {{ t('transform.types.regexExtract') }}
          </a-select-option>
          <a-select-option value="splitColumns">
            {{ t('transform.types.splitColumns') }}
          </a-select-option>
          <a-select-option value="replaceValues">
            {{ t('transform.types.replaceValues') }}
          </a-select-option>
          <a-select-option value="padString">
            {{ t('transform.types.padString') }}
          </a-select-option>
          <a-select-option value="parseJson">
            {{ t('transform.types.parseJson') }}
          </a-select-option>
          <a-select-option value="parseUrl">
            {{ t('transform.types.parseUrl') }}
          </a-select-option>
        </a-select-opt-group>

        <!-- 数值处理 -->
        <a-select-opt-group label="Numeric Operations">
          <a-select-option value="cast">
            {{ t('transform.types.cast') }}
          </a-select-option>
          <a-select-option value="round">
            {{ t('transform.types.round') }}
          </a-select-option>
          <a-select-option value="floor">
            {{ t('transform.types.floor') }}
          </a-select-option>
          <a-select-option value="ceiling">
            {{ t('transform.types.ceiling') }}
          </a-select-option>
          <a-select-option value="absolute">
            {{ t('transform.types.absolute') }}
          </a-select-option>
          <a-select-option value="add">
            {{ t('transform.types.add') }}
          </a-select-option>
          <a-select-option value="subtract">
            {{ t('transform.types.subtract') }}
          </a-select-option>
          <a-select-option value="multiply">
            {{ t('transform.types.multiply') }}
          </a-select-option>
          <a-select-option value="divide">
            {{ t('transform.types.divide') }}
          </a-select-option>
          <a-select-option value="modulo">
            {{ t('transform.types.modulo') }}
          </a-select-option>
          <a-select-option value="power">
            {{ t('transform.types.power') }}
          </a-select-option>
        </a-select-opt-group>

        <!-- 日期时间处理 -->
        <a-select-opt-group label="Date/Time Operations">
          <a-select-option value="formatDate">
            {{ t('transform.types.formatDate') }}
          </a-select-option>
          <a-select-option value="parseDate">
            {{ t('transform.types.parseDate') }}
          </a-select-option>
          <a-select-option value="extractYear">
            {{ t('transform.types.extractYear') }}
          </a-select-option>
          <a-select-option value="extractMonth">
            {{ t('transform.types.extractMonth') }}
          </a-select-option>
          <a-select-option value="extractDay">
            {{ t('transform.types.extractDay') }}
          </a-select-option>
          <a-select-option value="extractHour">
            {{ t('transform.types.extractHour') }}
          </a-select-option>
          <a-select-option value="extractMinute">
            {{ t('transform.types.extractMinute') }}
          </a-select-option>
          <a-select-option value="addDays">
            {{ t('transform.types.addDays') }}
          </a-select-option>
          <a-select-option value="addMonths">
            {{ t('transform.types.addMonths') }}
          </a-select-option>
          <a-select-option value="addYears">
            {{ t('transform.types.addYears') }}
          </a-select-option>
          <a-select-option value="dateDiff">
            {{ t('transform.types.dateDiff') }}
          </a-select-option>
        </a-select-opt-group>

        <!-- 聚合与分组 -->
        <a-select-opt-group label="Aggregation & Grouping">
          <a-select-option value="groupBy">
            <GroupOutlined style="margin-right: 8px" />
            {{ t('transform.types.groupBy') }}
          </a-select-option>
          <a-select-option value="pivot">
            {{ t('transform.types.pivot') }}
          </a-select-option>
          <a-select-option value="unpivot">
            {{ t('transform.types.unpivot') }}
          </a-select-option>
        </a-select-opt-group>

        <!-- 高级操作 -->
        <a-select-opt-group label="Advanced Operations">
          <a-select-option value="conditionalColumn">
            {{ t('transform.types.conditionalColumn') }}
          </a-select-option>
          <a-select-option value="rank">
            {{ t('transform.types.rank') }}
          </a-select-option>
          <a-select-option value="rowNumber">
            {{ t('transform.types.rowNumber') }}
          </a-select-option>
          <a-select-option value="lag">
            {{ t('transform.types.lag') }}
          </a-select-option>
          <a-select-option value="lead">
            {{ t('transform.types.lead') }}
          </a-select-option>
          <a-select-option value="cumSum">
            {{ t('transform.types.cumSum') }}
          </a-select-option>
          <a-select-option value="percentile">
            {{ t('transform.types.percentile') }}
          </a-select-option>
        </a-select-opt-group>
      </a-select>
    </div>

    <!-- Dynamic Configuration Based on Type -->
    <div class="config-content">
      <!-- Filter Configuration -->
      <div v-if="transformConfig.type === 'filter'" class="transform-type-config">
        <h4 class="config-title">Filter Conditions</h4>
        <p class="config-desc">Keep only rows that match the following conditions</p>

        <div
          v-for="(condition, index) in filterConditions"
          :key="index"
          class="condition-row"
        >
          <a-select
            v-model:value="condition.column"
            placeholder="Select column"
            style="flex: 1"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }} ({{ col.type }})
            </a-select-option>
          </a-select>

          <a-select v-model:value="condition.operator" style="width: 120px">
            <a-select-option value="equals">Equals</a-select-option>
            <a-select-option value="not_equals">Not Equals</a-select-option>
            <a-select-option value="contains">Contains</a-select-option>
            <a-select-option value="greater_than">Greater Than</a-select-option>
            <a-select-option value="less_than">Less Than</a-select-option>
            <a-select-option value="is_null">Is Null</a-select-option>
            <a-select-option value="not_null">Not Null</a-select-option>
          </a-select>

          <a-input
            v-if="!['is_null', 'not_null'].includes(condition.operator)"
            v-model:value="condition.value"
            placeholder="Value"
            style="flex: 1"
          />

          <a-button
            type="text"
            danger
            @click="removeCondition(index)"
            :disabled="filterConditions.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addCondition" style="margin-top: 12px">
          <PlusOutlined /> Add Condition
        </a-button>
      </div>

      <!-- Select Columns Configuration -->
      <div v-else-if="transformConfig.type === 'select'" class="transform-type-config">
        <h4 class="config-title">Select Columns</h4>
        <p class="config-desc">Choose which columns to keep in the output</p>

        <a-checkbox-group
          v-model:value="selectedColumns"
          style="width: 100%"
        >
          <div class="columns-list">
            <div
              v-for="col in availableColumns"
              :key="col.name"
              class="column-checkbox-item"
            >
              <a-checkbox :value="col.name">
                <component :is="getColumnIcon(col.type)" class="column-type-icon" />
                {{ col.name }}
                <a-tag size="small" :color="getColumnTypeColor(col.type)">
                  {{ col.type }}
                </a-tag>
              </a-checkbox>
            </div>
          </div>
        </a-checkbox-group>

        <div class="selection-summary">
          Selected: {{ selectedColumns.length }} / {{ availableColumns.length }} columns
        </div>
      </div>

      <!-- Clean Data Configuration -->
      <div v-else-if="transformConfig.type === 'clean'" class="transform-type-config">
        <h4 class="config-title">Data Cleaning Options</h4>
        <p class="config-desc">Apply common data cleaning operations</p>

        <div class="clean-options">
          <a-checkbox v-model:checked="cleanOptions.removeNulls">
            Remove rows with null values
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.removeDuplicates">
            Remove duplicate rows
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.trimWhitespace">
            Trim whitespace from text columns
          </a-checkbox>
          <a-checkbox v-model:checked="cleanOptions.standardizeCase">
            Standardize text case (lowercase)
          </a-checkbox>
        </div>

        <div class="clean-column-selection" v-if="cleanOptions.removeNulls">
          <label class="section-label">Columns to check for nulls:</label>
          <a-select
            v-model:value="cleanOptions.nullCheckColumns"
            mode="multiple"
            placeholder="Select columns"
            style="width: 100%"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <!-- Rename Columns Configuration -->
      <div v-else-if="transformConfig.type === 'rename'" class="transform-type-config">
        <h4 class="config-title">Rename Columns</h4>
        <p class="config-desc">Change column names</p>

        <div
          v-for="(rename, index) in renameColumns"
          :key="index"
          class="rename-row"
        >
          <a-select
            v-model:value="rename.from"
            placeholder="Original name"
            style="flex: 1"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <ArrowRightOutlined style="margin: 0 12px; color: #98A2B3;" />

          <a-input
            v-model:value="rename.to"
            placeholder="New name"
            style="flex: 1"
          />

          <a-button
            type="text"
            danger
            @click="removeRename(index)"
            :disabled="renameColumns.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addRename" style="margin-top: 12px">
          <PlusOutlined /> Add Rename
        </a-button>
      </div>

      <!-- Aggregate Configuration -->
      <div v-else-if="transformConfig.type === 'aggregate'" class="transform-type-config">
        <h4 class="config-title">Aggregate Data</h4>
        <p class="config-desc">Group and aggregate rows</p>

        <div class="aggregate-config">
          <label class="section-label">Group By:</label>
          <a-select
            v-model:value="aggregateConfig.groupBy"
            mode="multiple"
            placeholder="Select columns to group by"
            style="width: 100%"
          >
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <label class="section-label" style="margin-top: 16px">Aggregations:</label>
          <div
            v-for="(agg, index) in aggregateConfig.aggregations"
            :key="index"
            class="aggregate-row"
          >
            <a-select v-model:value="agg.column" placeholder="Column" style="flex: 1">
              <a-select-option
                v-for="col in availableColumns"
                :key="col.name"
                :value="col.name"
              >
                {{ col.name }}
              </a-select-option>
            </a-select>

            <a-select v-model:value="agg.function" style="width: 120px">
              <a-select-option value="count">Count</a-select-option>
              <a-select-option value="sum">Sum</a-select-option>
              <a-select-option value="avg">Average</a-select-option>
              <a-select-option value="min">Min</a-select-option>
              <a-select-option value="max">Max</a-select-option>
            </a-select>

            <a-button type="text" danger @click="removeAggregation(index)">
              <DeleteOutlined />
            </a-button>
          </div>

          <a-button block @click="addAggregation" style="margin-top: 12px">
            <PlusOutlined /> Add Aggregation
          </a-button>
        </div>
      </div>

      <!-- Sort Configuration -->
      <div v-else-if="transformConfig.type === 'sort'" class="transform-type-config">
        <h4 class="config-title">Sort Data</h4>
        <p class="config-desc">Order rows by column values</p>

        <div
          v-for="(sort, index) in sortConfig"
          :key="index"
          class="sort-row"
        >
          <a-select v-model:value="sort.column" placeholder="Column" style="flex: 1">
            <a-select-option
              v-for="col in availableColumns"
              :key="col.name"
              :value="col.name"
            >
              {{ col.name }}
            </a-select-option>
          </a-select>

          <a-select v-model:value="sort.order" style="width: 140px">
            <a-select-option value="asc">
              <SortAscendingOutlined /> Ascending
            </a-select-option>
            <a-select-option value="desc">
              <SortDescendingOutlined /> Descending
            </a-select-option>
          </a-select>

          <a-button
            type="text"
            danger
            @click="removeSort(index)"
            :disabled="sortConfig.length === 1"
          >
            <DeleteOutlined />
          </a-button>
        </div>

        <a-button block @click="addSort" style="margin-top: 12px">
          <PlusOutlined /> Add Sort
        </a-button>
      </div>

      <!-- Uppercase Configuration -->
      <div v-else-if="transformConfig.type === 'uppercase'" class="transform-type-config">
        <h4 class="config-title">Convert to Uppercase</h4>
        <p class="config-desc">Convert text in selected columns to uppercase</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="uppercaseConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Lowercase Configuration -->
      <div v-else-if="transformConfig.type === 'lowercase'" class="transform-type-config">
        <h4 class="config-title">Convert to Lowercase</h4>
        <p class="config-desc">Convert text in selected columns to lowercase</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="lowercaseConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Title Case Configuration -->
      <div v-else-if="transformConfig.type === 'titleCase'" class="transform-type-config">
        <h4 class="config-title">Convert to Title Case</h4>
        <p class="config-desc">Capitalize the first letter of each word</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="titleCaseConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Concatenate Configuration -->
      <div v-else-if="transformConfig.type === 'concatenate'" class="transform-type-config">
        <h4 class="config-title">Concatenate Columns</h4>
        <p class="config-desc">Combine multiple columns into a single column</p>

        <label class="section-label">Select Columns to Concatenate:</label>
        <a-select
          v-model:value="concatenateConfig.columns"
          mode="multiple"
          placeholder="Select columns"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Separator (optional):</label>
        <a-input
          v-model:value="concatenateConfig.separator"
          placeholder="e.g., space, comma, or empty"
          style="margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="concatenateConfig.outputColumn"
          placeholder="e.g., full_name"
        />
      </div>

      <!-- Extract Substring Configuration -->
      <div v-else-if="transformConfig.type === 'extract'" class="transform-type-config">
        <h4 class="config-title">Extract Substring</h4>
        <p class="config-desc">Extract a portion of text from a column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Start Index:</label>
        <a-input-number
          v-model:value="extractConfig.start"
          :min="0"
          placeholder="0"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Length:</label>
        <a-input-number
          v-model:value="extractConfig.length"
          :min="1"
          placeholder="10"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractConfig.outputColumn"
          placeholder="e.g., substring"
        />
      </div>

      <!-- Regex Extract Configuration -->
      <div v-else-if="transformConfig.type === 'regexExtract'" class="transform-type-config">
        <h4 class="config-title">Regex Extract</h4>
        <p class="config-desc">Extract text using regular expression pattern</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="regexExtractConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Regular Expression Pattern:</label>
        <a-input
          v-model:value="regexExtractConfig.pattern"
          placeholder="e.g., (\d{3})-(\d{4})"
          style="margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="regexExtractConfig.outputColumn"
          placeholder="e.g., extracted_value"
        />
      </div>

      <!-- Pad String Configuration -->
      <div v-else-if="transformConfig.type === 'padString'" class="transform-type-config">
        <h4 class="config-title">Pad String</h4>
        <p class="config-desc">Add padding characters to strings</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="padStringConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Target Length:</label>
        <a-input-number
          v-model:value="padStringConfig.length"
          :min="1"
          placeholder="10"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Pad Character:</label>
        <a-input
          v-model:value="padStringConfig.padChar"
          placeholder="e.g., 0 or space"
          maxlength="1"
          style="margin-bottom: 16px"
        />

        <label class="section-label">Pad Side:</label>
        <a-select
          v-model:value="padStringConfig.side"
          style="width: 100%"
        >
          <a-select-option value="left">Left (Pad Start)</a-select-option>
          <a-select-option value="right">Right (Pad End)</a-select-option>
        </a-select>
      </div>

      <!-- Parse JSON Configuration -->
      <div v-else-if="transformConfig.type === 'parseJson'" class="transform-type-config">
        <h4 class="config-title">Parse JSON</h4>
        <p class="config-desc">Parse JSON strings into separate columns</p>

        <label class="section-label">Select Column with JSON Data:</label>
        <a-select
          v-model:value="parseJsonConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Prefix:</label>
        <a-input
          v-model:value="parseJsonConfig.prefix"
          placeholder="e.g., json_"
        />
      </div>

      <!-- Parse URL Configuration -->
      <div v-else-if="transformConfig.type === 'parseUrl'" class="transform-type-config">
        <h4 class="config-title">Parse URL</h4>
        <p class="config-desc">Extract components from URLs (protocol, domain, path, etc.)</p>

        <label class="section-label">Select Column with URLs:</label>
        <a-select
          v-model:value="parseUrlConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Prefix:</label>
        <a-input
          v-model:value="parseUrlConfig.prefix"
          placeholder="e.g., url_"
        />
      </div>

      <!-- Trim Whitespace Configuration -->
      <div v-else-if="transformConfig.type === 'trimWhitespace'" class="transform-type-config">
        <h4 class="config-title">Trim Whitespace</h4>
        <p class="config-desc">Remove leading and trailing whitespace from text</p>

        <label class="section-label">Select Columns:</label>
        <a-select
          v-model:value="trimWhitespaceConfig.columns"
          mode="multiple"
          placeholder="Select columns"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Split Columns Configuration -->
      <div v-else-if="transformConfig.type === 'splitColumns'" class="transform-type-config">
        <h4 class="config-title">Split Column</h4>
        <p class="config-desc">Split a column into multiple columns based on a delimiter</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="splitColumnsConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Delimiter:</label>
        <a-input
          v-model:value="splitColumnsConfig.delimiter"
          placeholder="e.g., comma, space, pipe"
          style="margin-bottom: 16px"
        />

        <label class="section-label">Number of Splits:</label>
        <a-input-number
          v-model:value="splitColumnsConfig.maxSplits"
          :min="1"
          placeholder="2"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Names (comma-separated):</label>
        <a-input
          v-model:value="splitColumnsConfig.outputColumns"
          placeholder="e.g., first_name, last_name"
        />
      </div>

      <!-- Replace Values Configuration -->
      <div v-else-if="transformConfig.type === 'replaceValues'" class="transform-type-config">
        <h4 class="config-title">Replace Values</h4>
        <p class="config-desc">Find and replace values in a column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="replaceValuesConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Find (pattern or value):</label>
        <a-input
          v-model:value="replaceValuesConfig.find"
          placeholder="Text to find"
          style="margin-bottom: 16px"
        />

        <label class="section-label">Replace With:</label>
        <a-input
          v-model:value="replaceValuesConfig.replace"
          placeholder="Replacement text"
          style="margin-bottom: 16px"
        />

        <a-checkbox v-model:checked="replaceValuesConfig.useRegex">
          Use Regular Expression
        </a-checkbox>
      </div>

      <!-- Cast Type Configuration -->
      <div v-else-if="transformConfig.type === 'cast'" class="transform-type-config">
        <h4 class="config-title">Cast Type</h4>
        <p class="config-desc">Convert column to a different data type</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="castConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Target Data Type:</label>
        <a-select
          v-model:value="castConfig.targetType"
          style="width: 100%"
        >
          <a-select-option value="string">String</a-select-option>
          <a-select-option value="number">Number</a-select-option>
          <a-select-option value="integer">Integer</a-select-option>
          <a-select-option value="boolean">Boolean</a-select-option>
          <a-select-option value="date">Date</a-select-option>
        </a-select>
      </div>

      <!-- Round Configuration -->
      <div v-else-if="transformConfig.type === 'round'" class="transform-type-config">
        <h4 class="config-title">Round Numbers</h4>
        <p class="config-desc">Round numeric values to specified decimal places</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="roundConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Decimal Places:</label>
        <a-input-number
          v-model:value="roundConfig.decimals"
          :min="0"
          :max="10"
          placeholder="2"
          style="width: 100%"
        />
      </div>

      <!-- Floor Configuration -->
      <div v-else-if="transformConfig.type === 'floor'" class="transform-type-config">
        <h4 class="config-title">Floor</h4>
        <p class="config-desc">Round down to the nearest integer</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="floorConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Ceiling Configuration -->
      <div v-else-if="transformConfig.type === 'ceiling'" class="transform-type-config">
        <h4 class="config-title">Ceiling</h4>
        <p class="config-desc">Round up to the nearest integer</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="ceilingConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Absolute Value Configuration -->
      <div v-else-if="transformConfig.type === 'absolute'" class="transform-type-config">
        <h4 class="config-title">Absolute Value</h4>
        <p class="config-desc">Convert numbers to their absolute values</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="absoluteConfig.column"
          placeholder="Select column"
          style="width: 100%"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>
      </div>

      <!-- Add Configuration -->
      <div v-else-if="transformConfig.type === 'add'" class="transform-type-config">
        <h4 class="config-title">Add</h4>
        <p class="config-desc">Add two columns or add a constant value</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="addConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Add:</label>
        <a-radio-group v-model:value="addConfig.valueType" style="margin-bottom: 12px">
          <a-radio value="column">Column</a-radio>
          <a-radio value="constant">Constant Value</a-radio>
        </a-radio-group>

        <a-select
          v-if="addConfig.valueType === 'column'"
          v-model:value="addConfig.column2"
          placeholder="Select second column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <a-input-number
          v-else
          v-model:value="addConfig.value"
          placeholder="Enter value"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="addConfig.outputColumn"
          placeholder="e.g., sum"
        />
      </div>

      <!-- Subtract Configuration -->
      <div v-else-if="transformConfig.type === 'subtract'" class="transform-type-config">
        <h4 class="config-title">Subtract</h4>
        <p class="config-desc">Subtract two columns or subtract a constant value</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="subtractConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Subtract:</label>
        <a-radio-group v-model:value="subtractConfig.valueType" style="margin-bottom: 12px">
          <a-radio value="column">Column</a-radio>
          <a-radio value="constant">Constant Value</a-radio>
        </a-radio-group>

        <a-select
          v-if="subtractConfig.valueType === 'column'"
          v-model:value="subtractConfig.column2"
          placeholder="Select second column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <a-input-number
          v-else
          v-model:value="subtractConfig.value"
          placeholder="Enter value"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="subtractConfig.outputColumn"
          placeholder="e.g., difference"
        />
      </div>

      <!-- Multiply Configuration -->
      <div v-else-if="transformConfig.type === 'multiply'" class="transform-type-config">
        <h4 class="config-title">Multiply</h4>
        <p class="config-desc">Multiply two columns or multiply by a constant value</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="multiplyConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Multiply By:</label>
        <a-radio-group v-model:value="multiplyConfig.valueType" style="margin-bottom: 12px">
          <a-radio value="column">Column</a-radio>
          <a-radio value="constant">Constant Value</a-radio>
        </a-radio-group>

        <a-select
          v-if="multiplyConfig.valueType === 'column'"
          v-model:value="multiplyConfig.column2"
          placeholder="Select second column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <a-input-number
          v-else
          v-model:value="multiplyConfig.value"
          placeholder="Enter value"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="multiplyConfig.outputColumn"
          placeholder="e.g., product"
        />
      </div>

      <!-- Divide Configuration -->
      <div v-else-if="transformConfig.type === 'divide'" class="transform-type-config">
        <h4 class="config-title">Divide</h4>
        <p class="config-desc">Divide two columns or divide by a constant value</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="divideConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Divide By:</label>
        <a-radio-group v-model:value="divideConfig.valueType" style="margin-bottom: 12px">
          <a-radio value="column">Column</a-radio>
          <a-radio value="constant">Constant Value</a-radio>
        </a-radio-group>

        <a-select
          v-if="divideConfig.valueType === 'column'"
          v-model:value="divideConfig.column2"
          placeholder="Select second column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <a-input-number
          v-else
          v-model:value="divideConfig.value"
          placeholder="Enter value"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="divideConfig.outputColumn"
          placeholder="e.g., quotient"
        />
      </div>

      <!-- Modulo Configuration -->
      <div v-else-if="transformConfig.type === 'modulo'" class="transform-type-config">
        <h4 class="config-title">Modulo</h4>
        <p class="config-desc">Get the remainder after division</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="moduloConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Divisor:</label>
        <a-input-number
          v-model:value="moduloConfig.divisor"
          placeholder="Enter divisor"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="moduloConfig.outputColumn"
          placeholder="e.g., remainder"
        />
      </div>

      <!-- Power Configuration -->
      <div v-else-if="transformConfig.type === 'power'" class="transform-type-config">
        <h4 class="config-title">Power</h4>
        <p class="config-desc">Raise numbers to a power</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="powerConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Exponent:</label>
        <a-input-number
          v-model:value="powerConfig.exponent"
          placeholder="Enter exponent"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="powerConfig.outputColumn"
          placeholder="e.g., squared"
        />
      </div>

      <!-- Format Date Configuration -->
      <div v-else-if="transformConfig.type === 'formatDate'" class="transform-type-config">
        <h4 class="config-title">Format Date</h4>
        <p class="config-desc">Format dates using a specified pattern</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="formatDateConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Format Pattern:</label>
        <a-select
          v-model:value="formatDateConfig.format"
          style="width: 100%; margin-bottom: 8px"
        >
          <a-select-option value="YYYY-MM-DD">YYYY-MM-DD (2024-01-15)</a-select-option>
          <a-select-option value="MM/DD/YYYY">MM/DD/YYYY (01/15/2024)</a-select-option>
          <a-select-option value="DD/MM/YYYY">DD/MM/YYYY (15/01/2024)</a-select-option>
          <a-select-option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</a-select-option>
          <a-select-option value="custom">Custom Format</a-select-option>
        </a-select>

        <a-input
          v-if="formatDateConfig.format === 'custom'"
          v-model:value="formatDateConfig.customFormat"
          placeholder="e.g., YYYY/MM/DD"
          style="margin-top: 12px"
        />
      </div>

      <!-- Parse Date Configuration -->
      <div v-else-if="transformConfig.type === 'parseDate'" class="transform-type-config">
        <h4 class="config-title">Parse Date</h4>
        <p class="config-desc">Parse string into date using a format pattern</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="parseDateConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Input Format Pattern:</label>
        <a-input
          v-model:value="parseDateConfig.format"
          placeholder="e.g., MM/DD/YYYY"
        />
      </div>

      <!-- Extract Year Configuration -->
      <div v-else-if="transformConfig.type === 'extractYear'" class="transform-type-config">
        <h4 class="config-title">Extract Year</h4>
        <p class="config-desc">Extract the year from a date column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractYearConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractYearConfig.outputColumn"
          placeholder="e.g., year"
        />
      </div>

      <!-- Extract Month Configuration -->
      <div v-else-if="transformConfig.type === 'extractMonth'" class="transform-type-config">
        <h4 class="config-title">Extract Month</h4>
        <p class="config-desc">Extract the month from a date column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractMonthConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractMonthConfig.outputColumn"
          placeholder="e.g., month"
        />
      </div>

      <!-- Extract Day Configuration -->
      <div v-else-if="transformConfig.type === 'extractDay'" class="transform-type-config">
        <h4 class="config-title">Extract Day</h4>
        <p class="config-desc">Extract the day from a date column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractDayConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractDayConfig.outputColumn"
          placeholder="e.g., day"
        />
      </div>

      <!-- Extract Hour Configuration -->
      <div v-else-if="transformConfig.type === 'extractHour'" class="transform-type-config">
        <h4 class="config-title">Extract Hour</h4>
        <p class="config-desc">Extract the hour from a datetime column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractHourConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractHourConfig.outputColumn"
          placeholder="e.g., hour"
        />
      </div>

      <!-- Extract Minute Configuration -->
      <div v-else-if="transformConfig.type === 'extractMinute'" class="transform-type-config">
        <h4 class="config-title">Extract Minute</h4>
        <p class="config-desc">Extract the minute from a datetime column</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="extractMinuteConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="extractMinuteConfig.outputColumn"
          placeholder="e.g., minute"
        />
      </div>

      <!-- Add Days Configuration -->
      <div v-else-if="transformConfig.type === 'addDays'" class="transform-type-config">
        <h4 class="config-title">Add Days</h4>
        <p class="config-desc">Add or subtract days from a date</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="addDaysConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Number of Days (use negative for subtraction):</label>
        <a-input-number
          v-model:value="addDaysConfig.days"
          placeholder="e.g., 7 or -7"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="addDaysConfig.outputColumn"
          placeholder="e.g., new_date"
        />
      </div>

      <!-- Add Months Configuration -->
      <div v-else-if="transformConfig.type === 'addMonths'" class="transform-type-config">
        <h4 class="config-title">Add Months</h4>
        <p class="config-desc">Add or subtract months from a date</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="addMonthsConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Number of Months (use negative for subtraction):</label>
        <a-input-number
          v-model:value="addMonthsConfig.months"
          placeholder="e.g., 3 or -3"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="addMonthsConfig.outputColumn"
          placeholder="e.g., new_date"
        />
      </div>

      <!-- Add Years Configuration -->
      <div v-else-if="transformConfig.type === 'addYears'" class="transform-type-config">
        <h4 class="config-title">Add Years</h4>
        <p class="config-desc">Add or subtract years from a date</p>

        <label class="section-label">Select Column:</label>
        <a-select
          v-model:value="addYearsConfig.column"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Number of Years (use negative for subtraction):</label>
        <a-input-number
          v-model:value="addYearsConfig.years"
          placeholder="e.g., 1 or -1"
          style="width: 100%; margin-bottom: 16px"
        />

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="addYearsConfig.outputColumn"
          placeholder="e.g., new_date"
        />
      </div>

      <!-- Date Difference Configuration -->
      <div v-else-if="transformConfig.type === 'dateDiff'" class="transform-type-config">
        <h4 class="config-title">Date Difference</h4>
        <p class="config-desc">Calculate the difference between two dates</p>

        <label class="section-label">Start Date Column:</label>
        <a-select
          v-model:value="dateDiffConfig.column1"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">End Date Column:</label>
        <a-select
          v-model:value="dateDiffConfig.column2"
          placeholder="Select column"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option
            v-for="col in availableColumns"
            :key="col.name"
            :value="col.name"
          >
            {{ col.name }}
          </a-select-option>
        </a-select>

        <label class="section-label">Unit:</label>
        <a-select
          v-model:value="dateDiffConfig.unit"
          style="width: 100%; margin-bottom: 16px"
        >
          <a-select-option value="days">Days</a-select-option>
          <a-select-option value="months">Months</a-select-option>
          <a-select-option value="years">Years</a-select-option>
          <a-select-option value="hours">Hours</a-select-option>
          <a-select-option value="minutes">Minutes</a-select-option>
        </a-select>

        <label class="section-label">Output Column Name:</label>
        <a-input
          v-model:value="dateDiffConfig.outputColumn"
          placeholder="e.g., days_diff"
        />
      </div>
    </div>

    <!-- Actions -->
    <div class="panel-actions">
      <a-button @click="handleClose" style="margin-right: 8px">
        Cancel
      </a-button>
      <a-button type="primary" @click="handleApply" :loading="applying">
        Apply Transform
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import {
  FunctionOutlined,
  CloseOutlined,
  FilterOutlined,
  CheckSquareOutlined,
  ClearOutlined,
  EditOutlined,
  GroupOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  NumberOutlined,
  FontSizeOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons-vue'
import type { Node } from '@/stores/modules/pipeline'

const { t } = useI18n()

interface Props {
  node?: Node
  columns?: Array<{ name: string; type: string }>
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => []
})

const emit = defineEmits<{
  close: []
  apply: [config: any]
}>()

// Debug: Log props changes
console.log('=== TransformConfigPanel Mounted ===')
console.log('Node:', props.node)
console.log('Columns:', props.columns)

watch(() => props.node, (newVal) => {
  console.log('Node prop changed:', newVal)
})

watch(() => props.columns, (newVal) => {
  console.log('Columns prop changed:', newVal)
})

// Transform configuration
const transformConfig = ref({
  type: 'filter' as string
})

const applying = ref(false)

// Available columns
const availableColumns = computed(() => props.columns)

// Filter conditions
const filterConditions = ref([
  { column: '', operator: 'equals', value: '' }
])

// Selected columns
const selectedColumns = ref<string[]>([])

// Clean options
const cleanOptions = ref({
  removeNulls: false,
  removeDuplicates: false,
  trimWhitespace: false,
  standardizeCase: false,
  nullCheckColumns: [] as string[]
})

// Rename columns
const renameColumns = ref([
  { from: '', to: '' }
])

// Aggregate config
const aggregateConfig = ref({
  groupBy: [] as string[],
  aggregations: [
    { column: '', function: 'count' }
  ]
})

// Sort config
const sortConfig = ref([
  { column: '', order: 'asc' }
])

// String transform configs
const uppercaseConfig = ref({
  column: ''
})

const lowercaseConfig = ref({
  column: ''
})

const titleCaseConfig = ref({
  column: ''
})

const concatenateConfig = ref({
  columns: [] as string[],
  separator: ' ',
  outputColumn: ''
})

const extractConfig = ref({
  column: '',
  start: 0,
  length: 10,
  outputColumn: ''
})

const regexExtractConfig = ref({
  column: '',
  pattern: '',
  outputColumn: ''
})

const padStringConfig = ref({
  column: '',
  length: 10,
  padChar: '0',
  side: 'left'
})

const parseJsonConfig = ref({
  column: '',
  prefix: 'json_'
})

const parseUrlConfig = ref({
  column: '',
  prefix: 'url_'
})

const trimWhitespaceConfig = ref({
  columns: [] as string[]
})

const splitColumnsConfig = ref({
  column: '',
  delimiter: ',',
  maxSplits: 2,
  outputColumns: ''
})

const replaceValuesConfig = ref({
  column: '',
  find: '',
  replace: '',
  useRegex: false
})

// Numeric transform configs
const castConfig = ref({
  column: '',
  targetType: 'string'
})

const roundConfig = ref({
  column: '',
  decimals: 2
})

const floorConfig = ref({
  column: ''
})

const ceilingConfig = ref({
  column: ''
})

const absoluteConfig = ref({
  column: ''
})

const addConfig = ref({
  column: '',
  valueType: 'constant',
  column2: '',
  value: 0,
  outputColumn: ''
})

const subtractConfig = ref({
  column: '',
  valueType: 'constant',
  column2: '',
  value: 0,
  outputColumn: ''
})

const multiplyConfig = ref({
  column: '',
  valueType: 'constant',
  column2: '',
  value: 1,
  outputColumn: ''
})

const divideConfig = ref({
  column: '',
  valueType: 'constant',
  column2: '',
  value: 1,
  outputColumn: ''
})

const moduloConfig = ref({
  column: '',
  divisor: 2,
  outputColumn: ''
})

const powerConfig = ref({
  column: '',
  exponent: 2,
  outputColumn: ''
})

// Date/Time transform configs
const formatDateConfig = ref({
  column: '',
  format: 'YYYY-MM-DD',
  customFormat: ''
})

const parseDateConfig = ref({
  column: '',
  format: 'MM/DD/YYYY'
})

const extractYearConfig = ref({
  column: '',
  outputColumn: 'year'
})

const extractMonthConfig = ref({
  column: '',
  outputColumn: 'month'
})

const extractDayConfig = ref({
  column: '',
  outputColumn: 'day'
})

const extractHourConfig = ref({
  column: '',
  outputColumn: 'hour'
})

const extractMinuteConfig = ref({
  column: '',
  outputColumn: 'minute'
})

const addDaysConfig = ref({
  column: '',
  days: 1,
  outputColumn: ''
})

const addMonthsConfig = ref({
  column: '',
  months: 1,
  outputColumn: ''
})

const addYearsConfig = ref({
  column: '',
  years: 1,
  outputColumn: ''
})

const dateDiffConfig = ref({
  column1: '',
  column2: '',
  unit: 'days',
  outputColumn: ''
})

// Initialize selected columns when columns prop changes
watch(
  () => props.columns,
  (newColumns) => {
    if (newColumns.length > 0 && selectedColumns.value.length === 0) {
      selectedColumns.value = newColumns.map(col => col.name)
    }
  },
  { immediate: true }
)

// Handle type change
function handleTypeChange() {
  // Reset configurations when type changes
}

// Filter transform options for search
function filterTransformOption(input: string, option: any) {
  const searchText = input.toLowerCase()
  const optionText = option.children?.toLowerCase() || ''
  return optionText.includes(searchText)
}

// Filter conditions management
function addCondition() {
  filterConditions.value.push({ column: '', operator: 'equals', value: '' })
}

function removeCondition(index: number) {
  filterConditions.value.splice(index, 1)
}

// Rename management
function addRename() {
  renameColumns.value.push({ from: '', to: '' })
}

function removeRename(index: number) {
  renameColumns.value.splice(index, 1)
}

// Aggregation management
function addAggregation() {
  aggregateConfig.value.aggregations.push({ column: '', function: 'count' })
}

function removeAggregation(index: number) {
  aggregateConfig.value.aggregations.splice(index, 1)
}

// Sort management
function addSort() {
  sortConfig.value.push({ column: '', order: 'asc' })
}

function removeSort(index: number) {
  sortConfig.value.splice(index, 1)
}

// Get column icon
function getColumnIcon(type: string) {
  const iconMap: Record<string, any> = {
    'String': FontSizeOutlined,
    'Number': NumberOutlined,
    'Integer': NumberOutlined,
    'Boolean': CheckCircleOutlined,
    'Date': CalendarOutlined,
    'DateTime': CalendarOutlined
  }
  return iconMap[type] || FontSizeOutlined
}

// Get column type color
function getColumnTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'String': 'blue',
    'Number': 'green',
    'Integer': 'green',
    'Boolean': 'purple',
    'Date': 'orange',
    'DateTime': 'orange'
  }
  return colorMap[type] || 'default'
}

// Handle close
function handleClose() {
  emit('close')
}

// Handle apply
async function handleApply() {
  applying.value = true

  try {
    // Build configuration based on type
    let config: any = {
      type: transformConfig.value.type
    }

    switch (transformConfig.value.type) {
      case 'filter':
        config.conditions = filterConditions.value.filter(c => c.column && c.operator)
        break
      case 'select':
        config.columns = selectedColumns.value
        break
      case 'clean':
        config.options = cleanOptions.value
        break
      case 'rename':
        config.renames = renameColumns.value.filter(r => r.from && r.to)
        break
      case 'aggregate':
        config.groupBy = aggregateConfig.value.groupBy
        config.aggregations = aggregateConfig.value.aggregations.filter(a => a.column)
        break
      case 'sort':
        config.sorts = sortConfig.value.filter(s => s.column)
        break

      // String transforms
      case 'uppercase':
        config.column = uppercaseConfig.value.column
        break
      case 'lowercase':
        config.column = lowercaseConfig.value.column
        break
      case 'titleCase':
        config.column = titleCaseConfig.value.column
        break
      case 'concatenate':
        config.columns = concatenateConfig.value.columns
        config.separator = concatenateConfig.value.separator
        config.outputColumn = concatenateConfig.value.outputColumn
        break
      case 'extract':
        config.column = extractConfig.value.column
        config.start = extractConfig.value.start
        config.length = extractConfig.value.length
        config.outputColumn = extractConfig.value.outputColumn
        break
      case 'regexExtract':
        config.column = regexExtractConfig.value.column
        config.pattern = regexExtractConfig.value.pattern
        config.outputColumn = regexExtractConfig.value.outputColumn
        break
      case 'padString':
        config.column = padStringConfig.value.column
        config.length = padStringConfig.value.length
        config.padChar = padStringConfig.value.padChar
        config.side = padStringConfig.value.side
        break
      case 'parseJson':
        config.column = parseJsonConfig.value.column
        config.prefix = parseJsonConfig.value.prefix
        break
      case 'parseUrl':
        config.column = parseUrlConfig.value.column
        config.prefix = parseUrlConfig.value.prefix
        break
      case 'trimWhitespace':
        config.columns = trimWhitespaceConfig.value.columns
        break
      case 'splitColumns':
        config.column = splitColumnsConfig.value.column
        config.delimiter = splitColumnsConfig.value.delimiter
        config.maxSplits = splitColumnsConfig.value.maxSplits
        config.outputColumns = splitColumnsConfig.value.outputColumns.split(',').map(s => s.trim())
        break
      case 'replaceValues':
        config.column = replaceValuesConfig.value.column
        config.find = replaceValuesConfig.value.find
        config.replace = replaceValuesConfig.value.replace
        config.useRegex = replaceValuesConfig.value.useRegex
        break

      // Numeric transforms
      case 'cast':
        config.column = castConfig.value.column
        config.targetType = castConfig.value.targetType
        break
      case 'round':
        config.column = roundConfig.value.column
        config.decimals = roundConfig.value.decimals
        break
      case 'floor':
        config.column = floorConfig.value.column
        break
      case 'ceiling':
        config.column = ceilingConfig.value.column
        break
      case 'absolute':
        config.column = absoluteConfig.value.column
        break
      case 'add':
        config.column = addConfig.value.column
        config.valueType = addConfig.value.valueType
        if (addConfig.value.valueType === 'column') {
          config.column2 = addConfig.value.column2
        } else {
          config.value = addConfig.value.value
        }
        config.outputColumn = addConfig.value.outputColumn
        break
      case 'subtract':
        config.column = subtractConfig.value.column
        config.valueType = subtractConfig.value.valueType
        if (subtractConfig.value.valueType === 'column') {
          config.column2 = subtractConfig.value.column2
        } else {
          config.value = subtractConfig.value.value
        }
        config.outputColumn = subtractConfig.value.outputColumn
        break
      case 'multiply':
        config.column = multiplyConfig.value.column
        config.valueType = multiplyConfig.value.valueType
        if (multiplyConfig.value.valueType === 'column') {
          config.column2 = multiplyConfig.value.column2
        } else {
          config.value = multiplyConfig.value.value
        }
        config.outputColumn = multiplyConfig.value.outputColumn
        break
      case 'divide':
        config.column = divideConfig.value.column
        config.valueType = divideConfig.value.valueType
        if (divideConfig.value.valueType === 'column') {
          config.column2 = divideConfig.value.column2
        } else {
          config.value = divideConfig.value.value
        }
        config.outputColumn = divideConfig.value.outputColumn
        break
      case 'modulo':
        config.column = moduloConfig.value.column
        config.divisor = moduloConfig.value.divisor
        config.outputColumn = moduloConfig.value.outputColumn
        break
      case 'power':
        config.column = powerConfig.value.column
        config.exponent = powerConfig.value.exponent
        config.outputColumn = powerConfig.value.outputColumn
        break

      // Date/Time transforms
      case 'formatDate':
        config.column = formatDateConfig.value.column
        config.format = formatDateConfig.value.format === 'custom'
          ? formatDateConfig.value.customFormat
          : formatDateConfig.value.format
        break
      case 'parseDate':
        config.column = parseDateConfig.value.column
        config.format = parseDateConfig.value.format
        break
      case 'extractYear':
        config.column = extractYearConfig.value.column
        config.outputColumn = extractYearConfig.value.outputColumn
        break
      case 'extractMonth':
        config.column = extractMonthConfig.value.column
        config.outputColumn = extractMonthConfig.value.outputColumn
        break
      case 'extractDay':
        config.column = extractDayConfig.value.column
        config.outputColumn = extractDayConfig.value.outputColumn
        break
      case 'extractHour':
        config.column = extractHourConfig.value.column
        config.outputColumn = extractHourConfig.value.outputColumn
        break
      case 'extractMinute':
        config.column = extractMinuteConfig.value.column
        config.outputColumn = extractMinuteConfig.value.outputColumn
        break
      case 'addDays':
        config.column = addDaysConfig.value.column
        config.days = addDaysConfig.value.days
        config.outputColumn = addDaysConfig.value.outputColumn
        break
      case 'addMonths':
        config.column = addMonthsConfig.value.column
        config.months = addMonthsConfig.value.months
        config.outputColumn = addMonthsConfig.value.outputColumn
        break
      case 'addYears':
        config.column = addYearsConfig.value.column
        config.years = addYearsConfig.value.years
        config.outputColumn = addYearsConfig.value.outputColumn
        break
      case 'dateDiff':
        config.column1 = dateDiffConfig.value.column1
        config.column2 = dateDiffConfig.value.column2
        config.unit = dateDiffConfig.value.unit
        config.outputColumn = dateDiffConfig.value.outputColumn
        break
    }

    emit('apply', config)
    message.success('Transform applied successfully')
  } catch (error: any) {
    message.error('Failed to apply transform: ' + error.message)
  } finally {
    applying.value = false
  }
}
</script>

<style scoped lang="less">
.transform-config-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #E4E7EB;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .header-icon {
      font-size: 20px;
      color: #9334E6;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #212121;
    }
  }
}

.node-info-section {
  padding: 16px 20px;
  background: #F8F9FA;
  border-bottom: 1px solid #E4E7EB;

  .info-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-size: 13px;
      color: #5F6368;
      min-width: 60px;
    }

    .info-value {
      font-size: 13px;
      font-weight: 500;
      color: #212121;
    }
  }
}

.config-section {
  padding: 16px 20px;
  flex-shrink: 0;

  .section-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #212121;
    margin-bottom: 8px;
  }
}

.config-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;

  .transform-type-config {
    .config-title {
      font-size: 14px;
      font-weight: 600;
      color: #212121;
      margin: 0 0 8px 0;
    }

    .config-desc {
      font-size: 13px;
      color: #5F6368;
      margin-bottom: 20px;
    }
  }

  // Filter conditions
  .condition-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  // Columns list
  .columns-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;

    .column-checkbox-item {
      padding: 8px 12px;
      border: 1px solid #E4E7EB;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        border-color: #4285F4;
        background: #F8F9FA;
      }

      .column-type-icon {
        margin-right: 8px;
        color: #5F6368;
      }
    }
  }

  .selection-summary {
    padding: 12px;
    background: #F8F9FA;
    border-radius: 6px;
    font-size: 13px;
    color: #5F6368;
    text-align: center;
  }

  // Clean options
  .clean-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .clean-column-selection {
    margin-top: 16px;
  }

  // Rename rows
  .rename-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  // Aggregate config
  .aggregate-config {
    .section-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #212121;
      margin-bottom: 8px;
    }
  }

  .aggregate-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  // Sort rows
  .sort-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
}

.panel-actions {
  padding: 16px 20px;
  border-top: 1px solid #E4E7EB;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
