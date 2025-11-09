// Core types for node plugin system

import { FlowStateDispatcher } from "@n2flowjs/flow/flow-state-dispatcher";
import { FlowNode } from "@n2flowjs/flow/type";

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

// Legacy types for executeNode.ts (TODO: refactor executeNode.ts to use NodeDefinition)
export type Executor = (
  node: FlowNode,
  context: any,
  callback?: (result: any) => void,
  dispatcher?: FlowStateDispatcher
) => Promise<any>;

export type NodePlugin = {
  name: string;
  match: (node: FlowNode) => boolean;
  run: Executor;
};

// ============================================================================
// NODE ARCHITECTURE
// ============================================================================

import type { InputPort, OutputPort } from '../@flow/ports';

/**
 * Node categories for organization
 */
export enum NodeCategory {
  INPUT = 'input',
  OUTPUT = 'output',
  PROCESSING = 'processing',
  AI = 'ai',
  DATABASE = 'database',
  API = 'api',
  LOGIC = 'logic',
  TRANSFORM = 'transform',
  UTILITY = 'utility',
  CODE = 'code',
}

/**
 * Node execution context - new format with explicit inputs
 */
export interface NodeExecutionContext<TConfig = any> {
  node: FlowNode;
  config: TConfig;
  inputs: Record<string, any>;     // Input port values by port ID
  flowState: any;                  // Flow state (from @n2flowjs/flow)
  dispatcher?: FlowStateDispatcher;
}

/**
 * Node execution result - new format with explicit outputs
 */
export interface NodeExecutionResult {
  outputs: Record<string, any>;    // Output port values by port ID
  status: 'success' | 'error' | 'in_progress';
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Node executor function - new format
 */
export type NodeExecutor<TConfig = any> = (
  context: NodeExecutionContext<TConfig>
) => Promise<NodeExecutionResult>;

/**
 * Complete NodeDefinition interface
 * Defines structure, behavior, and UI for a node type
 */
export interface NodeDefinition<TConfig = any> {
  // Metadata
  id: string;
  name: string;
  category: NodeCategory;
  description: string;
  version: string;
  tags?: string[];  // Optional tags for search/filtering

  // Visual
  color?: string;
  icon?: string;

  // Port definitions
  // Static ports - always visible (also used for config UI)
  inputs: InputPort[];
  outputs: OutputPort[];

  // Dynamic ports (optional)
  // Generate dynamic input/output ports from config at runtime
  // Default values are taken from InputPort.defaultValue
  getDynamicInputs?: (config: TConfig) => InputPort[];  // Generate dynamic input ports from config
  getDynamicOutputs?: (config: TConfig) => OutputPort[]; // Generate dynamic output ports from config

  // Execution
  execute: NodeExecutor<TConfig>;
}
