import { webhookExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for Webhook node execution
 */
export async function executeWebhookNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await webhookExecutor.execute(node, context);
}

export default executeWebhookNode;
