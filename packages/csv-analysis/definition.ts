import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';
import * as fs from 'fs';

/**
 * CSV Analysis Node Definition
 * 
 * Analyze and validate CSV files.
 * Supports operations like data analysis, validation, and statistics.
 * 
 * Configuration:
 * - filePath: Path to CSV file (supports {variable} templates)
 * - operation: Analysis operation (analyze, validate)
 * - delimiter: CSV delimiter (default: comma)
 * - hasHeader: First row is header (default: true)
 * - encoding: File encoding (default: utf8)
 * 
 * Operations:
 * - analyze: Get row count, column info, data types, statistics
 * - validate: Check format, detect issues, validate structure
 * 
 * Example:
 * ```json
 * {
 *   "filePath": "./data/{filename}.csv",
 *   "operation": "analyze",
 *   "delimiter": ",",
 *   "hasHeader": true
 * }
 * ```
 */
export const CsvAnalysisNodeDefinition: NodeDefinition = {
  id: 'csv-analysis',
  name: 'CSV Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyze and validate CSV files',
  version: '1.0.0',

  inputs: [
    {
      id: 'filePath',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Path to CSV file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter CSV file path...' },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Analysis operation to perform',
      required: true,
      defaultValue: 'analyze',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Analyze', value: 'analyze' },
          { label: 'Validate', value: 'validate' },
        ],
      },
    },
    {
      id: 'delimiter',
      name: 'Delimiter',
      type: PortType.TEXT,
      description: 'CSV delimiter character',
      required: false,
      defaultValue: ',',
      metadata: { inputType: 'text', placeholder: ',' },
    },
    {
      id: 'hasHeader',
      name: 'Has Header',
      type: PortType.BOOLEAN,
      description: 'First row is header row',
      required: false,
      defaultValue: true,
      metadata: { inputType: 'checkbox' },
    },
    {
      id: 'encoding',
      name: 'Encoding',
      type: PortType.TEXT,
      description: 'File encoding',
      required: false,
      defaultValue: 'utf8',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'UTF-8', value: 'utf8' },
          { label: 'ASCII', value: 'ascii' },
          { label: 'UTF-16 LE', value: 'utf16le' },
          { label: 'Latin-1', value: 'latin1' },
        ],
      },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Analysis Result',
      type: PortType.JSON,
      description: 'CSV analysis results',
    },
    {
      id: 'rowCount',
      name: 'Row Count',
      type: PortType.NUMBER,
      description: 'Number of rows in CSV',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filePath) {
      getInputFromTemplate(config.filePath as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...CsvAnalysisNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.filePath as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, rowCount: 0 },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      const filePath = processTemplate(config.filePath as string, vars);

      if (!filePath) {
        throw new Error('File path is required for CSV analysis');
      }

      const csvContent = await fs.promises.readFile(filePath, { 
        encoding: (config.encoding as BufferEncoding) || 'utf8' 
      });

      const delimiter = (config.delimiter as string) || ',';
      const hasHeader = config.hasHeader !== false;

      let result: any;

      switch (config.operation) {
        case 'analyze':
          result = await analyzeCsvData(csvContent, delimiter, hasHeader);
          break;
        case 'validate':
          result = await validateCsvData(csvContent, delimiter, hasHeader);
          break;
        default:
          throw new Error(`Unsupported CSV operation: ${config.operation}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'csvanalysis');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          rowCount: result.rowCount || 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          filePath,
          operation: config.operation,
          rowCount: result.rowCount || 0
        }
      };
    } catch (error: unknown) {
      console.error('CSV analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown CSV analysis error';

      return {
        outputs: {
          result: null,
          rowCount: 0
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};

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
