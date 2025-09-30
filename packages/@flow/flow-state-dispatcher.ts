import { flowStateReducer, FlowStateAction } from './flow-state-reducer';
import { FlowState } from './type';

export class FlowStateDispatcher {
  private state: FlowState;

  constructor(initialState: FlowState) {
    this.state = initialState;
  }

  dispatch(action: FlowStateAction): FlowState {
    this.state = flowStateReducer(this.state, action);
    return this.state;
  }

  getState(): FlowState {
    return this.state;
  }

  // Helper methods for common actions
  updateExecutionTime(nodeId: string, executionTime: number): FlowState {
    return this.dispatch({
      type: 'UPDATE_EXECUTION_TIME',
      payload: { nodeId, executionTime },
    });
  }

  setNodeOutput(nodeId: string, output: any, nodeType: string): FlowState {
    return this.dispatch({
      type: 'SET_NODE_OUTPUT',
      payload: { nodeId, output, nodeType },
    });
  }

  setCurrentNode(node: any): FlowState {
    return this.dispatch({
      type: 'SET_CURRENT_NODE',
      payload: { node },
    });
  }

  addHistory(nodeId: string, output: string, nodeType: string): FlowState {
    return this.dispatch({
      type: 'ADD_HISTORY',
      payload: { nodeId, output, nodeType },
    });
  }

  updateVariables(variables: Record<string, any>): FlowState {
    return this.dispatch({
      type: 'UPDATE_VARIABLES',
      payload: variables,
    });
  }

  setExecutionTime(executionTime: number): FlowState {
    return this.dispatch({
      type: 'SET_EXECUTION_TIME',
      payload: executionTime,
    });
  }

  prepareState(): FlowState {
    return this.dispatch({
      type: 'PREPARE_STATE',
      payload: this.state,
    });
  }
}
