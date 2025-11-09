import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { dateTimeExecutor } from './executor';

/**
 * DateTime Node Definition
 * 
 * Comprehensive date/time operations: format, parse, add, subtract, compare, timezone.
 * Supports multiple formats and template variables.
 * 
 * Operations:
 * - now: Get current date/time
 * - format: Format date to specific format
 * - parse: Parse date string to components
 * - add: Add time units
 * - subtract: Subtract time units
 * - compare: Compare two dates
 * - timezone: Convert between timezones
 * 
 * Formats:
 * - ISO: ISO 8601 format
 * - timestamp: Unix timestamp (ms)
 * - date: Date only
 * - time: Time only
 * - locale: Locale-specific format
 * - custom: Custom format string
 * 
 * Example:
 * ```json
 * {
 *   "operation": "add",
 *   "inputDate": "{startDate}",
 *   "amount": 7,
 *   "unit": "days",
 *   "format": "ISO"
 * }
 * ```
 */
export const DateTimeNodeDefinition: NodeDefinition = {
  id: 'datetime',
  name: 'DateTime',
  category: NodeCategory.UTILITY,
  description: 'Date/time operations: format, parse, add, subtract, compare, timezone',
  version: '1.0.0',

  inputs: [
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'DateTime operation',
      required: true,
      defaultValue: 'now',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Now', value: 'now' },
          { label: 'Format', value: 'format' },
          { label: 'Parse', value: 'parse' },
          { label: 'Add', value: 'add' },
          { label: 'Subtract', value: 'subtract' },
          { label: 'Compare', value: 'compare' },
          { label: 'Timezone', value: 'timezone' },
        ],
      },
    },
    {
      id: 'inputDate',
      name: 'Input Date',
      type: PortType.TEXT,
      description: 'Date string or template variable (not needed for "now")',
      required: false,
      metadata: { inputType: 'text', placeholder: '2025-10-07T12:00:00Z' },
    },
    {
      id: 'format',
      name: 'Format',
      type: PortType.TEXT,
      description: 'Output format',
      required: false,
      defaultValue: 'ISO',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'ISO', value: 'ISO' },
          { label: 'Timestamp', value: 'timestamp' },
          { label: 'Date', value: 'date' },
          { label: 'Time', value: 'time' },
          { label: 'Locale', value: 'locale' },
          { label: 'Custom', value: 'custom' },
        ],
      },
    },
    {
      id: 'customFormat',
      name: 'Custom Format',
      type: PortType.TEXT,
      description: 'Custom format string (e.g., YYYY-MM-DD)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
    },
    {
      id: 'amount',
      name: 'Amount',
      type: PortType.NUMBER,
      description: 'Amount to add/subtract',
      required: false,
      defaultValue: 0,
      metadata: { inputType: 'number' },
    },
    {
      id: 'unit',
      name: 'Unit',
      type: PortType.TEXT,
      description: 'Time unit',
      required: false,
      defaultValue: 'days',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Seconds', value: 'seconds' },
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' },
          { label: 'Days', value: 'days' },
          { label: 'Weeks', value: 'weeks' },
          { label: 'Months', value: 'months' },
          { label: 'Years', value: 'years' },
        ],
      },
    },
    {
      id: 'timezone',
      name: 'Timezone',
      type: PortType.TEXT,
      description: 'Target timezone (e.g., America/New_York)',
      required: false,
      metadata: { inputType: 'text', placeholder: 'America/New_York' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'output',
      name: 'Result',
      type: PortType.TEXT,
      description: 'Formatted datetime or operation result',
    },
    {
      id: 'details',
      name: 'Details',
      type: PortType.JSON,
      description: 'Detailed datetime components (for parse operation)',
    },
  ] as OutputPort[],

  getDynamicInputs: (config) => {
    const variableNames: Set<string> = new Set();

    if (config.inputDate) {
      getInputFromTemplate(config.inputDate as string).forEach(v => variableNames.add(v));
    }
    if (config.format && typeof config.format === 'string') {
      getInputFromTemplate(config.format).forEach(v => variableNames.add(v));
    }

    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));

    return [...DateTimeNodeDefinition.inputs, ...dynamicPorts];
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { node, flowState, dispatcher } = context;
    
    // Convert to FlowExecutionContext format expected by BaseNodeExecutor
    const flowExecutionContext = { 
      flow: { nodes: [], edges: [] }, 
      flowState,
      input: { role: 'user' as const, content: '' } // Empty input for now
    };
    
    // Execute using the BaseNodeExecutor
    const result = await dateTimeExecutor.execute(node, flowExecutionContext, dispatcher);
    
    // Convert ExecutionResult to NodeExecutionResult format
    const statusMap: Record<string, 'success' | 'error' | 'in_progress'> = {
      'ended': 'success',
      'error': 'error',
      'in_progress': 'in_progress',
      'waiting': 'in_progress',
      'token': 'in_progress',
      'add_message': 'in_progress'
    };
    
    return {
      outputs: {
        output: result.execution?.output || '',
        details: result.nodeInfo || {},
      },
      status: statusMap[result.status] || 'in_progress',
      metadata: {
        startTime: result.execution?.startTime,
        endTime: result.execution?.endTime,
        operation: result.nodeInfo?.type,
      },
    };
  }
};

export default DateTimeNodeDefinition;
