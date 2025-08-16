import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { FileAnalysisNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handler for executing File Analysis nodes
 */
export async function executeFileAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as FileAnalysisNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from file path
  const inputs: string[] = [...getInputFromTemplate(form.filePath || '')];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for file analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'fileanalysis',
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
    console.log(`Executing File Analysis node: ${node.id} with analysis type: ${form.analysisType}`);

    const filePath = processTemplate(form.filePath || '', vars);

    if (!filePath) {
      throw new Error('File path is required for file analysis');
    }

    let result: any;

    switch (form.analysisType) {
      case 'metadata':
        result = await getFileMetadata(filePath, form);
        break;
      case 'content':
        result = await analyzeFileContent(filePath, form);
        break;
      case 'structure':
        result = await analyzeFileStructure(filePath, form);
        break;
      default:
        throw new Error(`Unsupported file analysis type: ${form.analysisType}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`File Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'fileanalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'fileanalysis';
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
        type: 'fileanalysis',
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
    console.error('File analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown file analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `File analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'fileanalysis',
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

async function getFileMetadata(filePath: string, _form: any) {
  const stats = await fs.promises.stat(filePath);
  return {
    path: filePath,
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    extension: path.extname(filePath),
    basename: path.basename(filePath),
  };
}

async function analyzeFileContent(filePath: string, _form: any) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  return {
    path: filePath,
    size: content.length,
    lines: content.split('\n').length,
    words: content.split(/\s+/).length,
    characters: content.length,
    preview: content.substring(0, 500),
  };
}

async function analyzeFileStructure(filePath: string, _form: any) {
  const stats = await fs.promises.stat(filePath);

  if (stats.isDirectory()) {
    const files = await fs.promises.readdir(filePath);
    return {
      path: filePath,
      type: 'directory',
      files: files.length,
      contents: files.slice(0, 20), // Limit to first 20 items
    };
  } else {
    return {
      path: filePath,
      type: 'file',
      extension: path.extname(filePath),
      basename: path.basename(filePath),
      directory: path.dirname(filePath),
    };
  }
}
