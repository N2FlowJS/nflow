import { prismaReadExecutor } from './executor';
import { FlowNode } from '@n2flowjs/flow';
import { FlowExecutionContext } from '@n2flowjs/flow/type';

/**
 * Backward-compatible wrapper for PrismaRead node execution
 */
export async function executePrismaReadNode(
  node: FlowNode,
  context: FlowExecutionContext
): Promise<any> {
  return await prismaReadExecutor.execute(node, context);
}

export default executePrismaReadNode;
