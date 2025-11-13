<template>
  <div class="pipeline-editor">
    <!-- Top navigation -->
    <div class="top-nav">
      <div class="nav-left">
        <!-- Back button -->
        <a-button type="text" class="back-btn" @click="handleBack">
          <LeftOutlined />
        </a-button>

        <!-- Breadcrumb -->
        <div class="breadcrumb">
          <span class="breadcrumb-item">[Gena] Palantir</span>
          <RightOutlined class="separator" />
          <span class="breadcrumb-item">Deep Dive: Building...</span>
          <RightOutlined class="separator" />
          <span class="breadcrumb-item active">Pipeline</span>
        </div>
      </div>

      <div class="nav-center">
        <div class="nav-tabs">
          <a-button
            :class="['tab-btn', { active: currentTab === 'graph' }]"
            @click="currentTab = 'graph'"
          >
            Graph
          </a-button>
          <a-button
            :class="['tab-btn', { active: currentTab === 'proposals' }]"
            @click="currentTab = 'proposals'"
          >
            Proposals
          </a-button>
          <a-button
            :class="['tab-btn', { active: currentTab === 'history' }]"
            @click="currentTab = 'history'"
          >
            History
          </a-button>
        </div>
      </div>

      <div class="nav-actions">
        <a-button class="action-btn" @click="handleUndo" :disabled="!canUndo">
          <UndoOutlined />
        </a-button>
        <a-button class="action-btn" @click="handleRedo" :disabled="!canRedo">
          <RedoOutlined />
        </a-button>
        <a-divider type="vertical" style="height: 20px; margin: 0 8px;" />
        <a-dropdown>
          <a-button class="action-btn">
            Main
            <DownOutlined style="font-size: 10px;" />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item key="main">Main</a-menu-item>
              <a-menu-item key="dev">Development</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-divider type="vertical" style="height: 20px; margin: 0 8px;" />
        <a-button class="action-btn" @click="handleSave">
          <SaveOutlined />
          Save
        </a-button>
        <a-button class="action-btn" @click="handlePropose">
          Propose
        </a-button>
        <a-button type="primary" class="deploy-btn" @click="handleDeploy">
          Deploy
        </a-button>
        <a-dropdown>
          <a-button class="action-btn">
            <MoreOutlined />
          </a-button>
          <template #overlay>
            <a-menu @click="handleMoreAction">
              <a-menu-item key="settings">Settings</a-menu-item>
              <a-menu-item key="export">Export</a-menu-item>
              <a-menu-item key="duplicate">Duplicate</a-menu-item>
              <a-menu-divider />
              <a-menu-item key="delete" danger>Delete</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </div>

    <!-- Toolbar - Palantir Style -->
    <div class="toolbar">
      <div class="toolbar-section">
        <span class="toolbar-label">Tools</span>
        <a-button class="toolbar-btn" :class="{ active: currentTool === 'move' }" @click="currentTool = 'move'">
          <DragOutlined />
        </a-button>
        <a-button class="toolbar-btn" :class="{ active: currentTool === 'select' }" @click="currentTool = 'select'">
          <SelectOutlined />
        </a-button>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Select</span>
        <a-button class="toolbar-icon-btn" @click="handleSelectAll" title="Select All (Ctrl+A)">
          <SelectOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleClearSelection" title="Clear Selection (Esc)">
          <CloseCircleOutlined />
        </a-button>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Remove</span>
        <a-button class="toolbar-icon-btn" @click="handleDeleteSelected" :disabled="!hasSelection" title="Delete Selected (Delete)">
          <DeleteOutlined />
        </a-button>
      </div>

      <div class="toolbar-section">
        <span class="toolbar-label">Layout</span>
        <a-button class="toolbar-icon-btn" @click="handleAutoLayout" title="Auto Layout">
          <NodeIndexOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleZoom('fit')" title="Fit to Screen">
          <CompressOutlined />
        </a-button>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <a-dropdown trigger="click">
          <a-button class="toolbar-dropdown-btn">
            <DownloadOutlined style="margin-right: 6px;" />
            Add data
            <DownOutlined style="margin-left: 6px; font-size: 10px;" />
          </a-button>
          <template #overlay>
            <a-menu @click="handleAddData" class="add-data-menu">
              <a-menu-item key="import-data">
                <UploadOutlined style="margin-right: 8px; color: #10B981;" />
                <span style="font-weight: 500;">Import CSV/JSON...</span>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item
                v-for="dataset in availableDatasets"
                :key="dataset.id"
              >
                <DatabaseOutlined style="margin-right: 8px; color: #1570EF;" />
                <span style="font-weight: 500;">{{ dataset.displayName }}</span>
                <span style="color: #98A2B3; margin-left: 8px; font-size: 12px;">
                  ({{ dataset.rowCount }} rows · {{ dataset.columns.length }} columns)
                </span>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Transform</span>
        <a-button class="toolbar-icon-btn" @click="handleAddTransformNode" title="Add Transform Node">
          <FilterOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleAddJoin" title="Add Join Node">
          <MergeCellsOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleAddOutputNode" title="Add Output Node">
          <ExportOutlined />
        </a-button>
      </div>

      <a-divider type="vertical" style="height: 32px; margin: 0 12px;" />

      <div class="toolbar-section">
        <span class="toolbar-label">Edit</span>
        <a-button class="toolbar-icon-btn" @click="handleUndo" :disabled="!canUndo">
          <UndoOutlined />
        </a-button>
        <a-button class="toolbar-icon-btn" @click="handleRedo" :disabled="!canRedo">
          <RedoOutlined />
        </a-button>
      </div>

      <div style="flex: 1;"></div>

      <div class="toolbar-section">
        <a-button type="primary" @click="handleRunPipeline" style="margin-right: 8px;">
          <PlayCircleOutlined /> Run
        </a-button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="main-content">
      <!-- Node Palette - Hidden for expanded canvas area -->
      <!-- <NodePalette
        @node-drag-start="handleNodeDragStart"
        @node-drag-end="handleNodeDragEnd"
      /> -->

      <!-- Canvas area -->
      <div class="canvas-area"
        @drop="handleCanvasDrop"
        @dragover="handleCanvasDragOver"
      >
        <GraphCanvas
          ref="canvasRef"
          :nodes="nodes"
          :edges="edges"
          :show-minimap="false"
          @node:click="handleNodeClick"
          @node:dblclick="handleNodeDoubleClick"
          @node:contextmenu="handleNodeContextMenu"
          @edge:added="handleEdgeAdded"
          @edge:contextmenu="handleEdgeContextMenu"
          @canvas:click="handleCanvasClick"
          @nodes:copied="handleNodesCopied"
          @nodes:pasted="handleNodesPasted"
        />

        <!-- Zoom and Layout controls -->
        <div class="zoom-controls">
          <a-button size="small" @click="handleZoom('in')" title="Zoom in">
            <PlusOutlined />
          </a-button>
          <span class="zoom-level">{{ zoomLevel }}%</span>
          <a-button size="small" @click="handleZoom('out')" title="Zoom out">
            <MinusOutlined />
          </a-button>
          <a-button size="small" @click="handleZoom('fit')" title="Fit to screen">
            <CompressOutlined />
          </a-button>
          <a-divider type="vertical" style="height: 20px; margin: 0 8px;" />
          <a-button size="small" @click="handleAutoLayout" title="Auto layout">
            <NodeIndexOutlined />
          </a-button>
        </div>

        <!-- Official hint bar (blue banner at bottom) -->
        <div v-if="showHint" class="official-hint-bar">
          <div class="hint-content">
            <InfoCircleOutlined class="hint-icon" />
            <span class="hint-text">Click a dataset node and select an action or <a class="hint-link" @click="handleAddData">add data</a> to transform your data.</span>
            <CloseOutlined class="hint-close" @click="showHint = false" />
          </div>
        </div>
      </div>

      <!-- Transform Config Modal -->
      <a-modal
        v-model:open="showTransformConfig"
        :title="null"
        :footer="null"
        :closable="false"
        :width="1200"
        :body-style="{ padding: 0, height: '80vh' }"
        class="transform-config-modal"
        @cancel="handleCloseTransformConfig"
      >
        <TransformPanel
          v-if="selectedTransformNode"
          :node="selectedTransformNode"
          :columns="getNodeColumns(selectedTransformNode)"
          :applied-transforms="getNodeTransforms(selectedTransformNode)"
          @close="handleCloseTransformConfig"
          @apply="handleApplyTransform"
          @cancel="handleCloseTransformConfig"
          @remove-transform="handleRemoveTransform"
        />
      </a-modal>

      <!-- Join Config Modal -->
      <a-modal
        v-model:open="showJoinConfig"
        :title="null"
        :footer="null"
        :closable="false"
        :width="1200"
        :body-style="{ padding: 0, height: '80vh' }"
        class="join-config-modal"
        @cancel="handleCloseJoinConfig"
      >
        <JoinPanel
          v-if="selectedJoinNode"
          :node="selectedJoinNode"
          @close="handleCloseJoinConfig"
          @apply="handleApplyJoin"
        />
      </a-modal>

      <!-- Right panel - Enhanced (for other content) -->
      <div
        class="right-panel"
        :style="{ width: rightPanelWidth + 'px' }"
        v-if="rightPanelVisible && !showTransformConfig && !showJoinConfig"
      >
        <div
          class="resize-handle resize-handle-left"
          @mousedown="(e) => startResize('right', e)"
        ></div>

        <div class="right-panel-content">
          <!-- Pipeline outputs section -->
          <div class="pipeline-outputs-section">
            <div class="panel-section">
              <div class="section-header">
                <div class="section-title">
                  <h3>Pipeline outputs</h3>
                  <a-button type="text" size="small" class="pin-btn">
                    <PushpinOutlined />
                  </a-button>
                </div>
              </div>

            <div class="section-content">
              <p class="section-desc">
                Pipeline outputs are the artifacts your pipeline builds. Pipeline Builder ensures all outputs are defined, healthy, and ready to deploy.
              </p>

              <div v-if="outputs.length === 0" class="outputs-empty">
                <div class="empty-icon">
                  <FileOutlined />
                </div>
                <p class="empty-text">No outputs configured</p>
                <a-button type="primary" block @click="handleAddOutput" class="add-output-btn">
                  <PlusOutlined /> Add pipeline output
                </a-button>
              </div>

              <div v-else class="outputs-list">
                <div
                  v-for="output in outputs"
                  :key="output.id"
                  class="output-item"
                >
                  <div class="output-icon">
                    <DatabaseOutlined />
                  </div>
                  <div class="output-info">
                    <div class="output-name">{{ output.name }}</div>
                    <div class="output-type">{{ output.type }}</div>
                  </div>
                  <a-button type="text" size="small" @click="removeOutput(output.id)">
                    <DeleteOutlined />
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend section -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="legendExpanded = !legendExpanded">
              <div class="section-title">
                <h3>Legend</h3>
                <DownOutlined :class="['expand-icon', { expanded: legendExpanded }]" />
              </div>
            </div>

            <div v-show="legendExpanded" class="section-content">
              <div class="legend-list">
                <div class="legend-item">
                  <div class="legend-color" style="background: #4285F4;"></div>
                  <span class="legend-label">Dataset node</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #34A853;"></div>
                  <span class="legend-label">Transform node</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #FBBC04;"></div>
                  <span class="legend-label">Join node</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #EA4335;"></div>
                  <span class="legend-label">Output node</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings section -->
          <div class="panel-section">
            <div class="section-header collapsible" @click="settingsExpanded = !settingsExpanded">
              <div class="section-title">
                <h3>Canvas settings</h3>
                <DownOutlined :class="['expand-icon', { expanded: settingsExpanded }]" />
              </div>
            </div>

            <div v-show="settingsExpanded" class="section-content">
              <div class="settings-list">
                <div class="setting-item">
                  <span class="setting-label">Show grid</span>
                  <a-switch v-model:checked="showGrid" size="small" />
                </div>
                <div class="setting-item">
                  <span class="setting-label">Snap to grid</span>
                  <a-switch v-model:checked="snapToGrid" size="small" />
                </div>
                <div class="setting-item">
                  <span class="setting-label">Auto layout</span>
                  <a-switch v-model:checked="autoLayout" size="small" />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom panel - Palantir Official Style -->
    <div
      v-if="bottomPanelVisible"
      class="bottom-panel"
      :style="{ height: bottomPanelHeight + 'px' }"
    >
      <div
        class="resize-handle resize-handle-top"
        @mousedown="(e) => startResize('bottom', e)"
      ></div>

      <!-- Main header with primary tabs -->
      <div class="panel-header">
        <div class="panel-header-left">
          <!-- Primary tabs (like official) -->
          <a-button
            :class="['primary-tab-btn', { active: bottomTab === 'selection-preview' }]"
            @click="bottomTab = 'selection-preview'"
            :disabled="!selectedNode"
          >
            <EyeOutlined /> Selection preview
          </a-button>
          <a-button
            :class="['primary-tab-btn-icon', { active: bottomTab === 'preview' }]"
            @click="bottomTab = 'preview'"
            title="Preview"
          >
            <TableOutlined />
          </a-button>
          <a-button
            :class="['primary-tab-btn-icon', { active: bottomTab === 'suggestions' }]"
            @click="bottomTab = 'suggestions'"
            title="Suggestions"
          >
            <BulbOutlined />
          </a-button>
        </div>

        <div class="panel-header-right">
          <a-button type="text" size="small" class="expand-btn">
            <span style="font-size: 12px;">Expand all</span>
          </a-button>
          <a-button type="text" size="small" @click="bottomPanelVisible = false" class="close-btn">
            <CloseOutlined />
          </a-button>
        </div>
      </div>

      <!-- Secondary tabs (Sub tabs) -->
      <div class="panel-sub-header" v-if="bottomTab === 'selection-preview'">
        <a-tabs v-model:activeKey="subTab" size="small" class="sub-tabs">
          <a-tab-pane key="about" tab="About" />
          <a-tab-pane key="columns" tab="Columns" />
          <a-tab-pane key="schedules" tab="Schedules" />
        </a-tabs>
      </div>

      <!-- Panel body content -->
      <div class="panel-body">
        <!-- Selection preview content -->
        <div v-show="bottomTab === 'selection-preview'" class="tab-content">
          <!-- About Tab -->
          <div v-show="subTab === 'about'" class="about-content">
            <div v-if="!selectedNode" class="empty-state">
              <p style="color: #98A2B3; text-align: center; padding: 40px 20px;">
                Select a node to view its details
              </p>
            </div>
            <div v-else>
              <div class="about-section">
                <label class="about-label">Description</label>
                <a-textarea
                  v-model:value="nodeDescription"
                  :rows="3"
                  placeholder="Add a description for this node..."
                  class="about-textarea"
                />
              </div>
              <div class="about-meta">
                <div class="meta-row">
                  <span class="meta-label">Node Name</span>
                  <span class="meta-value">{{ selectedNode.name }}</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Type</span>
                  <span class="meta-value">{{ getNodeTypeLabel(selectedNode.type) }}</span>
                </div>
                <div class="meta-row" v-if="selectedNode.type === 'dataset' && selectedNode.data?.rowCount">
                  <span class="meta-label">Row Count</span>
                  <span class="meta-value" style="font-weight: 600; color: #2D6EED;">{{ selectedNode.data.rowCount.toLocaleString() }} rows</span>
                </div>
                <div class="meta-row" v-if="selectedNode.type === 'dataset' && selectedNode.data?.columnCount">
                  <span class="meta-label">Columns</span>
                  <span class="meta-value" style="font-weight: 600; color: #2D6EED;">{{ selectedNode.data.columnCount }} columns</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Updated</span>
                  <span class="meta-value">a few seconds ago by Gena Coblenz</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Created</span>
                  <span class="meta-value">2 minutes ago by Gena Coblenz</span>
                </div>
                <div class="meta-row">
                  <span class="meta-label">Location</span>
                  <span class="meta-value">/Ontologize Public-34fdb/[Gena] Palantir...</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Columns Tab -->
          <div v-show="subTab === 'columns'" class="columns-content">
            <div v-if="!selectedNode || !selectedNodeColumns.length" class="empty-state">
              <p style="color: #98A2B3; text-align: center; padding: 40px 20px;">
                {{ !selectedNode ? 'Select a node to view columns' : 'No columns available for this node' }}
              </p>
            </div>
            <div v-else class="columns-container">
              <div class="columns-toolbar">
                <a-input-search
                  v-model:value="columnSearch"
                  placeholder="Search columns..."
                  style="width: 300px;"
                  size="small"
                />
                <span class="column-count">{{ filteredColumns.length }} columns</span>
              </div>
              <div class="columns-list">
                <div class="columns-table">
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 40px;"></th>
                        <th style="width: 200px;">Column Name</th>
                        <th style="width: 100px;">Type</th>
                        <th style="width: 80px;">Nullable</th>
                        <th style="min-width: 250px;">Sample Values</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(col, index) in filteredColumns"
                        :key="col.name"
                        class="column-row"
                      >
                        <td style="text-align: center; color: #98A2B3; font-size: 12px;">{{ index + 1 }}</td>
                        <td class="column-name-cell">
                          <component :is="getColumnIconComponent(col.type)" style="margin-right: 8px; color: #4285F4; font-size: 14px;" />
                          <span style="font-weight: 500; color: #101828;">{{ col.name }}</span>
                        </td>
                        <td>
                          <a-tag :color="getColumnTypeColor(col.type)" size="small">
                            {{ col.type }}
                          </a-tag>
                        </td>
                        <td style="text-align: center;">
                          <a-tag :color="col.nullable ? 'orange' : 'green'" size="small">
                            {{ col.nullable ? 'Yes' : 'No' }}
                          </a-tag>
                        </td>
                        <td style="color: #5F6368; font-size: 12px; font-family: 'Courier New', monospace;">
                          {{ getColumnSampleValues(col) }}
                        </td>
                        <td style="color: #667085; font-size: 12px; font-style: italic;">
                          {{ col.description || 'No description' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedules Tab -->
          <div v-show="subTab === 'schedules'" class="schedules-content">
            <a-empty description="No schedules configured">
              <p style="color: #5F6368; font-size: 13px;">
                Configure schedules to run this node automatically.
              </p>
            </a-empty>
          </div>
        </div>

        <!-- Preview Tab (full data preview) -->
        <div v-show="bottomTab === 'preview'" class="tab-content">
          <div class="preview-header">
            <div class="preview-title">
              <DatabaseOutlined style="margin-right: 8px;" />
              <span>{{ selectedNode?.name || 'Data Preview' }}</span>
              <span class="preview-stats">Showing 50 rows · 5 columns</span>
            </div>
            <a-input-search
              placeholder="Search columns..."
              style="width: 250px;"
              size="small"
            />
          </div>
          <DataPreviewPanel
            v-if="selectedNode"
            :node="selectedNode"
            mode="preview"
          />
        </div>

        <!-- Suggestions Tab -->
        <div v-show="bottomTab === 'suggestions'" class="tab-content">
          <div class="suggestions-content">
            <a-empty description="No suggestions available">
              <p class="suggestion-hint">
                Suggestions will appear here as you build your pipeline.
              </p>
            </a-empty>
          </div>
        </div>
      </div>
    </div>

    <!-- Context menu -->
    <ContextMenu
      :visible="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :items="contextMenuItems"
      @select="handleContextMenuSelect"
      @close="contextMenuVisible = false"
    />

    <!-- Data Clean Actions Popup Menu (Palantir Style) -->
    <div
      v-if="cleanMenuVisible"
      class="clean-actions-popup"
      :style="{
        left: cleanMenuX + 'px',
        top: cleanMenuY + 'px'
      }"
      @click.stop
    >
      <div class="clean-menu-item" @click="handleCleanAction('transform')">
        <div class="clean-menu-icon" style="background: #EFF8FF;">
          <FilterOutlined style="color: #1570EF; font-size: 18px;" />
        </div>
        <span class="clean-menu-label" style="color: #1570EF;">Transform</span>
      </div>
      <div class="clean-menu-item" @click="handleCleanAction('join')">
        <div class="clean-menu-icon" style="background: #F4F3FF;">
          <MergeCellsOutlined style="color: #7F56D9; font-size: 18px;" />
        </div>
        <span class="clean-menu-label" style="color: #7F56D9;">Join</span>
      </div>
      <div class="clean-menu-item" @click="handleCleanAction('union')">
        <div class="clean-menu-icon" style="background: #FEF3F2;">
          <PlusOutlined style="color: #F04438; font-size: 18px;" />
        </div>
        <span class="clean-menu-label" style="color: #F04438;">Union</span>
      </div>
    </div>

    <!-- Rename Node Modal -->
    <a-modal
      v-model:open="renameModalVisible"
      title="Rename Node"
      :width="480"
      @ok="handleRenameConfirm"
      @cancel="handleRenameCancel"
      :okButtonProps="{ disabled: !isRenameValid }"
    >
      <div class="rename-modal-content">
        <div class="rename-form-item">
          <label class="rename-label">Node Name</label>
          <a-input
            ref="renameInputRef"
            v-model:value="renameNodeName"
            placeholder="Enter node name"
            :maxlength="100"
            @pressEnter="handleRenameConfirm"
            @keydown.esc="handleRenameCancel"
          />
          <div class="rename-hint" v-if="renameNodeName.trim().length > 0">
            {{ renameNodeName.trim().length }} / 100 characters
          </div>
          <div class="rename-error" v-if="renameNodeName.trim().length === 0">
            Node name cannot be empty
          </div>
        </div>
        <div class="rename-info">
          <InfoCircleOutlined style="margin-right: 8px; color: #1570EF;" />
          <span style="font-size: 13px; color: #667085;">
            This name will be displayed on the canvas and in the pipeline editor.
          </span>
        </div>
      </div>
    </a-modal>

    <!-- Data Import Dialog -->
    <DataImportDialog
      v-model:open="showImportDialog"
      @import="handleDataImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  NodeIndexOutlined,
  BulbOutlined,
  HistoryOutlined,
  SaveOutlined,
  RocketOutlined,
  MoreOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  CompressOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  TableOutlined,
  ExportOutlined,
  EyeOutlined,
  FunctionOutlined,
  RightOutlined,
  LeftOutlined,
  DragOutlined,
  SelectOutlined,
  DownloadOutlined,
  DownOutlined,
  FilterOutlined,
  MergeCellsOutlined,
  UndoOutlined,
  RedoOutlined,
  PushpinOutlined,
  FileOutlined,
  FontSizeOutlined,
  NumberOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined
} from '@ant-design/icons-vue'

