import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { CsvAnalysisNodeExecutor } from './executor';

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
 */
export const CsvAnalysisNodeDefinition: NodeDefinition = {
  id: 'csv-analysis',
  name: 'CSV Analysis',
  version: '1.0.0',
  category: NodeCategory.UTILITY,
  description: 'Analyze and validate CSV files. Supports operations like data analysis, validation, and statistics.',
  inputs: [
    {
      id: 'filePath',
      name: 'CSV File Path',
      type: PortType.TEXT,
      description: 'Path to CSV file (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: '/path/to/file.csv' },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Analysis operation',
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
  async execute(context) {
    // Delegate to new executor
    const executor = new CsvAnalysisNodeExecutor();
    const { node, flowState, dispatcher } = context;
    // Compose minimal FlowExecutionContext
    const execResult = await executor.execute(node, { flow: { nodes: [], edges: [] }, flowState, input: { role: 'system', content: '' } }, dispatcher);
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
