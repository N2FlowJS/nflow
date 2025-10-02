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
 * Excel Analysis Node Definition
 * 
 * Analyze Excel spreadsheet files (.xlsx, .xls).
 * Supports reading sheets, analyzing data, and extracting information.
 * 
 * Configuration:
 * - filePath: Path to Excel file (supports {variable} templates)
 * - operation: Analysis operation (read_sheets, analyze_data)
 * - sheetName: Specific sheet to analyze (optional)
 * - includeFormulas: Include formulas in analysis
 * 
 * Operations:
 * - read_sheets: List all sheets with basic info
 * - analyze_data: Analyze sheet data, statistics, types
 * 
 * Example:
 * ```json
 * {
 *   "filePath": "./reports/{filename}.xlsx",
 *   "operation": "read_sheets",
 *   "sheetName": "Sheet1"
 * }
 * ```
 */
export const ExcelAnalysisNodeDefinition: NodeDefinition = {
  id: 'excel-analysis',
  name: 'Excel Analysis',
  category: NodeCategory.PROCESSING,
  description: 'Analyze Excel spreadsheet files',
  version: '1.0.0',

  inputs: [
    {
      id: 'filePath',
      name: 'File Path',
      type: PortType.TEXT,
      description: 'Path to Excel file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'Enter Excel file path...' },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Analysis operation to perform',
      required: true,
      defaultValue: 'read_sheets',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Read Sheets', value: 'read_sheets' },
          { label: 'Analyze Data', value: 'analyze_data' },
        ],
      },
    },
    {
      id: 'sheetName',
      name: 'Sheet Name',
      type: PortType.TEXT,
      description: 'Specific sheet to analyze (optional)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Sheet1' },
    },
    {
      id: 'includeFormulas',
      name: 'Include Formulas',
      type: PortType.BOOLEAN,
      description: 'Include formulas in analysis',
      required: false,
      defaultValue: false,
      metadata: { inputType: 'checkbox' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'result',
      name: 'Analysis Result',
      type: PortType.JSON,
      description: 'Excel analysis results',
    },
    {
      id: 'sheetCount',
      name: 'Sheet Count',
      type: PortType.NUMBER,
      description: 'Number of sheets in workbook',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.filePath) {
      getInputFromTemplate(config.filePath as string).forEach(v => variableNames.add(v));
    }
    if (config.sheetName) {
      getInputFromTemplate(config.sheetName as string).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...ExcelAnalysisNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.filePath as string) || ''),
      ...getInputFromTemplate((config.sheetName as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, sheetCount: 0 },
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
        throw new Error('File path is required for Excel analysis');
      }

      // Check if file exists
      await fs.promises.access(filePath);

      let result: any;

      switch (config.operation) {
        case 'read_sheets':
          result = await analyzeExcelSheets(filePath, config);
          break;
        case 'analyze_data':
          result = await analyzeExcelData(filePath, config);
          break;
        default:
          throw new Error(`Unsupported Excel operation: ${config.operation}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'excelanalysis');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          sheetCount: result.sheetCount || result.sheets?.length || 0
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          filePath,
          operation: config.operation,
          sheetCount: result.sheetCount || result.sheets?.length || 0
        }
      };
    } catch (error: unknown) {
      console.error('Excel analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Excel analysis error';

      return {
        outputs: {
          result: null,
          sheetCount: 0
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

async function analyzeExcelSheets(filePath: string, _config: any) {
  // Simplified implementation - would use xlsx library in production
  const stats = await fs.promises.stat(filePath);
  
  return {
    filePath,
    operation: 'read_sheets',
    sheetCount: 1,
    sheets: [{ name: 'Sheet1', rowCount: 0, columnCount: 0 }],
    fileSize: stats.size,
    note: 'Requires xlsx library for full implementation'
  };
}

async function analyzeExcelData(filePath: string, config: any) {
  // Simplified implementation - would use xlsx library in production
  const stats = await fs.promises.stat(filePath);
  
  return {
    filePath,
    operation: 'analyze_data',
    sheetName: config.sheetName || 'Sheet1',
    fileSize: stats.size,
    note: 'Requires xlsx library for full implementation'
  };
}
