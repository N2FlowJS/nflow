import { FlowNode, BeginNodeData } from '../../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../types/flowExecutionTypes';
import { processTemplate } from '../templateProcessor';
import { findNextNode } from '@utils/server/findNextNode';

/**
 * Handler for executing Begin nodes
 */
export async function executeBeginNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as BeginNodeData;
  const form = data.form;

  const greeting = form.greeting || 'Hello!';
  const processedGreeting = processTemplate(greeting, flowState.variables);

  // Add any defined variables to the flow state
  if (Array.isArray(form.variables)) {
    form.variables.forEach((variable) => {
      if (variable.title && !flowState.variables[variable.title]) {
        flowState.variables[variable.title] = variable.title || '';
      }
    });
  }

  if (!flowState.components[node.id]) flowState.components[node.id] = {};
  flowState.components[node.id]['output'] = processedGreeting;
  flowState.components[node.id]['type'] = 'begin';

  // Find the next node
  const nextNodeId = findNextNode(flow, node.id);

  if (!nextNodeId) throw new Error(`Node ${node.data.label}  No next node found in the flow`);

  return {
    status: 'in_progress',
    nextNodeId,
    flowState,
    nodeInfo: {
      id: node.id,
      name: form.name || node.id,
      type: 'begin',
      role: 'system',
    },
    execution: {
      output: processedGreeting,
      nodeId: node.id,
      nodeName: form.name || node.id,
      startTime: new Date().toISOString(),
    },
  };
}
