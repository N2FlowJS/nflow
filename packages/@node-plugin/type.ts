import { FlowStateDispatcher } from "../@flow/flow-state-dispatcher";
import { ExecutionResult, FlowExecutionContext } from "../@flow/type";

export type Executor = (
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
) => Promise<ExecutionResult>;


export type NodePlugin = {
  name: string;
  match: (node: any) => boolean;
  run: Executor;
};