import { usePipelineStore } from '@/stores/modules/pipeline'
import { getAllDatasets, getDatasetMeta, getDatasetData } from '@/mock/datasets'
import type { Node, Edge } from '@/stores/modules/pipeline'
import { graphToPipeline } from '@/utils/pipelineTransform'

import GraphCanvas from '@/components/pipeline/GraphCanvas.vue'
import ToolButton from '@/components/common/ToolButton.vue'
import ContextMenu from '@/components/common/ContextMenu.vue'
import DataPreviewPanel from '@/components/pipeline/DataPreviewPanel.vue'
import TransformPanel from '@/components/pipeline/TransformPanel.vue'
import TransformConfigPanel from '@/components/pipeline/TransformConfigPanel.vue'
import JoinPanel from '@/components/pipeline/JoinPanel.vue'
import NodePalette from '@/components/pipeline/NodePalette.vue'
import DataImportDialog from '@/components/pipeline/DataImportDialog.vue'
import { useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const pipelineStore = usePipelineStore()

// Basic state
const pipelineName = ref('My Pipeline')
const currentTab = ref('graph')
const currentTool = ref('select')

const canvasRef = ref()
const zoomLevel = ref(100)
const showHint = ref(true)

// Bottom panel state
const subTab = ref('about')
const nodeDescription = ref('')
const columnSearch = ref('')

// Nodes and edges
const nodes = computed(() => pipelineStore.nodes)
const edges = computed(() => pipelineStore.edges)
const selectedNode = computed(() => {
  const selectedIds = pipelineStore.selectedNodes
  if (selectedIds.length === 1) {
    return pipelineStore.nodes.find(n => n.id === selectedIds[0])
  }
  return null
})

// Selected node columns
const selectedNodeColumns = computed(() => {
  if (!selectedNode.value) return []

  if (selectedNode.value.type === 'dataset') {
    const datasetId = selectedNode.value.data?.datasetId
    const meta = getDatasetMeta(datasetId)
    return meta?.columns || []
  }

  return []
})

// Filtered columns based on search
const filteredColumns = computed(() => {
  if (!columnSearch.value) return selectedNodeColumns.value

  const searchLower = columnSearch.value.toLowerCase()
  return selectedNodeColumns.value.filter(col =>
    col.name.toLowerCase().includes(searchLower) ||
    col.type.toLowerCase().includes(searchLower)
  )
})

// Check if any nodes are selected
const hasSelection = computed(() => {
  return pipelineStore.selectedNodes.length > 0
})

// Available datasets for the Add Data menu
const availableDatasets = computed(() => {
  return getAllDatasets()
})

// Outputs list
const outputs = ref<any[]>([])

// Right panel
const rightPanelWidth = ref(900)
const rightPanelVisible = ref(true) // Always visible
const legendExpanded = ref(false)
const settingsExpanded = ref(false)
const showGrid = ref(false)

// Transform config panel
const showTransformConfig = ref(false)
const selectedTransformNode = ref<Node | null>(null)

// Join config panel
const showJoinConfig = ref(false)
const selectedJoinNode = ref<Node | null>(null)

// Debug: Watch transform config state
watch(showTransformConfig, (newVal) => {
  console.log('showTransformConfig changed:', newVal)
})

watch(selectedTransformNode, (newVal) => {
  console.log('selectedTransformNode changed:', newVal?.name)
})

// Debug: Watch join config state
watch(showJoinConfig, (newVal) => {
  console.log('showJoinConfig changed:', newVal)
})

watch(selectedJoinNode, (newVal) => {
  console.log('selectedJoinNode changed:', newVal?.name)
})
const snapToGrid = ref(true)
const autoLayout = ref(false)

// Bottom panel
const bottomPanelVisible = ref(true)
const bottomPanelHeight = ref(350)
const bottomTab = ref('selection-preview')

// Context menu
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuItems = ref<any[]>([])
const contextMenuTarget = ref<any>(null)

// Rename modal
const renameModalVisible = ref(false)
const renameNodeName = ref('')
const renameTargetNode = ref<Node | null>(null)
const renameInputRef = ref<any>(null)

// Validate rename input
const isRenameValid = computed(() => {
  return renameNodeName.value.trim().length > 0
})

// Data clean actions menu
const cleanMenuVisible = ref(false)
const cleanMenuX = ref(0)
const cleanMenuY = ref(0)
const cleanMenuTargetNode = ref<Node | null>(null)

// Node drag state
const draggingNodeType = ref<string | null>(null)
const draggingNodeData = ref<any>(null)

// Undo/Redo
const canUndo = ref(false)
const canRedo = ref(false)

// Import dialog
const showImportDialog = ref(false)

// Node ID counter
let nodeIdCounter = 1

// ==================== Event Handlers ====================

// Add dataset node
function handleAddData({ key }: { key: string }) {
  // Handle import data dialog
  if (key === 'import-data') {
    showImportDialog.value = true
    return
  }

  const dataset = getAllDatasets().find(d => d.id === key)
  if (!dataset) return

  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'dataset',
    name: dataset.displayName,
    x: 100 + Math.random() * 100,
    y: 100 + Math.random() * 100,
    data: {
      datasetId: dataset.id,
      columnCount: dataset.columns.length,
      rowCount: dataset.rowCount
    }
  }

  pipelineStore.addNode(node)
  message.success(`Added dataset: ${dataset.displayName} (${dataset.rowCount} rows, ${dataset.columns.length} columns)`)
}

