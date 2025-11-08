import { webOpenExecutor } from './executor';
import type { FlowNode, FlowExecutionContext, FlowStateDispatcher, ExecutionResult } from '@n2flowjs/flow';

/**
 * Backward compatibility wrapper for web-open node execution
 */
export async function executeWebOpenNode(
  node: FlowNode,
  context: FlowExecutionContext,
  _callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  return webOpenExecutor.execute(node, context, dispatcher);
}

/**
 * Re-export cleanup function
 */
export { closeWebBrowser, getCurrentPage } from '../@node-plugin/base-browser-executor';
