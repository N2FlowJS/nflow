import { isBeginNodeData, isInterfaceNodeData, isGenerateNodeData, isCategorizeNodeData, isRetrievalNodeData } from '@components/agent/util';
import { executeBeginNode, executeInterfaceNode, executeGenerateNode, executeCategorizeNode, executeRetrievalNode } from '@utils/server/nodeHandlers';
import { FlowExecutionContext, ExecutionResult } from '../../types/flowExecutionTypes';

export async function executeNode(node: any, context: FlowExecutionContext): Promise<ExecutionResult> {
  if (isBeginNodeData(node.data)) {
    return await executeBeginNode(node, context);
  } else if (isInterfaceNodeData(node.data)) {
    return await executeInterfaceNode(node, context);
  } else if (isGenerateNodeData(node.data)) {
    return await executeGenerateNode(node, context);
  } else if (isCategorizeNodeData(node.data)) {
    return await executeCategorizeNode(node, context);
  } else if (isRetrievalNodeData(node.data)) {
    return await executeRetrievalNode(node, context);
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
