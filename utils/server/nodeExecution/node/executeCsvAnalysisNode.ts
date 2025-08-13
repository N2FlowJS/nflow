import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { CsvAnalysisNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';
import * as fs from 'fs';

/**
 * Handler for executing CSV Analysis nodes
 */
export async function executeCsvAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as CsvAnalysisNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from file path
  const inputs: string[] = [
    ...getInputFromTemplate(form.filePath || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for CSV analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'csvanalysis',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    console.log(`Executing CSV Analysis node: ${node.id} with operation: ${form.operation}`);

    const filePath = processTemplate(form.filePath || '', vars);
    
    if (!filePath) {
      throw new Error('File path is required for CSV analysis');
    }

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

    const resultText = JSON.stringify(result, null, 2);

    console.log(`CSV Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'csvanalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'csvanalysis';
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
        type: 'csvanalysis',
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
    console.error('CSV analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown CSV analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `CSV analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'csvanalysis',
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

async function analyzeCsvData(content: string, delimiter: string, hasHeader: boolean) {
  const lines = content.trim().split('\n');
  const headers = hasHeader ? lines[0].split(delimiter) : [];
  const dataLines = hasHeader ? lines.slice(1) : lines;
  
  return {
    totalRows: dataLines.length,
    totalColumns: headers.length || (dataLines[0] ? dataLines[0].split(delimiter).length : 0),
    headers: headers,
    sampleData: dataLines.slice(0, 5).map(line => line.split(delimiter)),
    emptyRows: dataLines.filter(line => !line.trim()).length,
  };
}

async function validateCsvData(content: string, delimiter: string, _hasHeader: boolean) {
  const lines = content.trim().split('\n');
  const expectedColumns = lines[0] ? lines[0].split(delimiter).length : 0;
  const issues: string[] = [];
  
  lines.forEach((line, index) => {
    const columns = line.split(delimiter);
    if (columns.length !== expectedColumns) {
      issues.push(`Row ${index + 1}: Expected ${expectedColumns} columns, found ${columns.length}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues: issues,
    totalRows: lines.length,
    expectedColumns: expectedColumns,
  };
}
