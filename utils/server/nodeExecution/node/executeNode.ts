import { isBeginNodeData, isInterfaceNodeData, isGenerateNodeData, isCategorizeNodeData, isDecisionNodeData, isRetrievalNodeData } from '../../../../utils/client';
import { FlowExecutionContext, ExecutionResult } from '../../../../models/flowExecutionTypes';
import { executeBeginNode } from './executeBeginNode';
import { executeInterfaceNode } from './executeInterfaceNode';
import { executeGenerateNode } from './executeGenerateNode';
import { executeCategorizeNode } from './executeCategorizeNode';
import { executeRetrievalNode } from './executeRetrievalNode';
import { executeDecisionNode } from './executeDecisionNode';
import { FlowStateDispatcher } from '../flowStateDispatcher';

export async function executeNode(node: any, context: FlowExecutionContext, callback?: (result: ExecutionResult) => void, dispatcher?: FlowStateDispatcher): Promise<ExecutionResult> {
  if (isBeginNodeData(node.data)) {
    return await executeBeginNode(node, context, dispatcher);
  } else if (isInterfaceNodeData(node.data)) {
    return await executeInterfaceNode(node, context, dispatcher);
  } else if (isGenerateNodeData(node.data)) {
    return await executeGenerateNode(node, context, callback, dispatcher);
  } else if (isCategorizeNodeData(node.data)) {
    return await executeCategorizeNode(node, context, dispatcher);
  } else if (isRetrievalNodeData(node.data)) {
    return await executeRetrievalNode(node, context, dispatcher);
  } else if (isDecisionNodeData(node.data)) {
    return await executeDecisionNode(node, context, dispatcher);
  }
  throw new Error(`Unsupported node type: ${node.type}`);
}
