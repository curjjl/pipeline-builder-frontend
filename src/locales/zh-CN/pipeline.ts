export default {
  title: '管道',
  list: {
    title: '管道列表',
    createNew: '创建管道',
    empty: '暂无管道',
    emptyDescription: '创建您的第一个管道以开始使用',
    search: '搜索管道...',
    noPipelinesFound: '未找到管道',
    loadingPipelines: '加载管道中...'
  },
  editor: {
    title: '编辑管道',
    editingPipeline: '正在编辑管道',
    tabs: {
      graph: '图形',
      proposals: '提议',
      history: '历史记录'
    },
    toolbar: {
      tools: '工具',
      addData: '添加数据',
      transform: '转换',
      select: '选择',
      selectAll: '全选 (Ctrl+A)',
      clearSelection: '清除选择 (Esc)',
      deleteSelected: '删除选中 (Delete)',
      autoLayout: '自动布局',
      fitToScreen: '适配屏幕',
      layout: '布局',
      remove: '移除'
    },
    canvas: {
      zoomIn: '放大',
      zoomOut: '缩小',
      fitToScreen: '适配屏幕',
      autoLayout: '自动布局',
      zoom: '缩放'
    },
    hints: {
      getStarted: '点击数据集节点并选择一个操作或',
      addDataToTransform: '来转换您的数据。'
    },
    messages: {
      saved: '管道保存成功',
      saveError: '管道保存失败',
      deployed: '管道部署成功',
      deployError: '管道部署失败'
    }
  },
  outputs: {
    title: '管道输出',
    description: '管道输出是您的管道构建的产物。Pipeline Builder 确保所有输出都已定义、健康且准备部署。',
    noOutputs: '未配置输出',
    addOutput: '添加管道输出',
    outputName: '输出名称',
    outputType: '输出类型'
  },
  nodes: {
    dataset: '数据集',
    transform: '转换',
    join: '连接',
    output: '输出',
    notConfigured: '未配置',
    configured: '已配置',
    rows: '{count} 行',
    columns: '{count} 列',
    rowsAndColumns: '{rows} 行 · {columns} 列',
    selectNode: '选择一个节点以查看其详细信息',
    noNodeSelected: '未选择节点'
  },
  panels: {
    legend: '图例',
    canvasSettings: '画布设置',
    selectionPreview: '选择预览',
    suggestions: '建议',
    expandAll: '展开全部',
    collapseAll: '折叠全部'
  },
  tabs: {
    about: '关于',
    columns: '列',
    schedules: '调度'
  }
}
