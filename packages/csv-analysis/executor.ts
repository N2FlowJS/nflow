import { BaseNodeExecutor } from '../@node-plugin/base-executor';
import { CsvAnalysisForm } from './types';
import * as fs from 'fs';
import { processTemplate } from '@n2flowjs/template/template';

export class CsvAnalysisNodeExecutor extends BaseNodeExecutor<CsvAnalysisForm> {
  constructor() {
    super({
      nodeType: 'csvanalysis',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['filePath'],
    });
  }

  protected async executeLogic(form: CsvAnalysisForm): Promise<string> {
    // For migration, assume templateVars are resolved externally
    const filePath = processTemplate(form.filePath, {});
    if (!filePath) throw new Error('File path is required for CSV analysis');
    const csvContent = await fs.promises.readFile(filePath, { encoding: (form.encoding as BufferEncoding) || 'utf8' });
    const delimiter = form.delimiter || ',';
    const hasHeader = form.hasHeader !== false;
    let result: any;
    switch (form.operation) {
      case 'analyze':
        result = await analyzeCsvData(csvContent, delimiter, hasHeader);
        break;
      case 'validate':
        result = await validateCsvData(csvContent, delimiter, hasHeader);
        break;
      default:
        throw new Error(`Unsupported CSV operation: ${form.operation}`);
    }
    return JSON.stringify({
      result,
      rowCount: result.rowCount || 0
    });
  }
}

async function analyzeCsvData(csvContent: string, delimiter: string, hasHeader: boolean) {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const rowCount = hasHeader ? lines.length - 1 : lines.length;
  const firstLine = lines[0] || '';
  const columns = firstLine.split(delimiter);
  const columnCount = columns.length;
  const headers = hasHeader ? columns : columns.map((_, i) => `Column${i + 1}`);
  return {
    rowCount,
    columnCount,
    headers,
    hasHeader,
    delimiter,
    fileSize: csvContent.length,
    summary: `CSV file with ${rowCount} rows and ${columnCount} columns`
  };
}

async function validateCsvData(csvContent: string, delimiter: string, hasHeader: boolean) {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const issues: string[] = [];
  if (lines.length === 0) {
    issues.push('File is empty');
    return { valid: false, issues };
  }
  const firstLine = lines[0] || '';
  const expectedColumns = firstLine.split(delimiter).length;
  const startIndex = hasHeader ? 1 : 0;
  for (let i = startIndex; i < lines.length; i++) {
    const columns = lines[i].split(delimiter).length;
    if (columns !== expectedColumns) {
      issues.push(`Row ${i + 1}: Expected ${expectedColumns} columns, found ${columns}`);
    }
  }
  return {
    valid: issues.length === 0,
    issues,
    rowCount: hasHeader ? lines.length - 1 : lines.length,
    columnCount: expectedColumns
  };
}
