import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { ImageAnalysisNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Handler for executing Image Analysis nodes
 */
export async function executeImageAnalysisNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ImageAnalysisNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from image path
  const inputs: string[] = [
    ...getInputFromTemplate(form.imagePath || ''),
  ];

  const ready = isNodeReady(inputs, flowState);

  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for image analysis',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'imageanalysis',
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
    console.log(`Executing Image Analysis node: ${node.id} with analysis type: ${form.analysisType}`);

    const imagePath = processTemplate(form.imagePath || '', vars);
    
    if (!imagePath) {
      throw new Error('Image path is required for image analysis');
    }

    let result: any;

    switch (form.analysisType) {
      case 'metadata':
        result = await getImageMetadata(imagePath);
        break;
      case 'dimensions':
        result = await getImageDimensions(imagePath);
        break;
      case 'colors':
        result = await analyzeImageColors(imagePath, form.colorPalette || 5);
        break;
      default:
        throw new Error(`Unsupported image analysis type: ${form.analysisType}`);
    }

    const resultText = JSON.stringify(result, null, 2);

    console.log(`Image Analysis node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'imageanalysis');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'imageanalysis';
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
        type: 'imageanalysis',
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
    console.error('Image analysis execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown image analysis error';

    return {
      nextNodes: [],
      status: 'error',
      message: `Image analysis failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'imageanalysis',
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

async function getImageMetadata(imagePath: string) {
  const stats = await fs.promises.stat(imagePath);
  const extension = path.extname(imagePath).toLowerCase();
  
  return {
    path: imagePath,
    size: stats.size,
    extension: extension,
    format: extension.substring(1),
    created: stats.birthtime,
    modified: stats.mtime,
    basename: path.basename(imagePath),
  };
}

async function getImageDimensions(imagePath: string) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like sharp or jimp
  const stats = await fs.promises.stat(imagePath);
  
  return {
    path: imagePath,
    fileSize: stats.size,
    // Note: Actual width/height would require image processing library
    note: 'Image dimension analysis requires additional image processing libraries',
  };
}

async function analyzeImageColors(imagePath: string, colorCount: number) {
  // This is a simplified implementation
  // In a real scenario, you'd use a library like sharp or color-thief
  const stats = await fs.promises.stat(imagePath);
  
  return {
    path: imagePath,
    requestedColors: colorCount,
    fileSize: stats.size,
    note: 'Color analysis requires additional image processing libraries',
  };
}
