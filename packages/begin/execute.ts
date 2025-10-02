import { findNextNodes } from '../@flow/find-next-node';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';
import { ExecutionResult, FlowExecutionContext, FlowNode } from '../@flow/type';
import { BeginNodeData } from './types';

/**
 * Handler for executing Begin nodes
 */
export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as BeginNodeData;
  const form = data.form;
  const startTime = new Date().toISOString();

  let finalState = flowState;

  if (dispatcher) {
    // Update variables using shared dispatcher
    if (Array.isArray(form.variables)) {
      const newVariables: Record<string, any> = {};
      form.variables.forEach((variable: { title: string; dataIndex: number; key: string }) => {
        if (variable.title && !flowState.variables[variable.title]) {
          newVariables[variable.title] = variable.title || '';
        }
      });

      if (Object.keys(newVariables).length > 0) {
        dispatcher.updateVariables(newVariables);
      }
    }

    // Update node output and current node using shared dispatcher
    dispatcher.setNodeOutput(node.id, '', 'begin');
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
      output: "",
      nodeId: node.id,
      nodeName: form.name || node.id,
      startTime,
      endTime: new Date().toISOString(),
    },
  };
}
