import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { FileReadNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { getInputFromTemplate, processTemplate } from '../../templateProcessor';
import { isNodeReady } from '../../isNodeReady';
import { FlowStateDispatcher } from '../flowStateDispatcher';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Handler for executing File Read nodes
 */
export async function executeFileReadNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as FileReadNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from the file path template
  const inputs: string[] = getInputFromTemplate(form.filePath || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for file path',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'fileread',
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
    // Validate required fields
    if (!form.filePath || form.filePath.trim() === '') {
      throw new Error('No file path specified');
    }

    // Process the file path template
    const processedFilePath = processTemplate(form.filePath, vars);
    
    // Security check: prevent directory traversal
    const resolvedPath = path.resolve(processedFilePath);
    const allowedBasePath = process.cwd(); // Restrict to current working directory
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new Error('File path outside allowed directory');
    }

    console.log(`Reading file: ${resolvedPath}`);

    // Check file size if maxSize is specified
    if (form.maxSize) {
      const stats = await fs.stat(resolvedPath);
      if (stats.size > form.maxSize) {
        throw new Error(`File size (${stats.size} bytes) exceeds maximum allowed size (${form.maxSize} bytes)`);
      }
    }

    // Read file content
    let fileContent: string;
    const encoding = form.encoding || 'utf8';
    
    if (encoding === 'base64') {
      const buffer = await fs.readFile(resolvedPath);
      fileContent = buffer.toString('base64');
    } else if (encoding === 'binary') {
      const buffer = await fs.readFile(resolvedPath);
      fileContent = buffer.toString('binary');
    } else {
      fileContent = await fs.readFile(resolvedPath, 'utf8');
    }
    
    console.log(`File read completed: ${fileContent.length} characters`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, fileContent, 'fileread');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = fileContent;
      flowState.components[node.id]['type'] = 'fileread';
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
        type: 'fileread',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: fileContent,
      },
    };
  } catch (error: unknown) {
    console.error('File read error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown file read error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `File read failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'fileread',
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