// Handle imported data
function handleDataImport({ data, columns, name }: { data: any[], columns: any[], name: string }) {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'dataset',
    name: name.replace(/\.(csv|json)$/i, ''),
    x: 100 + Math.random() * 100,
    y: 100 + Math.random() * 100,
    data: {
      datasetId: `imported-${Date.now()}`,
      columnCount: columns.length,
      rowCount: data.length,
      columns,
      importedData: data
    }
  }

  pipelineStore.addNode(node)
  message.success(`Imported ${data.length} rows with ${columns.length} columns`)
}

// Add transform node
function handleAddTransformNode() {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'transform',
    name: 'Transform',
    x: 200 + Math.random() * 100,
    y: 200 + Math.random() * 100,
    data: {
      transformCount: 0,
      transformConfig: null
    }
  }

  pipelineStore.addNode(node)
  message.success('Added Transform node - Double click to configure')

  // Auto-open config panel after adding
  setTimeout(() => {
    selectedTransformNode.value = node
    showTransformConfig.value = true
    rightPanelVisible.value = true
  }, 100)
}

// Add join node
function handleAddJoin() {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'join',
    name: 'Join',
    x: 200 + Math.random() * 100,
    y: 200 + Math.random() * 100,
    data: {
      joinConfig: {
        type: 'Inner',
        leftKey: '',
        rightKey: ''
      }
    }
  }

  pipelineStore.addNode(node)
  message.success('Added Join node')
}

