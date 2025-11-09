import { sendMailExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for SendMail node execution
 */
export async function executeSendMailNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await sendMailExecutor.execute(node, context);
}

export default executeSendMailNode;
