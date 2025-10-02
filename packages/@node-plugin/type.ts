// Core types for node plugin system

import { FlowStateDispatcher } from "@n2flowjs/flow/flow-state-dispatcher";
import { ExecutionResult, FlowExecutionContext, FlowNode } from "@n2flowjs/flow/type";

/**
 * Configuration options for a node plugin package
 */
export interface NodePluginConfig {
  enabled?: boolean;       // Whether the plugin is enabled
  order?: number;          // Canonical ordering key for plugin execution
  sort?: number;           // Legacy key (mapped to order if order missing)
  [k: string]: unknown;    // Allow future extension
}

/**
 * Map of package names to their configurations
 */
export type NodePluginConfigMap = Record<string, NodePluginConfig>;

/**
 * Executor function type for running node logic
 */
export type Executor = (
  node: FlowNode,
  context: FlowExecutionContext,
  callback?: (result: ExecutionResult) => void,
  dispatcher?: FlowStateDispatcher
) => Promise<ExecutionResult>;

/**
 * Node plugin definition
 */
export type NodePlugin = {
  name: string;
  match: (node: FlowNode) => boolean;
  run: Executor;
};

