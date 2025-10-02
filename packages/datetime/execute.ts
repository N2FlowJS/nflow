import { FlowNode } from '@n2flowjs/flow';
import { DateTimeNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import {
  findNextNodes,
  isNodeReady,
  FlowStateDispatcher,
  ExecutionResult,
  FlowExecutionContext,
  ResultWaiting
} from '@n2flowjs/flow';

/**
 * Handler for executing DateTime nodes
 */
export async function executeDateTimeNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as DateTimeNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [...getInputFromTemplate(form.inputDate || ''), ...getInputFromTemplate(form.format || '')];

  if (!isNodeReady(inputs, flowState)) {
    return ResultWaiting(node, flowState, startTime);
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    console.log(`Executing DateTime node: ${node.id} with operation: ${form.operation}`);

    let result: any;

    switch (form.operation) {
      case 'now':
        result = await getCurrentDateTime(form);
        break;

      case 'format':
        const inputDate = processTemplate(form.inputDate || '', vars);
        result = await formatDateTime(form, inputDate);
        break;

      case 'parse':
        const dateString = processTemplate(form.inputDate || '', vars);
        result = await parseDateTime(form, dateString);
        break;

      case 'add':
        const addDate = processTemplate(form.inputDate || '', vars);
        result = await addToDateTime(form, addDate);
        break;

      case 'subtract':
        const subtractDate = processTemplate(form.inputDate || '', vars);
        result = await subtractFromDateTime(form, subtractDate);
        break;

      case 'compare':
        const compareDate = processTemplate(form.inputDate || '', vars);
        result = await compareDateTime(form, compareDate);
        break;

      case 'timezone':
        const timezoneDate = processTemplate(form.inputDate || '', vars);
        result = await convertTimezone(form, timezoneDate);
        break;

      default:
        throw new Error(`Unsupported datetime operation: ${form.operation}`);
    }

    const resultText = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);

    console.log(`DateTime node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'datetime');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'datetime';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'datetime',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('DateTime execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown datetime error';

    return {
      nextNodes: [],
      status: 'error',
      message: `DateTime operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'datetime',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper functions for datetime operations
async function getCurrentDateTime(form: any) {
  const now = new Date();
  const format = form.format || 'ISO';

  switch (format.toLowerCase()) {
    case 'iso':
      return now.toISOString();
    case 'timestamp':
      return now.getTime();
    case 'date':
      return now.toDateString();
    case 'time':
      return now.toTimeString();
    case 'locale':
      return now.toLocaleString();
    default:
      // Custom format using Intl.DateTimeFormat or basic replacements
      return formatDateTimeCustom(now, format);
  }
}

async function formatDateTime(form: any, inputDate: string) {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const format = form.format || 'ISO';

  switch (format.toLowerCase()) {
    case 'iso':
      return date.toISOString();
    case 'timestamp':
      return date.getTime();
    case 'date':
      return date.toDateString();
    case 'time':
      return date.toTimeString();
    case 'locale':
      return date.toLocaleString();
    default:
      return formatDateTimeCustom(date, format);
  }
}

async function parseDateTime(_form: any, dateString: string) {
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

async function addToDateTime(form: any, inputDate: string) {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const amount = form.amount || 0;
  const unit = form.unit || 'days';

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
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return {
    original: inputDate,
    result: date.toISOString(),
    operation: `+${amount} ${unit}`,
  };
}

async function subtractFromDateTime(form: any, inputDate: string) {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const amount = form.amount || 0;
  const unit = form.unit || 'days';

  switch (unit) {
    case 'seconds':
      date.setSeconds(date.getSeconds() - amount);
      break;
    case 'minutes':
      date.setMinutes(date.getMinutes() - amount);
      break;
    case 'hours':
      date.setHours(date.getHours() - amount);
      break;
    case 'days':
      date.setDate(date.getDate() - amount);
      break;
    case 'weeks':
      date.setDate(date.getDate() - amount * 7);
      break;
    case 'months':
      date.setMonth(date.getMonth() - amount);
      break;
    case 'years':
      date.setFullYear(date.getFullYear() - amount);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return {
    original: inputDate,
    result: date.toISOString(),
    operation: `-${amount} ${unit}`,
  };
}

async function compareDateTime(_form: any, inputDate: string) {
  const date1 = new Date(inputDate);
  const date2 = new Date(); // Compare with current time

  if (isNaN(date1.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const diff = date1.getTime() - date2.getTime();

  return {
    date1: date1.toISOString(),
    date2: date2.toISOString(),
    difference: {
      milliseconds: diff,
      seconds: Math.floor(diff / 1000),
      minutes: Math.floor(diff / (1000 * 60)),
      hours: Math.floor(diff / (1000 * 60 * 60)),
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    },
    comparison: {
      isBefore: diff < 0,
      isAfter: diff > 0,
      isSame: diff === 0,
    },
  };
}

async function convertTimezone(form: any, inputDate: string) {
  const date = new Date(inputDate);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${inputDate}`);
  }

  const timezone = form.timezone || 'UTC';

  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const formatted = formatter.format(date);

    return {
      original: inputDate,
      timezone: timezone,
      converted: formatted,
      iso: date.toISOString(),
    };
  } catch (error) {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

function formatDateTimeCustom(date: Date, format: string): string {
  // Basic custom formatting - can be extended
  const replacements: { [key: string]: string } = {
    YYYY: date.getFullYear().toString(),
    MM: (date.getMonth() + 1).toString().padStart(2, '0'),
    DD: date.getDate().toString().padStart(2, '0'),
    HH: date.getHours().toString().padStart(2, '0'),
    mm: date.getMinutes().toString().padStart(2, '0'),
    ss: date.getSeconds().toString().padStart(2, '0'),
  };

  let result = format;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    result = result.replace(new RegExp(pattern, 'g'), replacement);
  }

  return result;
}
