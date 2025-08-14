import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { DisplayNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

export async function executeDisplayNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as DisplayNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.content || '');
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input to display',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'display',
        role: 'assistant',
      },
      execution: {
        output: 'Waiting for content to display',
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

    const content = processTemplate(form.content || '', vars);
    
    // Format content based on output format
    let formattedContent = content;
    switch (form.outputFormat) {
      case 'json':
        try {
          formattedContent = JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          formattedContent = content;
        }
        break;
      case 'markdown':
      case 'html':
      case 'text':
      default:
        formattedContent = content;
        break;
    }

    const result = {
      content: formattedContent,
      format: form.outputFormat,
      showAsModal: form.showAsModal || false,
    };

    const resultText = JSON.stringify(result, null, 2);

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedContent, 'display');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = formattedContent;
      flowState.components[node.id]['type'] = 'display';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    return {
      status: nextNodes.length > 0 ? 'in_progress' : 'completed',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'display',
        role: 'assistant',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedContent,
      },
    };
  } catch (error: unknown) {
    console.error('Display execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown display error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Display operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'display',
        role: 'assistant',
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
