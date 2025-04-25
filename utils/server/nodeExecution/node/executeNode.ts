import { isBeginNodeData, isInterfaceNodeData, isGenerateNodeData, isCategorizeNodeData, isRetrievalNodeData } from '@utils/client';
import { FlowExecutionContext, ExecutionResult } from '../../../../models/flowExecutionTypes';
import { executeBeginNode } from './executeBeginNode';
import { executeInterfaceNode } from './executeInterfaceNode';
import { executeGenerateNode } from './executeGenerateNode';
import { executeCategorizeNode } from './executeCategorizeNode';
import { executeRetrievalNode } from './executeRetrievalNode';

export async function executeNode(node: any, context: FlowExecutionContext, callback?: (result: ExecutionResult) => void): Promise<ExecutionResult> {
  if (isBeginNodeData(node.data)) {
    return await executeBeginNode(node, context);
  } else if (isInterfaceNodeData(node.data)) {
    return await executeInterfaceNode(node, context);
  } else if (isGenerateNodeData(node.data)) {
    return await executeGenerateNode(node, context, callback);
  } else if (isCategorizeNodeData(node.data)) {
    return await executeCategorizeNode(node, context, callback);
  } else if (isRetrievalNodeData(node.data)) {
    return await executeRetrievalNode(node, context);
  }

  throw new Error(`Unsupported node type: ${node.type}`);
}
