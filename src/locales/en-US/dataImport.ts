export default {
  csv: {
    title: 'Import CSV File',
    dragText: 'Click or drag file to this area to upload',
    hint: 'Support for CSV files up to 10MB. The first row can be used as column headers.',
    invalidFileType: 'Please upload a CSV file',
    fileTooLarge: 'File size cannot exceed 10MB',
    uploadSuccess: 'File uploaded successfully',
    parseError: 'Failed to parse CSV file',
    readError: 'Failed to read file',
    emptyFile: 'The CSV file is empty',

    // Configuration
    datasetName: 'Dataset Name',
    datasetNamePlaceholder: 'Enter dataset name',
    delimiter: 'Delimiter',
    comma: 'Comma',
    semicolon: 'Semicolon',
    tab: 'Tab',
    pipe: 'Pipe',
    firstRowHeader: 'First row as header',
    autoDetectTypes: 'Auto-detect data types',

    // Preview
    preview: 'Data Preview',
    rows: 'rows',
    columns: 'columns',
    showing: 'Showing',

    // Actions
    import: 'Import',
    nameRequired: 'Please enter a dataset name',
    noData: 'No data to import',
    importSuccess: 'Successfully imported dataset: {name}'
  }
}
