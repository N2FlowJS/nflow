import { ExecutionResult, FlowExecutionContext } from '../@flow/type';
import { ExcelAnalysisNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import * as fs from 'fs';

/**
 * Handler for executing Excel Analysis nodes
 */
export async function executeExcelAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ExcelAnalysisNodeData;
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
      message: 'Waiting for input variables for Excel analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'excelanalysis',
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
    console.log(`Executing Excel Analysis node: ${node.id} with operation: ${form.operation}`);

    const filePath = processTemplate(form.filePath || '', vars);
    
    if (!filePath) {
      throw new Error('File path is required for Excel analysis');
    }

    // Check if file exists
    await fs.promises.access(filePath);

    let result: any;

    switch (form.operation) {
      case 'read_sheets':
        result = await analyzeExcelSheets(filePath, form);
        break;
      case 'analyze_data':
        result = await analyzeExcelData(filePath, form);
        break;
      default:
        throw new Error(`Unsupported Excel operation: ${form.operation}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`Excel Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'excelanalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'excelanalysis';
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
        type: 'excelanalysis',
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
    console.error('Excel analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Excel analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Excel analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'excelanalysis',
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

async function analyzeExcelSheets(filePath: string, form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like xlsx or exceljs
  const stats = await fs.promises.stat(filePath);
  
  return {
    filePath: filePath,
    fileSize: stats.size,
    lastModified: stats.mtime,
    note: 'Excel analysis requires additional Excel processing libraries like xlsx or exceljs',
    operation: 'read_sheets',
    includeFormulas: form.includeFormulas || false,
    skipEmptyRows: form.skipEmptyRows || true,
  };
}

async function analyzeExcelData(filePath: string, form: any) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like xlsx or exceljs
  const stats = await fs.promises.stat(filePath);
  
  return {
    filePath: filePath,
    fileSize: stats.size,
    operation: 'analyze_data',
    sheetName: form.sheetName || 'Sheet1',
    cellRange: form.cellRange || 'A1:Z100',
    note: 'Excel data analysis requires additional Excel processing libraries like xlsx or exceljs',
  };
}
