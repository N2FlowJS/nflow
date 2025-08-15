// We intentionally do NOT depend on the concrete FlowNode union here because
// plugins may introduce new node type strings that are not yet reflected in
// the core FlowNode discriminated union. Using the full union caused TS2367
// (no overlap) errors when match predicates compare against new strings
// (e.g. 'file-read', 'http-request'). Keep this minimal structural type.
import type { FlowNode } from "../../models/flowTypes";
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
  /** canonical node type name (string identifier) */
  name: string;
  /**
   * Predicate to determine if this plugin should execute for a given node.
   * Accept a very loose shape to allow dynamic plugin node types that are
   * not (yet) part of the FlowNode union without producing TS2367 errors.
   */
  match: (node: Partial<FlowNode> | { data?: { type?: string } } | any) => boolean;
  /** executor implementation */
  run: Executor;
};

