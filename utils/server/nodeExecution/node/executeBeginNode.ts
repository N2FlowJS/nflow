import { FlowNode, BeginNodeData } from '../../../../models/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { processTemplate } from '../../templateProcessor';
import { findNextNodes } from '../../../../utils/server/findNextNode';
import { FlowStateDispatcher } from '../flowStateDispatcher';

/**
 * Handler for executing Begin nodes
 */
export async function executeBeginNode(node: FlowNode, { flow, flowState }: FlowExecutionContext, dispatcher?: FlowStateDispatcher): Promise<ExecutionResult> {
  const data = node.data as BeginNodeData;
  const form = data.form;
  const startTime = new Date().toISOString();
  const greeting = form.greeting || 'Hello!';
  
  const processedGreeting = processTemplate(greeting, flowState.variables);

  // Use shared dispatcher if available, otherwise create local state
  let finalState = flowState;
  
  if (dispatcher) {
    // Update variables using shared dispatcher
    if (Array.isArray(form.variables)) {
      const newVariables: Record<string, any> = {};
      form.variables.forEach((variable: {
        title: string;
        dataIndex: number;
        key: string;
      }) => {
        if (variable.title && !flowState.variables[variable.title]) {
          newVariables[variable.title] = variable.title || '';
        }
      });
      
      if (Object.keys(newVariables).length > 0) {
        dispatcher.updateVariables(newVariables);
      }
    }

    // Update node output and current node using shared dispatcher
    dispatcher.setNodeOutput(node.id, processedGreeting, 'begin');
    dispatcher.setCurrentNode(node);
    finalState = dispatcher.getState();
  }

  const nextNodes = findNextNodes(flow, node.id);

  if (nextNodes.length === 0) throw new Error(`Node ${node.data.label}  No next node found in the flow`);

  return {
    status: 'in_progress',
    nextNodes,
    flowState: finalState,
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
