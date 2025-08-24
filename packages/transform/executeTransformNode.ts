import { FlowNode } from '../../models/flowTypes';
import { TransformNodeData } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template-processor/templateProcessor';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

/**
 * Handler for executing Transform nodes
 */
export async function executeTransformNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TransformNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from input data template
  const inputs: string[] = getInputFromTemplate(form.inputData || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input data to transform',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'transform',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input data',
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
    if (!form.inputData || form.inputData.trim() === '') {
      throw new Error('No input data specified for transformation');
    }

    if (!form.transformation || form.transformation.trim() === '') {
      throw new Error('No transformation logic specified');
    }

    // Process the input data template
    const processedInputData = processTemplate(form.inputData, vars);
    
    console.log(`Executing Transform node: ${node.id} with data: ${processedInputData}`);

    // Parse input data based on type
    let parsedData: any;
    try {
      switch (form.transformType) {
        case 'json':
        case 'array':
        case 'object':
          parsedData = JSON.parse(processedInputData);
          break;
        case 'text':
        default:
          parsedData = processedInputData;
          break;
      }
    } catch (parseError) {
      throw new Error(`Failed to parse input data as ${form.transformType}: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
    }

    // Create a safe execution environment
    const safeGlobals = {
      // Safe JavaScript functions
      JSON,
      Object,
      Array,
      String,
      Number,
      Boolean,
      Math,
      Date,
      RegExp,
      // Utility functions
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
    };

    // Create the transformation function
    let transformedData: any;
    try {
      // Wrap the transformation in a function to provide safe execution
      const transformFunction = new Function(
        'data',
        ...Object.keys(safeGlobals),
        `"use strict"; return (${form.transformation});`
      );

      // Execute the transformation
      transformedData = transformFunction(parsedData, ...Object.values(safeGlobals));
    } catch (transformError) {
      throw new Error(`Transformation failed: ${transformError instanceof Error ? transformError.message : 'Transform error'}`);
    }

    // Convert result to string
    let resultText: string;
    try {
      if (typeof transformedData === 'string') {
        resultText = transformedData;
      } else {
        resultText = JSON.stringify(transformedData, null, 2);
      }
    } catch (serializeError) {
      resultText = String(transformedData);
    }
    
    console.log(`Transform node completed: ${resultText.substring(0, 100)}...`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'transform');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'transform';
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
        type: 'transform',
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
    console.error('Transform execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown transform error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Transform failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'transform',
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
