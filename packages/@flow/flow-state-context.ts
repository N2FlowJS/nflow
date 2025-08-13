import { flowStateReducer, FlowStateAction } from './flow-state-reducer';
import { FlowState } from './type';

export class FlowStateManager {
  private state: FlowState;
  private dispatch: (action: FlowStateAction) => void;

  constructor(initialState: FlowState) {
    this.state = initialState;
    this.dispatch = (action: FlowStateAction) => {
      this.state = flowStateReducer(this.state, action);
    };
  }

  getState(): FlowState {
    return this.state;
  }

  updateExecutionTime(nodeId: string, executionTime: number): void {
    this.dispatch({
      type: 'UPDATE_EXECUTION_TIME',
      payload: { nodeId, executionTime },
    });
  }

  setNodeOutput(nodeId: string, output: string, nodeType: string): void {
    this.dispatch({
      type: 'SET_NODE_OUTPUT',
      payload: { nodeId, output, nodeType },
    });
  }

  setCurrentNode(node: any): void {
    this.dispatch({
      type: 'SET_CURRENT_NODE',
      payload: { node },
    });
  }

  addHistory(nodeId: string, output: string, nodeType: string): void {
    this.dispatch({
      type: 'ADD_HISTORY',
      payload: { nodeId, output, nodeType },
    });
  }

  updateVariables(variables: Record<string, any>): void {
    this.dispatch({
      type: 'UPDATE_VARIABLES',
      payload: variables,
    });
  }

  setExecutionTime(executionTime: number): void {
    this.dispatch({
      type: 'SET_EXECUTION_TIME',
      payload: executionTime,
    });
  }
}
