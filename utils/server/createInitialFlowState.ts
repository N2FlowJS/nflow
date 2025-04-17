import { BeginNode } from '@components/agent/types/flowTypes';
import { FlowState } from '../../types/flowExecutionTypes';

// Create an initial flow state
export function createInitialFlowState(beginNode: BeginNode, variables?: Record<string, any>): FlowState {
  return {
    currentNodeId: beginNode.id,
    variables: variables || {},
    components: {},
    history: [],
    completed: false,
  };
}
