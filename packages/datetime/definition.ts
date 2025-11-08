import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

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
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars: string[] = [
      ...getInputFromTemplate((config.inputDate as string) || ''),
      ...getInputFromTemplate((config.format as string) || ''),
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { output: '', details: {} },
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

      const operation = config.operation as string;
      let result: any;

      switch (operation) {
        case 'now':
          result = getCurrentDateTime(config);
          break;

        case 'format':
          const inputDate = processTemplate((config.inputDate as string) || '', vars);
          result = formatDateTime(config, inputDate);
          break;

        case 'parse':
          const dateString = processTemplate((config.inputDate as string) || '', vars);
          result = parseDateTime(dateString);
          break;

        case 'add':
          const addDate = processTemplate((config.inputDate as string) || '', vars);
          result = addToDateTime(config, addDate);
          break;

        case 'subtract':
          const subtractDate = processTemplate((config.inputDate as string) || '', vars);
          result = subtractFromDateTime(config, subtractDate);
          break;

        case 'compare':
          const compareDate = processTemplate((config.inputDate as string) || '', vars);
          result = compareDateTime(config, compareDate);
          break;

        case 'timezone':
          const timezoneDate = processTemplate((config.inputDate as string) || '', vars);
          result = convertTimezone(config, timezoneDate);
          break;

        default:
          throw new Error(`Unsupported datetime operation: ${operation}`);
      }

      const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'datetime');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          output: resultText,
          details: typeof result === 'object' ? result : {}
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          operation
        }
      };
    } catch (error: unknown) {
      console.error('DateTime node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown datetime error';

      return {
        outputs: {
          output: `Error: ${errorMessage}`,
          details: {}
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

// Helper functions
function getCurrentDateTime(config: any): string {
  const now = new Date();
  const format = config.format || 'ISO';

  switch (format.toLowerCase()) {
    case 'iso':
      return now.toISOString();
    case 'timestamp':
      return now.getTime().toString();
    case 'date':
      return now.toDateString();
    case 'time':
      return now.toTimeString();
    case 'locale':
      return now.toLocaleString();
    default:
      return now.toISOString();
  }
}

function formatDateTime(config: any, inputDate: string): string {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const format = config.format || 'ISO';

  switch (format.toLowerCase()) {
    case 'iso':
      return date.toISOString();
    case 'timestamp':
      return date.getTime().toString();
    case 'date':
      return date.toDateString();
    case 'time':
      return date.toTimeString();
    case 'locale':
      return date.toLocaleString();
    default:
      return date.toISOString();
  }
}

function parseDateTime(dateString: string): any {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Unable to parse date: ${dateString}`);
  }

  return {
    iso: date.toISOString(),
    timestamp: date.getTime(),
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
    dayOfWeek: date.getDay(),
    dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
    monthName: date.toLocaleDateString('en-US', { month: 'long' }),
  };
}

function addToDateTime(config: any, inputDate: string): string {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const amount = config.amount || 0;
  const unit = config.unit || 'days';

  switch (unit) {
    case 'seconds':
      date.setSeconds(date.getSeconds() + amount);
      break;
    case 'minutes':
      date.setMinutes(date.getMinutes() + amount);
      break;
    case 'hours':
      date.setHours(date.getHours() + amount);
      break;
    case 'days':
      date.setDate(date.getDate() + amount);
      break;
    case 'weeks':
      date.setDate(date.getDate() + amount * 7);
      break;
    case 'months':
      date.setMonth(date.getMonth() + amount);
      break;
    case 'years':
      date.setFullYear(date.getFullYear() + amount);
      break;
  }

  return date.toISOString();
}

function subtractFromDateTime(config: any, inputDate: string): string {
  const modifiedConfig = { ...config, amount: -(config.amount || 0) };
  return addToDateTime(modifiedConfig, inputDate);
}

function compareDateTime(config: any, inputDate: string): any {
  const date1 = new Date(inputDate);
  const date2 = config.compareWith ? new Date(config.compareWith) : new Date();

  if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
    throw new Error('Invalid dates for comparison');
  }

  const diff = date1.getTime() - date2.getTime();

  return {
    isBefore: diff < 0,
    isAfter: diff > 0,
    isEqual: diff === 0,
    differenceMs: Math.abs(diff),
    differenceSeconds: Math.abs(Math.floor(diff / 1000)),
    differenceMinutes: Math.abs(Math.floor(diff / (1000 * 60))),
    differenceHours: Math.abs(Math.floor(diff / (1000 * 60 * 60))),
    differenceDays: Math.abs(Math.floor(diff / (1000 * 60 * 60 * 24))),
  };
}

function convertTimezone(config: any, inputDate: string): string {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const timezone = config.timezone || 'UTC';

  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch (e) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}