// Add output node to canvas
function handleAddOutputNode() {
  const node: Node = {
    id: `node-${nodeIdCounter++}`,
    type: 'output',
    name: 'Output',
    x: 300 + Math.random() * 100,
    y: 300 + Math.random() * 100,
    data: {
      outputName: 'result_dataset'
    }
  }

  pipelineStore.addNode(node)
  message.success('Added Output node')
}

// Show transform panel
function showTransformPanel() {
  if (!selectedNode.value) {
    message.warning('Please select a node first')
    return
  }

  bottomPanelVisible.value = true
  bottomTab.value = 'transformations'
}

// Node click
function handleNodeClick(node: Node) {
  pipelineStore.setSelectedNodes([node.id])
  bottomPanelVisible.value = true
  bottomTab.value = 'selection-preview'
  // 默认显示About标签页
  subTab.value = 'about'

  // If it's a dataset node, show clean actions menu
  if (node.type === 'dataset') {
    showCleanActionsMenu(node)
  } else {
    cleanMenuVisible.value = false
  }
}

// Show clean actions menu next to dataset node
function showCleanActionsMenu(node: Node) {
  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  const cell = graph.getCellById(node.id)
  if (!cell) return

  // Get node position and size
  const bbox = cell.getBBox()
  const zoom = graph.zoom()

  // Calculate menu position (to the right of node)
  const canvasContainer = graph.container
  const containerRect = canvasContainer.getBoundingClientRect()

  // Position menu to the right of the node
  cleanMenuX.value = containerRect.left + (bbox.x + bbox.width + 20) * zoom
  cleanMenuY.value = containerRect.top + (bbox.y + bbox.height / 2 - 60) * zoom

  cleanMenuTargetNode.value = node
  cleanMenuVisible.value = true
}

// Node double click
function handleNodeDoubleClick(node: Node) {
  console.log('=== Node Double Click ===')
  console.log('Node:', node)
  console.log('Node Type:', node.type)

  pipelineStore.setSelectedNodes([node.id])

  // If it's a transform node, show transform config panel
  if (node.type === 'transform') {
    console.log('Opening Transform Config Panel')
    selectedTransformNode.value = node
    showTransformConfig.value = true
    showJoinConfig.value = false // Close join config if open
    rightPanelVisible.value = true

    // Get columns for debugging
    const columns = getNodeColumns(node)
    console.log('Detected columns:', columns)

    message.info('Transform config panel opened')
  } else if (node.type === 'join') {
    // If it's a join node, show join config panel
    console.log('Opening Join Config Panel')
    selectedJoinNode.value = node
    showJoinConfig.value = true
    showTransformConfig.value = false // Close transform config if open
    rightPanelVisible.value = true

    message.info('Join config panel opened')
  } else if (node.type === 'dataset') {
    // For dataset nodes, show data preview
    bottomPanelVisible.value = true
    bottomTab.value = 'selection-preview'
    message.info('Dataset selected - view in bottom panel')
  } else {
    bottomPanelVisible.value = true
    bottomTab.value = 'transformations'
  }
}

// Node context menu
function handleNodeContextMenu({ node, event }: { node: Node; event: MouseEvent }) {
  // 阻止默认右键菜单
  event.preventDefault()

  contextMenuTarget.value = node
  // 使用鼠标的屏幕坐标
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY

  contextMenuItems.value = [
    {
      key: 'open',
      label: 'Open',
      icon: 'folder-open'
    },
    {
      key: 'actions',
      label: 'Actions',
      icon: 'thunderbolt',
      children: [
        { key: 'action-1', label: 'Action 1' },
        { key: 'action-2', label: 'Action 2' }
      ]
    },
    {
      key: 'rename',
      label: 'Rename',
      icon: 'edit'
    },
    {
      key: 'copy-rid',
      label: 'Copy RID',
      icon: 'copy'
    },
    {
      type: 'divider'
    },
    {
      key: 'copy',
      label: 'Copy',
      icon: 'copy'
    },
    {
      key: 'paste',
      label: 'Paste',
      icon: 'snippets'
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: 'copy'
    },
    {
      type: 'divider'
    },
    {
      key: 'preview',
      label: 'Preview data',
      icon: 'eye'
    },
    {
      key: 'transform',
      label: 'Add transformation',
      icon: 'function'
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Remove node',
      icon: 'minus-circle',
      danger: true
    }
  ]
  contextMenuVisible.value = true
}

// Edge added
function handleEdgeAdded(edge: Edge) {
  pipelineStore.addEdge(edge)
  message.success('Nodes connected')
}

// Edge context menu
function handleEdgeContextMenu({ edge, event }: { edge: Edge; event: MouseEvent }) {
  // 阻止默认右键菜单
  event.preventDefault()

  contextMenuTarget.value = edge
  // 使用鼠标的屏幕坐标
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY

  contextMenuItems.value = [
    {
      key: 'delete',
      label: 'Delete connection',
      icon: 'delete',
      danger: true
    }
  ]
  contextMenuVisible.value = true
}

