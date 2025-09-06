import { LoopNodeData, FlowNode } from '../../models/flowTypes';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { findNextNodes, isNodeReady, FlowStateDispatcher, ExecutionResult, FlowExecutionContext } from '@n2flowjs/flow';

export async function executeLoopNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as LoopNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.inputData || '');
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input data for loop operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'loop',
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

  try {
    const vars: Record<string, string> = {};
    inputs.forEach((key) => {
      if (flowState.components[key] !== undefined) {
        vars[key] = flowState.components[key].output || '';
      }
    });

    const inputDataString = processTemplate(form.inputData || '', vars);
    let loopData: any;

    try {
      loopData = JSON.parse(inputDataString);
    } catch {
      loopData = inputDataString.split(',').map(item => item.trim());
    }

    const maxIterations = form.maxIterations || 100;
    const results: any[] = [];
    let iterations = 0;

    switch (form.loopType) {
      case 'array':
        if (Array.isArray(loopData)) {
          for (let i = 0; i < Math.min(loopData.length, maxIterations); i++) {
            results.push({
              [form.currentIndexVariable]: i,
              [form.currentItemVariable]: loopData[i],
              iteration: i + 1
            });
            iterations++;
          }
        }
        break;

      case 'object':
        if (typeof loopData === 'object' && loopData !== null) {
          const keys = Object.keys(loopData);
          for (let i = 0; i < Math.min(keys.length, maxIterations); i++) {
            const key = keys[i];
            results.push({
              [form.currentIndexVariable]: i,
              [form.currentItemVariable]: { key, value: loopData[key] },
              iteration: i + 1
            });
            iterations++;
          }
        }
        break;

      case 'range':
        const start = form.startIndex || 0;
        const end = form.endIndex || 10;
        const step = form.stepSize || 1;
        for (let i = start; i < Math.min(end, start + maxIterations); i += step) {
          results.push({
            [form.currentIndexVariable]: i,
            [form.currentItemVariable]: i,
            iteration: iterations + 1
          });
          iterations++;
        }
        break;
    }

    const resultText = JSON.stringify({
      iterations: iterations,
      results: results,
      completed: true
    }, null, 2);

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'loop');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'loop';
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
        type: 'loop',
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
    console.error('Loop execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown loop error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Loop operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'loop',
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
