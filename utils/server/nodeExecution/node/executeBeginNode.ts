import { FlowNode, BeginNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { processTemplate } from '../../templateProcessor';
import { findNextNodes } from '../../../../utils/server/findNextNode';

/**
 * Handler for executing Begin nodes
 */
export async function executeBeginNode(node: FlowNode, { flow, flowState }: FlowExecutionContext): Promise<ExecutionResult> {
  const data = node.data as BeginNodeData;
  const form = data.form;
  const startTime = new Date().toISOString();
  const greeting = form.greeting || 'Hello!';
  const processedGreeting = processTemplate(greeting, flowState.variables);

  // Add any defined variables to the flow state
  if (Array.isArray(form.variables)) {
    form.variables.forEach((variable: {
      title: string;
      dataIndex: number;
      key: string;
    }) => {
      if (variable.title && !flowState.variables[variable.title]) {
        flowState.variables[variable.title] = variable.title || '';
      }
    });
  }

  flowState.components[node.id]['output'] = processedGreeting;
  flowState.components[node.id]['type'] = 'begin';
  flowState.components[node.id]['ready'] = true;
  flowState.currentNode = node;

  // Find the next node
  const nextNodes = findNextNodes(flow, node.id);

  if (nextNodes.length === 0) throw new Error(`Node ${node.data.label}  No next node found in the flow`);


  return {
    status: 'in_progress',
    nextNodes,
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
      startTime,
      endTime: new Date().toISOString(),
    },
  };
}
