import {
  isBeginNodeData,
  isInterfaceNodeData,
  isGenerateNodeData,
  isCategorizeNodeData,
  isDecisionNodeData,
  isRetrievalNodeData,
  isKeywordsNodeData,
  isExecMysqlNodeData,
  isExecMssqlNodeData,
  isSubAgentNodeData,
  isSendMailNodeData,
  isGoogleSearchNodeData,
  isWikipediaSearchNodeData,
  isRewriteNodeData,
  isHttpRequestNodeData,
  isTransformNodeData,
  isDelayNodeData,
  isFileReadNodeData,
  isFileWriteNodeData,
  isJsonParseNodeData,
  isMathNodeData,
  isValidateNodeData,
  isTextProcessNodeData,
  isConditionNodeData,
  isMattermostNodeData,
  isSlackNodeData,
  isJiraNodeData,
  isGitLabNodeData,
} from '../../../client/isNode';
import { FlowExecutionContext, ExecutionResult } from '../../../../models/flowExecutionTypes';
import { executeBeginNode } from './executeBeginNode';
import { executeInterfaceNode } from './executeInterfaceNode';
import { executeGenerateNode } from './executeGenerateNode';
import { executeCategorizeNode } from './executeCategorizeNode';
import { executeRetrievalNode } from './executeRetrievalNode';
import { executeDecisionNode } from './executeDecisionNode';
import { FlowStateDispatcher } from '../flowStateDispatcher';
import { executeKeywordsNode } from './executeKeywordsNode';
import { executeExecMysqlNode } from './executeExecMysqlNode';
import { executeExecMssqlNode } from './executeExecMssqlNode';
import { executeSubAgentNode } from './executeSubAgentNode';
import { executeSendMailNode } from './executeSendMailNode';
import { executeGoogleSearchNode } from './executeGoogleSearchNode';
import { executeWikipediaSearchNode } from './executeWikipediaSearchNode';
import { executeRewriteNode } from './executeRewriteNode';
import { executeHttpRequestNode } from './executeHttpRequestNode';
import { executeTransformNode } from './executeTransformNode';
import { executeDelayNode } from './executeDelayNode';
import { executeFileReadNode } from './executeFileReadNode';
import { executeFileWriteNode } from './executeFileWriteNode';
import { executeJsonParseNode } from './executeJsonParseNode';
import { executeMathNode } from './executeMathNode';
import { executeValidateNode } from './executeValidateNode';
import { executeTextProcessNode } from './executeTextProcessNode';
import { executeConditionNode } from './executeConditionNode';
import { executeMattermostNode } from './executeMattermostNode';
import { executeSlackNode } from './executeSlackNode';
import { executeJiraNode } from './executeJiraNode';
import { executeGitLabNode } from './executeGitLabNode';

export async function executeNode(
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
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
  } else if (isKeywordsNodeData(node.data)) {
    return await executeKeywordsNode(node, context, callback, dispatcher);
  } else if (isExecMysqlNodeData(node.data)) {
    return await executeExecMysqlNode(node, context, dispatcher);
  } else if (isExecMssqlNodeData(node.data)) {
    return await executeExecMssqlNode(node, context, dispatcher);
  } else if (isSubAgentNodeData(node.data)) {
    return await executeSubAgentNode(node, context, dispatcher);
  } else if (isSendMailNodeData(node.data)) {
    return await executeSendMailNode(node, context, dispatcher);
  } else if (isGoogleSearchNodeData(node.data)) {
    return await executeGoogleSearchNode(node, context, dispatcher);
  } else if (isWikipediaSearchNodeData(node.data)) {
    return await executeWikipediaSearchNode(node, context, dispatcher);
  } else if (isRewriteNodeData(node.data)) {
    return await executeRewriteNode(node, context, callback, dispatcher);
  } else if (isHttpRequestNodeData(node.data)) {
    return await executeHttpRequestNode(node, context, dispatcher);
  } else if (isTransformNodeData(node.data)) {
    return await executeTransformNode(node, context, dispatcher);
  } else if (isDelayNodeData(node.data)) {
    return await executeDelayNode(node, context, dispatcher);
  } else if (isFileReadNodeData(node.data)) {
    return await executeFileReadNode(node, context, dispatcher);
  } else if (isFileWriteNodeData(node.data)) {
    return await executeFileWriteNode(node, context, dispatcher);
  } else if (isJsonParseNodeData(node.data)) {
    return await executeJsonParseNode(node, context, dispatcher);
  } else if (isMathNodeData(node.data)) {
    return await executeMathNode(node, context, dispatcher);
  } else if (isValidateNodeData(node.data)) {
    return await executeValidateNode(node, context, dispatcher);
  } else if (isTextProcessNodeData(node.data)) {
    return await executeTextProcessNode(node, context, dispatcher);
  } else if (isConditionNodeData(node.data)) {
    return await executeConditionNode(node, context, dispatcher);
  } else if (isMattermostNodeData(node.data)) {
    return await executeMattermostNode(node, context, dispatcher);
  } else if (isSlackNodeData(node.data)) {
    return await executeSlackNode(node, context, dispatcher);
  } else if (isJiraNodeData(node.data)) {
    return await executeJiraNode(node, context, dispatcher);
  } else if (isGitLabNodeData(node.data)) {
    return await executeGitLabNode(node, context, dispatcher);
  }
  throw new Error(`Unsupported node type: ${node.type}`);
}
