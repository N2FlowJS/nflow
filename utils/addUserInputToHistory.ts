import { NODE_TYPES } from '@utils/NODE_TYPES';
import { FlowState } from '../types/flowExecutionTypes';

// Add user input to flow history
export function addUserInputToHistory(flowState: FlowState, userInput: string): void {
  flowState.history.push({
    nodeId: 'user-input' + new Date().getTime(),
    nodeType: NODE_TYPES.USER,
    input: userInput,
    timestamp: new Date().toISOString(),
  });
}
