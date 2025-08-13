import { TemplateNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext } from '../@flow/type';

export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as TemplateNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  const inputs: string[] = getInputFromTemplate(form.templateContent || '');
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for template variables',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'template',
        role: 'assistant',
      },
      execution: {
        output: 'Waiting for template variables',
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

    // Add flow variables to template context
    Object.keys(flowState.variables).forEach(key => {
      vars[key] = flowState.variables[key];
    });

    let renderedContent: string;
    const templateContent = form.templateContent || '';

    switch (form.templateEngine) {
      case 'simple':
      default:
        renderedContent = processTemplate(templateContent, vars);
        break;
        
      case 'handlebars':
        // For now, use simple template processing
        // In future, could integrate Handlebars.js
        renderedContent = processTemplate(templateContent, vars);
        break;
        
      case 'mustache':
        // For now, use simple template processing
        // In future, could integrate Mustache.js
        renderedContent = processTemplate(templateContent, vars);
        break;
    }

    // Format output based on specified format
    let formattedOutput = renderedContent;
    if (form.outputFormat === 'json') {
      try {
        const jsonData = JSON.parse(renderedContent);
        formattedOutput = JSON.stringify(jsonData, null, 2);
      } catch {
        // If not valid JSON, wrap in quotes
        formattedOutput = JSON.stringify(renderedContent, null, 2);
      }
    }

    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, formattedOutput, 'template');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      flowState.components[node.id]['output'] = formattedOutput;
      flowState.components[node.id]['type'] = 'template';
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
        type: 'template',
        role: 'assistant',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: formattedOutput,
      },
    };
  } catch (error: unknown) {
    console.error('Template execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown template error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Template rendering failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'template',
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