// Canvas click
function handleCanvasClick() {
  pipelineStore.setSelectedNodes([])
  contextMenuVisible.value = false
  cleanMenuVisible.value = false
}

// Handle clean action selection from popup menu
function handleCleanAction(action: 'transform' | 'join' | 'union') {
  const sourceNode = cleanMenuTargetNode.value
  if (!sourceNode) return

  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  let newNode: Node | null = null

  // Create node based on action type
  switch (action) {
    case 'transform':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'transform',
        name: `${sourceNode.name} - clean`,
        x: sourceNode.x + 300,
        y: sourceNode.y,
        data: {
          transformCount: 0,
          transformConfig: null
        }
      }
      break

    case 'join':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'join',
        name: 'Join',
        x: sourceNode.x + 300,
        y: sourceNode.y,
        data: {
          joinConfig: {
            type: 'Inner',
            leftKey: '',
            rightKey: ''
          }
        }
      }
      break

    case 'union':
      // Union is similar to join but with union operation
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'join',
        name: 'Union',
        x: sourceNode.x + 300,
        y: sourceNode.y,
        data: {
          joinConfig: {
            type: 'Union',
            leftKey: '',
            rightKey: ''
          }
        }
      }
      break
  }

  if (newNode) {
    // Add node to store
    pipelineStore.addNode(newNode)

    // Create edge connecting source node to new node
    const edge: Edge = {
      id: `edge-${Date.now()}`,
      source: sourceNode.id,
      target: newNode.id
    }
    pipelineStore.addEdge(edge)

    message.success(`${action === 'transform' ? 'Transform' : action === 'join' ? 'Join' : 'Union'} node added and connected`)

    // If it's a transform node, auto-open config panel
    if (action === 'transform') {
      setTimeout(() => {
        selectedTransformNode.value = newNode
        showTransformConfig.value = true
        rightPanelVisible.value = true
      }, 100)
    }
  }

  // Hide clean menu
  cleanMenuVisible.value = false
  cleanMenuTargetNode.value = null
}

// Nodes copied
function handleNodesCopied(count: number) {
  message.success(`Copied ${count} node${count > 1 ? 's' : ''}`)
}

// Nodes pasted
function handleNodesPasted(count: number) {
  message.success(`Pasted ${count} node${count > 1 ? 's' : ''}`)
}

// Context menu select
function handleContextMenuSelect(key: string) {
  const target = contextMenuTarget.value

  if (!target) return

  switch (key) {
    case 'open':
      message.info(`Opening ${target.name || 'node'}...`)
      break
    case 'rename':
      renameNode(target)
      break
    case 'copy-rid':
      navigator.clipboard.writeText(target.id)
      message.success('RID copied to clipboard')
      break
    case 'copy':
      // 复制节点到剪贴板（已实现快捷键）
      message.info('Copy functionality')
      break
    case 'paste':
      message.info('Paste functionality')
      break
    case 'duplicate':
      duplicateNode(target)
      break
    case 'preview':
      handleNodeClick(target)
      break
    case 'transform':
      handleNodeDoubleClick(target)
      break
    case 'delete':
      if (target.source) {
        // Edge
        pipelineStore.removeEdge(target.id)
        message.success('Connection deleted')
      } else {
        // Node
        pipelineStore.removeNode(target.id)
        message.success('Node deleted')
      }
      break
    default:
      // 处理子菜单项
      message.info(`Menu action: ${key}`)
  }

  contextMenuVisible.value = false
}

// Duplicate node
function duplicateNode(node: Node) {
  const newNode: Node = {
    ...node,
    id: `node-${nodeIdCounter++}`,
    name: `${node.name} (copy)`,
    x: node.x + 50,
    y: node.y + 50
  }
  pipelineStore.addNode(newNode)
  message.success('Node duplicated')
}

// Rename node - Open modal
function renameNode(node: Node) {
  renameTargetNode.value = node
  renameNodeName.value = node.name
  renameModalVisible.value = true

  // Focus input after modal opens
  setTimeout(() => {
    if (renameInputRef.value) {
      renameInputRef.value.focus()
      // Select all text for easy editing
      renameInputRef.value.select()
    }
  }, 100)
}

// Handle rename confirm
function handleRenameConfirm() {
  if (!isRenameValid.value || !renameTargetNode.value) {
    return
  }

  const newName = renameNodeName.value.trim()
  const oldName = renameTargetNode.value.name

  if (newName !== oldName) {
    pipelineStore.updateNode(renameTargetNode.value.id, { name: newName })
    message.success(`Node renamed from "${oldName}" to "${newName}"`)
  }

  // Close modal
  renameModalVisible.value = false
  renameTargetNode.value = null
  renameNodeName.value = ''
}

// Handle rename cancel
function handleRenameCancel() {
  renameModalVisible.value = false
  renameTargetNode.value = null
  renameNodeName.value = ''
}

// Get node type label
function getNodeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'dataset': 'Raw dataset',
    'transform': 'Transform node',
    'join': 'Join node',
    'filter': 'Filter node',
    'aggregate': 'Aggregate node',
    'output': 'Output node'
  }
  return labels[type] || 'Unknown type'
}

