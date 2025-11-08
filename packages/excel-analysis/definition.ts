import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import ExcelAnalysisExecutor from './executor';

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

  async execute(context) {
    // Delegate to new executor for unified execution
    const executor = new ExcelAnalysisExecutor();
    const { node, flowState, dispatcher } = context;
    // Compose minimal FlowExecutionContext
    const execResult = await executor.execute(node, {
      flow: { nodes: [], edges: [] },
      flowState,
      input: { role: 'system', content: '' },
    }, dispatcher);
    let outputs: Record<string, any> = {};
    try {
      outputs = JSON.parse(execResult.execution.output);
    } catch {
      outputs = { result: execResult.execution.output };
    }
    return {
      outputs,
      status: execResult.status as any,
      error: execResult.status === 'error' ? execResult.message : undefined,
      metadata: execResult.nodeInfo,
    };
  }
};


