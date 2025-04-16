import { FlowNode, BeginNodeData } from '../../components/agent/types/flowTypes';
import { ExecutionResult, FlowExecutionContext } from '../../types/flowExecutionTypes';
import { processTemplate } from '../../pages/api/flows/until/templateProcessor';
import { findNextNode } from '../../pages/api/flows/until/flowExecutionService';

/**
 * Handler for executing Begin nodes
 */
export async function executeBeginNode(node: FlowNode, context: FlowExecutionContext): Promise<ExecutionResult> {
  const { flow, flowState } = context;
  const data = node.data as BeginNodeData;
  const form = data.form;

  // Process greeting message
  const greeting = form.greeting || 'Hello!';
  const processedGreeting = processTemplate(greeting, flowState.variables);

  // Add any defined variables to the flow state
  if (Array.isArray(form.variables)) {
    form.variables.forEach((variable) => {
      if (variable.title && !flowState.variables[variable.title]) {
        // Set initial value from defaultValue or empty string instead of using the title
        flowState.variables[variable.title] = variable.title || '';
      }
    });
  }

  // Store the greeting in a specific variable for later use
  flowState.variables.initialGreeting = processedGreeting;

  // Add to history for context tracking
  flowState.history.push({
    nodeId: node.id,
    nodeType: 'begin',
    output: processedGreeting,
    timestamp: new Date().toISOString(),
    status: 'success',
  });

  // Find the next node
  const nextNodeId = findNextNode(flow, node.id);

  if (!nextNodeId) {
    return {
      status: 'completed',
      output: processedGreeting,
      flowState,
    };
  }

  return {
    status: 'in_progress',
    output: processedGreeting,
    nextNodeId,
    flowState,
  };
}