// Get column icon component based on type
function getColumnIconComponent(type: string) {
  const iconMap: Record<string, any> = {
    'String': FontSizeOutlined,
    'Number': NumberOutlined,
    'Integer': NumberOutlined,
    'Boolean': CheckCircleOutlined,
    'Date': CalendarOutlined,
    'DateTime': CalendarOutlined
  }
  return iconMap[type] || DatabaseOutlined
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

// Get column sample values from actual dataset
function getColumnSampleValues(col: any): string {
  if (!selectedNode.value || selectedNode.value.type !== 'dataset') {
    return 'N/A'
  }

  const datasetId = selectedNode.value.data?.datasetId
  if (!datasetId) return 'N/A'

  const data = getDatasetData(datasetId)
  if (!data || data.length === 0) return 'N/A'

  // Get first 3 sample values from actual data
  const samples = data.slice(0, 3).map((row: any) => {
    const value = row[col.name]
    if (value === null || value === undefined) return 'null'

    // Format based on type
    if (col.type === 'Number') {
      return typeof value === 'number' ? value.toFixed(2) : value
    } else if (col.type === 'Date') {
      return value
    }
    return String(value)
  })

  return samples.join(', ') + (data.length > 3 ? '...' : '')
}

// Apply transform
async function handleApplyTransform(transform: any) {
  const targetNode = selectedTransformNode.value || selectedNode.value
  if (!targetNode) return

  try {
    // Get existing transforms array or initialize empty array
    const existingTransforms = targetNode.data?.transforms || []

    // Add new transform to array
    const updatedTransforms = [...existingTransforms, transform]

    // Update node data with transforms array
    pipelineStore.updateNode(targetNode.id, {
      data: {
        ...targetNode.data,
        transforms: updatedTransforms,
        transformCount: updatedTransforms.length
      }
    })

    message.success(`Transform "${transform.name || transform.type}" applied`)

    // Keep transform config panel open to allow adding more transforms
    // User can close it manually when done
    // showTransformConfig.value = false
    // selectedTransformNode.value = null

    bottomTab.value = 'preview'
  } catch (error: any) {
    message.error(`Failed to apply transform: ${error.message}`)
  }
}

// Close transform config panel
function handleCloseTransformConfig() {
  showTransformConfig.value = false
  selectedTransformNode.value = null
}

// Join configuration handlers
async function handleApplyJoin(joinConfig: any) {
  const targetNode = selectedJoinNode.value
  if (!targetNode) return

  try {
    // Update node data with join configuration
    pipelineStore.updateNode(targetNode.id, {
      data: {
        ...targetNode.data,
        joinConfig: joinConfig
      }
    })

    message.success('Join configuration applied')

    // Close the join config panel
    showJoinConfig.value = false
    selectedJoinNode.value = null
  } catch (error) {
    console.error('Error applying join config:', error)
    message.error('Failed to apply join configuration')
  }
}

function handleCloseJoinConfig() {
  showJoinConfig.value = false
  selectedJoinNode.value = null
}

// Get node columns
function getNodeColumns(node: Node) {
  if (!node) return []

  if (node.type === 'dataset') {
    const datasetId = node.data?.datasetId
    const meta = getDatasetMeta(datasetId)
    return meta?.columns || []
  }

  // For transform nodes, get columns from input node
  const edges = pipelineStore.edges
  const inputEdge = edges.find(e => e.target === node.id)
  if (inputEdge) {
    const inputNode = pipelineStore.nodes.find(n => n.id === inputEdge.source)
    if (inputNode) {
      return getNodeColumns(inputNode)
    }
  }

  return []
}

// Get node transforms array
function getNodeTransforms(node: Node) {
  if (!node) return []
  return node.data?.transforms || []
}

// Remove transform by index
function handleRemoveTransform(index: number) {
  const targetNode = selectedTransformNode.value
  if (!targetNode) return

  try {
    const existingTransforms = targetNode.data?.transforms || []

    // Remove transform at index
    const updatedTransforms = existingTransforms.filter((_, i) => i !== index)

    // Update node data
    pipelineStore.updateNode(targetNode.id, {
      data: {
        ...targetNode.data,
        transforms: updatedTransforms,
        transformCount: updatedTransforms.length
      }
    })

    message.success('Transform removed')
  } catch (error: any) {
    message.error(`Failed to remove transform: ${error.message}`)
  }
}

// Cancel transform
function handleCancelTransform() {
  bottomTab.value = 'preview'
}

// Bottom tab change
function handleBottomTabChange(key: string) {
  if (!selectedNode.value && ['preview', 'transformations'].includes(key)) {
    message.warning('Please select a node first')
    bottomTab.value = 'input'
  }
}

// Zoom
function handleZoom(type: 'in' | 'out' | 'fit') {
  if (!canvasRef.value) return

  switch (type) {
    case 'in':
      canvasRef.value.zoom(0.1)
      zoomLevel.value = Math.min(200, zoomLevel.value + 10)
      break
    case 'out':
      canvasRef.value.zoom(-0.1)
      zoomLevel.value = Math.max(10, zoomLevel.value - 10)
      break
    case 'fit':
      canvasRef.value.centerContent()
      zoomLevel.value = 100
      break
  }
}

// Auto layout
function handleAutoLayout() {
  if (!canvasRef.value) return

  if (nodes.value.length === 0) {
    message.warning('No nodes to layout')
    return
  }

  try {
    canvasRef.value.autoLayout()
    message.success('Layout applied successfully')
  } catch (error) {
    console.error('Auto layout error:', error)
    message.error('Failed to apply auto layout')
  }
}

// Select all nodes
function handleSelectAll() {
  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  const allNodes = graph.getNodes()
  if (allNodes.length === 0) {
    message.info('No nodes to select')
    return
  }

  graph.select(allNodes)
  message.success(`Selected ${allNodes.length} node(s)`)
}

// Clear selection
function handleClearSelection() {
  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  if (!hasSelection.value) {
    message.info('No nodes selected')
    return
  }

  graph.cleanSelection()
  pipelineStore.setSelectedNodes([])
  message.success('Selection cleared')
}

// Delete selected nodes
function handleDeleteSelected() {
  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  const selectedIds = pipelineStore.selectedNodes
  if (selectedIds.length === 0) {
    message.warning('No nodes selected')
    return
  }

  // Confirm deletion
  const nodeNames = selectedIds.map(id => {
    const node = nodes.value.find(n => n.id === id)
    return node?.name || id
  }).join(', ')

  // Delete nodes
  selectedIds.forEach(id => {
    const cell = graph.getCellById(id)
    if (cell) {
      cell.remove()
    }
    pipelineStore.removeNode(id)
  })

  pipelineStore.setSelectedNodes([])
  message.success(`Deleted ${selectedIds.length} node(s): ${nodeNames}`)
}

// Save
async function handleSave() {
  // Validation
  if (nodes.value.length === 0) {
    message.warning('Cannot save empty pipeline. Please add at least one node.')
    return
  }

  const saveKey = 'saving'
  message.loading({ content: 'Saving pipeline...', key: saveKey })

  try {
    // Get current graph data from GraphCanvas
    const graph = canvasRef.value?.getGraph()

    if (!graph) {
      message.error({ content: 'Unable to get graph data', key: saveKey })
      return
    }

    // Convert X6 Graph to Pipeline JSON format
    const pipelineData = graphToPipeline(graph, {
      name: pipelineName.value,
      description: nodeDescription.value || 'Pipeline created in Pipeline Builder',
      version: '1.0.0',
      metadata: {
        category: 'data-processing',
        tags: [],
        owner: 'Gena Coblenz',
        visibility: 'private',
        status: 'draft',
        lastSaved: new Date().toISOString()
      },
      configuration: {
        execution: {
          mode: 'auto'
        }
      }
    })

    // Output complete Pipeline data structure to console
    console.log('====================================')
    console.log('Pipeline Save - Complete Data Structure')
    console.log('====================================')
    console.log('Pipeline Data:', pipelineData)
    console.log('------------------------------------')
    console.log('Nodes Count:', pipelineData.graph.nodes.length)
    console.log('Edges Count:', pipelineData.graph.edges.length)
    console.log('------------------------------------')
    console.log('Nodes Detail:')
    pipelineData.graph.nodes.forEach((node, index) => {
      console.log(`  [${index + 1}] ${node.label} (${node.type})`, node)
    })
    console.log('------------------------------------')
    console.log('Edges Detail:')
    pipelineData.graph.edges.forEach((edge, index) => {
      console.log(`  [${index + 1}] ${edge.source.nodeId} -> ${edge.target.nodeId}`, edge)
    })
    console.log('====================================')
    console.log('JSON Format:')
    console.log(JSON.stringify(pipelineData, null, 2))
    console.log('====================================')

    // Save to store
    await pipelineStore.savePipeline()

    message.success({
      content: `Pipeline saved successfully! (${nodes.value.length} nodes, ${edges.value.length} connections)`,
      key: saveKey,
      duration: 3
    })
  } catch (error) {
    console.error('Error saving pipeline:', error)
    message.error({ content: 'Failed to save pipeline', key: saveKey })
  }
}

// Back to list
function handleBack() {
  router.push('/pipelines')
}

// Propose
function handlePropose() {
  if (nodes.value.length === 0) {
    message.warning('Cannot propose empty pipeline. Please add at least one node.')
    return
  }

  message.success({
    content: 'Pipeline proposal submitted for review',
    duration: 3
  })

  console.log('Pipeline proposed for review', {
    nodes: nodes.value.length,
    edges: edges.value.length,
    timestamp: new Date().toISOString()
  })
}

// Deploy
async function handleDeploy() {
  // Validation
  if (nodes.value.length === 0) {
    message.warning('Cannot deploy empty pipeline. Please add at least one node.')
    return
  }

  // Check if there's at least one output node
  const hasOutput = nodes.value.some(node => node.type === 'output')
  if (!hasOutput) {
    message.warning('Pipeline must have at least one output node before deployment.')
    return
  }

  const deployKey = 'deploying'
  message.loading({ content: 'Deploying pipeline...', key: deployKey, duration: 0 })

  try {
    // Simulate deployment process
    await new Promise(resolve => setTimeout(resolve, 2000))

    message.success({
      content: `Pipeline deployed successfully! Ready for execution.`,
      key: deployKey,
      duration: 3
    })

    console.log('====================================')
    console.log('Pipeline Deployed')
    console.log('====================================')
    console.log('Deployment Info:', {
      pipelineName: pipelineName.value,
      nodesCount: nodes.value.length,
      edgesCount: edges.value.length,
      deploymentTime: new Date().toISOString(),
      status: 'active'
    })
    console.log('====================================')
  } catch (error) {
    console.error('Deployment error:', error)
    message.error({ content: 'Failed to deploy pipeline', key: deployKey })
  }
}

// More actions
function handleMoreAction({ key }: { key: string }) {
  message.info(`Action: ${key}`)
}

// Undo
function handleUndo() {
  message.info('Undo')
}

// Redo
function handleRedo() {
  message.info('Redo')
}

// Run pipeline
async function handleRunPipeline() {
  message.loading({ content: 'Running pipeline...', key: 'run' })

  try {
    const result = await pipelineStore.executePipeline()

    if (result.success) {
      message.success({ content: result.message, key: 'run' })

      // Log execution results
      console.log('====================================')
      console.log('Pipeline Execution Results')
      console.log('====================================')
      if (result.results) {
        result.results.forEach((data, nodeId) => {
          const node = pipelineStore.getNodeById(nodeId)
          console.log(`Node: ${node?.name || nodeId}`)
          console.log(`Rows: ${data.length}`)
          console.log('Sample data:', data.slice(0, 3))
          console.log('------------------------------------')
        })
      }
      console.log('====================================')
    } else {
      message.error({ content: result.message, key: 'run' })
      console.error('Pipeline execution failed:', result.message)
    }
  } catch (error: any) {
    message.error({ content: 'Pipeline execution failed', key: 'run' })
    console.error('Pipeline execution error:', error)
  }
}

// Add output
function handleAddOutput() {
  const output = {
    id: `output-${Date.now()}`,
    name: 'New Output',
    type: 'Dataset'
  }
  outputs.value.push(output)
}

// Remove output
function removeOutput(id: string) {
  outputs.value = outputs.value.filter(o => o.id !== id)
}

// ==================== Panel Resize ====================

let resizing = false
let resizeType: 'right' | 'bottom' = 'right'
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

function startResize(type: 'right' | 'bottom', e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  resizing = true
  resizeType = type

  if (type === 'right') {
    startX = e.clientX
    startWidth = rightPanelWidth.value
  } else {
    startY = e.clientY
    startHeight = bottomPanelHeight.value
  }

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

function handleResize(e: MouseEvent) {
  if (!resizing) return

  if (resizeType === 'right') {
    const deltaX = startX - e.clientX
    rightPanelWidth.value = Math.max(200, Math.min(600, startWidth + deltaX))
  } else {
    const deltaY = startY - e.clientY
    bottomPanelHeight.value = Math.max(200, Math.min(800, startHeight + deltaY))
  }
}

function stopResize() {
  resizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// ==================== Node Drag from Palette ====================

// Handle node drag from palette
function handleNodeDragStart(node: any) {
  draggingNodeType.value = node.type
  draggingNodeData.value = node
}

function handleNodeDragEnd() {
  draggingNodeType.value = null
  draggingNodeData.value = null
}

function handleCanvasDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function handleCanvasDrop(event: DragEvent) {
  event.preventDefault()

  const nodeType = event.dataTransfer?.getData('application/x-node-type')
  const nodeDataStr = event.dataTransfer?.getData('application/x-node-data')

  if (!nodeType || !nodeDataStr) return

  const nodeData = JSON.parse(nodeDataStr)
  const graph = canvasRef.value?.getGraph()
  if (!graph) return

  // Get canvas container position
  const canvasContainer = event.currentTarget as HTMLElement
  const rect = canvasContainer.getBoundingClientRect()

  // Calculate position relative to canvas
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Convert to graph coordinates
  const graphPoint = graph.localToGraph(x, y)

  // Create node based on type
  let newNode: Node | null = null

  switch (nodeType) {
    case 'dataset':
      // For dataset nodes, add default dataset at drop position
      handleAddDataAtPosition(graphPoint.x, graphPoint.y)
      break

    case 'transform':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'transform',
        name: 'Transform',
        x: graphPoint.x,
        y: graphPoint.y,
        data: {
          transformCount: 0,
          transformConfig: null
        }
      }
      break

    case 'join':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'join',
        name: 'Join',
        x: graphPoint.x,
        y: graphPoint.y,
        data: {
          joinConfig: {
            type: 'Inner',
            leftKey: '',
            rightKey: ''
          }
        }
      }
      break

    case 'output':
      newNode = {
        id: `node-${nodeIdCounter++}`,
        type: 'output',
        name: 'Output',
        x: graphPoint.x,
        y: graphPoint.y,
        data: {
          outputName: 'result_dataset'
        }
      }
      break
  }

  if (newNode) {
    pipelineStore.addNode(newNode)
    message.success(`${nodeData.name} node added`)
  }

  handleNodeDragEnd()
}

function handleAddDataAtPosition(x: number, y: number) {
  // For dataset nodes, add Products dataset by default
  const datasets = getAllDatasets()
  if (datasets.length > 0) {
    const dataset = datasets[0] // Default to first dataset

    const node: Node = {
      id: `node-${nodeIdCounter++}`,
      type: 'dataset',
      name: dataset.displayName,
      x,
      y,
      data: {
        datasetId: dataset.id,
        columnCount: dataset.columns.length,
        rowCount: dataset.rowCount
      }
    }

    pipelineStore.addNode(node)
    message.success(`Added dataset: ${dataset.displayName}`)
  }
}

// ==================== Lifecycle ====================

onMounted(async () => {
  const pipelineId = route.params.id as string

  if (pipelineId) {
    // Try to load existing pipeline
    const loaded = await pipelineStore.loadPipeline(pipelineId)
    if (loaded) {
      message.success('Pipeline loaded')
      return
    }
  }

  // Initialize a new pipeline if not loaded
  if (!pipelineStore.currentPipeline) {
    pipelineStore.setPipeline({
      id: pipelineId || `pipeline_${Date.now()}`,
      name: pipelineName.value,
      description: 'A new data pipeline',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="less">
.pipeline-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F6F7;
  overflow: hidden;
}

// ==================== Top Navigation ====================
.top-nav {
  height: 48px;
  background: #FFFFFF;
  border-bottom: 1px solid #E4E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  flex-shrink: 0;

  .nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;

    .back-btn {
      height: 32px;
      width: 32px;
      padding: 0;
      color: #5F6368;

      &:hover {
        background: #F5F6F7;
        color: #212121;
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;

      .breadcrumb-item {
        color: #5F6368;
        white-space: nowrap;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;

        &.active {
          color: #212121;
          font-weight: 500;
        }
      }

      .separator {
        font-size: 10px;
        color: #D0D5DD;
      }
    }
  }

  .nav-center {
    flex: 1;
    display: flex;
    justify-content: center;

    .nav-tabs {
      display: flex;
      gap: 2px;
      background: #F1F3F4;
      padding: 2px;
      border-radius: 6px;

      .tab-btn {
        height: 28px;
        padding: 0 20px;
        border: none;
        background: transparent;
        color: #5F6368;
        font-size: 13px;
        font-weight: 400;
        border-radius: 4px;
        transition: all 0.15s;

        &:hover {
          background: rgba(255, 255, 255, 0.5);
          color: #212121;
        }

        &.active {
          background: #FFFFFF;
          color: #212121;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;

    .action-btn {
      height: 32px;
      padding: 0 12px;
      border: 1px solid #D0D5DD;
      background: #FFFFFF;
      color: #202124;
      font-size: 13px;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        border-color: #98A2B3;
        background: #F8F9FA;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &.deploy-btn {
        background: #4285F4;
        color: #FFFFFF;
        border-color: #4285F4;
        font-weight: 500;

        &:hover {
          background: #3367D6;
          border-color: #3367D6;
        }
      }
    }
  }
}

// ==================== Toolbar ====================
.toolbar {
  height: 48px;
  background: #E8EAED;
  border-bottom: 1px solid #D4D7DC;
  display: flex;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  gap: 0;

  .toolbar-section {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toolbar-label {
    font-size: 12px;
    color: #5F6368;
    font-weight: 500;
    margin-right: 4px;
  }

  .toolbar-btn {
    height: 32px;
    min-width: 32px;
    padding: 4px 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #5F6368;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #D4D7DC;
      border-color: #BFC3C9;
    }

    &.active {
      background: #FFFFFF;
      border-color: #C4C7CC;
      color: #202124;
    }
  }

  .toolbar-dropdown-btn {
    height: 32px;
    padding: 4px 12px;
    border: 1px solid #BFC3C9;
    background: #FFFFFF;
    color: #202124;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 400;
    transition: all 0.2s;
    display: flex;
    align-items: center;

    &:hover {
      border-color: #98A2B3;
      background: #F8F9FA;
    }
  }

  .toolbar-icon-btn {
    height: 32px;
    width: 32px;
    min-width: 32px;
    padding: 0;
    border: 1px solid transparent;
    background: transparent;
    color: #5F6368;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #D4D7DC;
      border-color: #BFC3C9;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

// ==================== Add Data Menu ====================
.add-data-menu {
  :deep(.ant-dropdown-menu-item) {
    padding: 10px 16px;
    font-size: 13px;
    color: #202124;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
      background-color: #F1F3F4;
    }

    .anticon {
      font-size: 16px;
      color: #4285F4;
    }
  }
}

// ==================== Main Content ====================
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
  min-height: 0;
}

.canvas-area {
  flex: 1;
  position: relative;
  background: #ECEEF1;
  overflow: hidden;
}

.zoom-controls {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .zoom-level {
    min-width: 50px;
    text-align: center;
    font-size: 13px;
    color: #5F6368;
    font-weight: 500;
  }
}

// Official hint bar (Palantir style blue banner)
.official-hint-bar {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 600px;
  max-width: 800px;
  z-index: 100;
  animation: slideUp 0.3s ease-out;

  .hint-content {
    background: #4285F4;
    color: #FFFFFF;
    padding: 14px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    box-shadow: 0 4px 16px rgba(66, 133, 244, 0.4);

    .hint-icon {
      font-size: 16px;
      flex-shrink: 0;
    }

    .hint-text {
      flex: 1;
      line-height: 1.5;

      .hint-link {
        color: #FFFFFF;
        text-decoration: underline;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .hint-close {
      flex-shrink: 0;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

// ==================== Right Panel - Enhanced ====================
.right-panel {
  width: 900px;
  background: #FFFFFF;
  border-left: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;

  .resize-handle-left {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
    z-index: 10;

    &:hover {
      background: #4285F4;
    }
  }

  .right-panel-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  // Panel section
  .panel-section {
    border-bottom: 1px solid #E4E7EB;

    .section-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;

      &.collapsible {
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background: #F8F9FA;
        }
      }

      .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;

        h3 {
          font-size: 14px;
          font-weight: 600;
          color: #212121;
          margin: 0;
        }

        .pin-btn {
          padding: 4px;
          color: #5F6368;

          &:hover {
            color: #212121;
            background: #F5F6F7;
          }
        }

        .expand-icon {
          font-size: 10px;
          color: #5F6368;
          transition: transform 0.2s;

          &.expanded {
            transform: rotate(180deg);
          }
        }
      }
    }

    .section-content {
      padding: 0 20px 20px;

      .section-desc {
        font-size: 13px;
        color: #5F6368;
        line-height: 1.6;
        margin-bottom: 16px;
      }
    }
  }

  // Pipeline outputs
  .outputs-empty {
    text-align: center;
    padding: 20px 0;

    .empty-icon {
      font-size: 48px;
      color: #D0D5DD;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 13px;
      color: #5F6368;
      margin-bottom: 16px;
    }

    .add-output-btn {
      border-radius: 4px;
      font-size: 13px;
      height: 36px;
    }
  }

  .outputs-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .output-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #F5F6F7;
      border: 1px solid #E4E7EB;
      border-radius: 6px;
      transition: all 0.2s;

      &:hover {
        border-color: #4285F4;
        background: #E8F0FE;
      }

      .output-icon {
        width: 32px;
        height: 32px;
        background: #4285F4;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-size: 16px;
      }

      .output-info {
        flex: 1;

        .output-name {
          font-size: 13px;
          font-weight: 500;
          color: #212121;
        }

        .output-type {
          font-size: 12px;
          color: #5F6368;
        }
      }
    }
  }

  // Legend
  .legend-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;

      .legend-color {
        width: 16px;
        height: 16px;
        border-radius: 3px;
        flex-shrink: 0;
      }

      .legend-label {
        font-size: 13px;
        color: #212121;
      }
    }
  }

  // Settings
  .settings-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .setting-label {
        font-size: 13px;
        color: #212121;
      }
    }
  }
}

// ==================== Bottom Panel - Palantir Official Style ====================
.bottom-panel {
  height: 350px;
  background: #FFFFFF;
  border-top: 1px solid #E4E7EB;
  display: flex;
  flex-direction: column;
  position: relative;
  flex-shrink: 0;

  .resize-handle-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: ns-resize;
    z-index: 10;

    &:hover {
      background: #4285F4;
    }
  }

  // Main header with primary tabs
  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #E4E7EB;
    background: #FFFFFF;

    .panel-header-left {
      display: flex;
      gap: 4px;

      .primary-tab-btn {
        height: 32px;
        padding: 0 16px;
        border: 1px solid transparent;
        background: transparent;
        color: #5F6368;
        font-size: 13px;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #F5F6F7;
          color: #212121;
        }

        &.active {
          background: #4285F4;
          color: #FFFFFF;
          font-weight: 500;
          border-color: #4285F4;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .primary-tab-btn-icon {
        height: 32px;
        width: 32px;
        min-width: 32px;
        padding: 0;
        border: 1px solid transparent;
        background: transparent;
        color: #5F6368;
        font-size: 16px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover:not(:disabled) {
          background: #F5F6F7;
          color: #212121;
        }

        &.active {
          background: #E8F0FE;
          color: #4285F4;
          border-color: #4285F4;
        }
      }
    }

    .panel-header-right {
      display: flex;
      gap: 4px;

      .expand-btn,
      .close-btn {
        height: 32px;
        padding: 0 12px;
        color: #5F6368;

        &:hover {
          color: #212121;
          background: #F5F6F7;
        }
      }

      .close-btn {
        padding: 0;
        width: 32px;
      }
    }
  }

  // Sub header with secondary tabs
  .panel-sub-header {
    border-bottom: 1px solid #E4E7EB;
    background: #F8F9FA;

    :deep(.sub-tabs) {
      .ant-tabs-nav {
        margin: 0;
        padding: 0 12px;

        &::before {
          border: none;
        }

        .ant-tabs-tab {
          padding: 10px 16px;
          font-size: 13px;
          color: #5F6368;
          background: transparent;
          border: none;
          margin: 0 4px 0 0;

          &:hover {
            color: #212121;
          }

          &.ant-tabs-tab-active {
            .ant-tabs-tab-btn {
              color: #212121;
              font-weight: 500;
            }
          }
        }

        .ant-tabs-ink-bar {
          background: #4285F4;
          height: 2px;
        }
      }
    }
  }

  // Panel body content
  .panel-body {
    flex: 1;
    overflow: hidden;
    background: #FFFFFF;

    .tab-content {
      height: 100%;
      overflow-y: auto;
    }

    // About Tab content
    .about-content {
      padding: 20px;

      .about-section {
        margin-bottom: 24px;

        .about-label {
          display: block;
          font-size: 12px;
          color: #5F6368;
          margin-bottom: 8px;
        }

        .about-textarea {
          font-size: 13px;
        }
      }

      .about-meta {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .meta-row {
          display: flex;
          align-items: center;
          font-size: 13px;

          .meta-label {
            min-width: 100px;
            color: #5F6368;
            font-weight: 500;
          }

          .meta-value {
            color: #212121;
          }
        }
      }
    }

    // Columns Tab content
    .columns-content {
      display: flex;
      flex-direction: column;
      height: 100%;

      .empty-state {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .columns-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .columns-toolbar {
        padding: 12px 20px;
        border-bottom: 1px solid #E4E7EB;
        display: flex;
        gap: 12px;
        align-items: center;
        background: #F8F9FA;

        .column-count {
          margin-left: auto;
          font-size: 12px;
          color: #5F6368;
        }
      }

      .columns-list {
        flex: 1;
        overflow: auto;
        padding: 20px;
      }

      .columns-table {
        width: 100%;

        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

          thead {
            background: #F8F9FA;

            th {
              padding: 12px 16px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #5F6368;
              border-bottom: 1px solid #E4E7EB;
            }
          }

          tbody {
            .column-row {
              border-bottom: 1px solid #E4E7EB;
              transition: background 0.2s;

              &:hover {
                background: #F8F9FA;
              }

              &:last-child {
                border-bottom: none;
              }

              td {
                padding: 12px 16px;
                font-size: 13px;
                color: #212121;
              }

              .column-name-cell {
                display: flex;
                align-items: center;
              }
            }
          }
        }
      }
    }

    // Schedules Tab content
    .schedules-content {
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    // Preview Tab content
    .preview-header {
      padding: 12px 16px;
      border-bottom: 1px solid #E4E7EB;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #F8F9FA;

      .preview-title {
        display: flex;
        align-items: center;
        font-size: 13px;
        font-weight: 500;
        color: #212121;

        .preview-stats {
          margin-left: 12px;
          color: #5F6368;
          font-weight: 400;
        }
      }
    }

    // Suggestions Tab content
    .suggestions-content {
      padding: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .suggestion-hint {
        font-size: 13px;
        color: #5F6368;
        margin-top: 12px;
      }
    }
  }
}

// ==================== Rename Modal ====================
.rename-modal-content {
  padding: 12px 0;

  .rename-form-item {
    margin-bottom: 16px;

    .rename-label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #212121;
    }

    .rename-hint {
      margin-top: 6px;
      font-size: 12px;
      color: #98A2B3;
    }

    .rename-error {
      margin-top: 6px;
      font-size: 12px;
      color: #F5222D;
    }
  }

  .rename-info {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background: #F0F7FF;
    border: 1px solid #D4E8FF;
    border-radius: 6px;
  }
}

// ==================== Clean Actions Popup Menu (Palantir Style) ====================
.clean-actions-popup {
  position: fixed;
  z-index: 1000;
  background: #FFFFFF;
  border: 1px solid #E4E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
  min-width: 160px;
  animation: fadeInScale 0.2s ease-out;

  .clean-menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #F8F9FA;
    }

    .clean-menu-icon {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .clean-menu-label {
      font-size: 14px;
      font-weight: 500;
      flex: 1;
    }
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

// ==================== Modal Styles ====================
:deep(.transform-config-modal),
:deep(.join-config-modal) {
  .ant-modal-content {
    border-radius: 8px;
    overflow: hidden;
  }

  .ant-modal-body {
    padding: 0;
    height: 80vh;
    overflow: hidden;
  }
}
</style>
