import { FlowNode } from "../../models/flowTypes";
import { FlowStateDispatcher } from "../@flow/flow-state-dispatcher";
import { ExecutionResult, FlowExecutionContext } from "../@flow/type";
export interface NodePluginConfig {
  enabled?: boolean;
  order?: number;      // canonical ordering key
  sort?: number;       // legacy key (mapped to order if order missing)
  [k: string]: any;    // allow future extension
}
export type NodePluginConfigMap = Record<string, NodePluginConfig>;

export interface LoaderOptions {
  rootDir?: string;    // base directory (defaults to process.cwd())
  filename?: string;   // primary filename (defaults to .nflow.json)
  packagesDir?: string;// override packages folder
}


export type Executor = (
  node: any,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
) => Promise<ExecutionResult>;


export type NodePlugin = {
  name: string;
  match: (node: FlowNode) => boolean;
  run: Executor;
};

