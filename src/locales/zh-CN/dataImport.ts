export default {
  csv: {
    title: '导入 CSV 文件',
    dragText: '点击或拖拽文件到此区域上传',
    hint: '支持最大 10MB 的 CSV 文件。第一行可用作列标题。',
    invalidFileType: '请上传 CSV 文件',
    fileTooLarge: '文件大小不能超过 10MB',
    uploadSuccess: '文件上传成功',
    parseError: '解析 CSV 文件失败',
    readError: '读取文件失败',
    emptyFile: 'CSV 文件为空',

    // 配置
    datasetName: '数据集名称',
    datasetNamePlaceholder: '输入数据集名称',
    delimiter: '分隔符',
    comma: '逗号',
    semicolon: '分号',
    tab: '制表符',
    pipe: '竖线',
    firstRowHeader: '首行作为列标题',
    autoDetectTypes: '自动检测数据类型',

    // 预览
    preview: '数据预览',
    rows: '行',
    columns: '列',
    showing: '显示',

    // 操作
    import: '导入',
    nameRequired: '请输入数据集名称',
    noData: '没有可导入的数据',
    importSuccess: '成功导入数据集：{name}'
  }
}
