import { FlowNode } from '../../models/flowTypes';
import { FileWriteNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Handler for executing File Write nodes
 */
export async function executeFileWriteNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as FileWriteNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from file path and content templates
  const inputs: string[] = [
    ...getInputFromTemplate(form.filePath || ''),
    ...getInputFromTemplate(form.content || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for file write',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'filewrite',
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

    if (!form.content && form.content !== '') {
      throw new Error('No content specified for file write');
    }

    // Process templates
    const processedFilePath = processTemplate(form.filePath, vars);
    const processedContent = processTemplate(form.content || '', vars);
    
    // Security check: prevent directory traversal
    const resolvedPath = path.resolve(processedFilePath);
    const allowedBasePath = process.cwd(); // Restrict to current working directory
    if (!resolvedPath.startsWith(allowedBasePath)) {
      throw new Error('File path outside allowed directory');
    }

    // Check if file exists and overwrite setting
    if (!form.overwrite) {
      try {
        await fs.access(resolvedPath);
        throw new Error('File already exists and overwrite is disabled');
      } catch (accessError: any) {
        // File doesn't exist, which is good if overwrite is false
        if (accessError.code !== 'ENOENT') {
          throw accessError;
        }
      }
    }

    console.log(`Writing file: ${resolvedPath}`);

    // Ensure directory exists
    const dirPath = path.dirname(resolvedPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Write file content
    const encoding = form.encoding || 'utf8';
    
    if (encoding === 'base64') {
      const buffer = Buffer.from(processedContent, 'base64');
      await fs.writeFile(resolvedPath, buffer);
    } else if (encoding === 'binary') {
      const buffer = Buffer.from(processedContent, 'binary');
      await fs.writeFile(resolvedPath, buffer);
    } else {
      await fs.writeFile(resolvedPath, processedContent, 'utf8');
    }

    const resultText = `File written successfully: ${resolvedPath} (${processedContent.length} ${encoding === 'utf8' ? 'characters' : 'bytes'})`;
    
    console.log(resultText);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'filewrite');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'filewrite';
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
        type: 'filewrite',
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
    console.error('File write error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown file write error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `File write failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'filewrite',
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
