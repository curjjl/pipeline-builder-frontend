export default {
  title: 'Pipeline',
  list: {
    title: 'Pipelines',
    createNew: 'Create Pipeline',
    empty: 'No pipelines yet',
    emptyDescription: 'Create your first pipeline to get started',
    search: 'Search pipelines...',
    noPipelinesFound: 'No pipelines found',
    loadingPipelines: 'Loading pipelines...'
  },
  create: {
    title: 'Create New Pipeline',
    pipelineType: 'Pipeline Type',
    batchPipeline: 'Batch Pipeline',
    batchDescription: 'Process datasets on a schedule or on-demand',
    streamingPipeline: 'Streaming Pipeline',
    streamingDescription: 'Continuously process real-time data streams',
    pipelineName: 'Pipeline Name',
    namePlaceholder: 'Enter pipeline name',
    description: 'Description',
    optional: '(optional)',
    descriptionPlaceholder: 'Enter a description for this pipeline...',
    saveLocation: 'Save Location',
    locationPlaceholder: 'Select save location',
    locationHint: 'Your pipeline will be saved to the selected folder. Consider organizing related pipelines together.',
    cancel: 'Cancel',
    createButton: 'Create Pipeline',
    createSuccess: 'Pipeline created successfully',
    nameErrorTooShort: 'Name must be at least 3 characters',
    nameErrorTooLong: 'Name cannot exceed 100 characters',
    nameErrorInvalidChars: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
  },
  editor: {
    title: 'Edit Pipeline',
    editingPipeline: 'Editing Pipeline',
    tabs: {
      graph: 'Graph',
      proposals: 'Proposals',
      history: 'History'
    },
    toolbar: {
      tools: 'Tools',
      addData: 'Add data',
      transform: 'Transform',
      select: 'Select',
      selectAll: 'Select All (Ctrl+A)',
      clearSelection: 'Clear Selection (Esc)',
      deleteSelected: 'Delete Selected (Delete)',
      autoLayout: 'Auto Layout',
      fitToScreen: 'Fit to Screen',
      layout: 'Layout',
      remove: 'Remove'
    },
    canvas: {
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      fitToScreen: 'Fit to screen',
      autoLayout: 'Auto layout',
      zoom: 'Zoom'
    },
    hints: {
      getStarted: 'Click a dataset node and select an action or',
      addDataToTransform: 'to transform your data.'
    },
    messages: {
      saved: 'Pipeline saved successfully',
      saveError: 'Failed to save pipeline',
      deployed: 'Pipeline deployed successfully',
      deployError: 'Failed to deploy pipeline',
      selectNode: 'Please select a node to export',
      noDataToExport: 'No data available to export',
      exportError: 'Export failed: {error}'
    }
  },
  outputs: {
    title: 'Pipeline outputs',
    description: 'Pipeline outputs are the artifacts your pipeline builds. Pipeline Builder ensures all outputs are defined, healthy, and ready to deploy.',
    noOutputs: 'No outputs configured',
    addOutput: 'Add pipeline output',
    outputName: 'Output Name',
    outputType: 'Output Type'
  },
  nodes: {
    dataset: 'Dataset',
    transform: 'Transform',
    join: 'Join',
    output: 'Output',
    notConfigured: 'Not configured',
    configured: 'Configured',
    rows: '{count} rows',
    columns: '{count} columns',
    rowsAndColumns: '{rows} rows · {columns} columns',
    selectNode: 'Select a node to view its details',
    noNodeSelected: 'No node selected'
  },
  panels: {
    legend: 'Legend',
    canvasSettings: 'Canvas settings',
    selectionPreview: 'Selection preview',
    suggestions: 'Suggestions',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all'
  },
  tabs: {
    about: 'About',
    columns: 'Columns',
    schedules: 'Schedules'
  }
}
