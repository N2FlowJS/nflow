import { FlowComponent, FlowNode, FlowState } from "./type";


export type FlowStateAction =
  | { type: 'UPDATE_EXECUTION_TIME'; payload: { nodeId: string; executionTime: number } }
  | { type: 'SET_NODE_OUTPUT'; payload: { nodeId: string; output: string; nodeType: string } }
  | { type: 'SET_CURRENT_NODE'; payload: { node: FlowNode } }
  | { type: 'ADD_HISTORY'; payload: { nodeId: string; output: string; nodeType: string } }
  | { type: 'UPDATE_VARIABLES'; payload: Record<string, any> }
  | { type: 'SET_EXECUTION_TIME'; payload: number }
  | { type: 'PREPARE_STATE'; payload: FlowState };

export function flowStateReducer(state: FlowState, action: FlowStateAction): FlowState {
  switch (action.type) {
    case 'UPDATE_EXECUTION_TIME':
      return {
        ...state,
        components: {
          ...state.components,
          [action.payload.nodeId]: {
            ...state.components[action.payload.nodeId],
            executionTime: action.payload.executionTime,
          },
        },
      };

    case 'SET_NODE_OUTPUT':
      return {
        ...state,
        components: {
          ...state.components,
          [action.payload.nodeId]: {
            ...state.components[action.payload.nodeId],
            output: action.payload.output,
            type: action.payload.nodeType as FlowComponent['type'],
            executionTime: Date.now(),
          },
        },
      };

    case 'SET_CURRENT_NODE':
      return {
        ...state,
        currentNode: action.payload.node,
      };

    case 'ADD_HISTORY':
      return {
        ...state,
        history: [
          ...state.history,
          {
            nodeId: action.payload.nodeId,
            output: action.payload.output,
            timestamp: new Date().toISOString(),
            nodeType: action.payload.nodeType,
          },
        ],
      };

    case 'UPDATE_VARIABLES':
      return {
        ...state,
        variables: {
          ...state.variables,
          ...action.payload,
        },
      };

    case 'SET_EXECUTION_TIME':
      return {
        ...state,
        executionTime: action.payload,
      };

    case 'PREPARE_STATE':
      return {
        ...action.payload,
        executionTime: Date.now() - 10,
      };

    default:
      return state;
  }
}
