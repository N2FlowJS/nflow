import { Edge } from '@xyflow/react';
import React from 'react';
import { BaseForm, BaseNodeData, InputReference } from '@n2flowjs/flow';

import type { AllNodeData, FlowNode } from './nodeDataMap';
import { getDynamicNodeTypeKeys } from 'packages/@node-plugin';
export type { FlowNode } from './nodeDataMap';

// Node types mapping
// Always include core built-ins, then merge dynamic keys from @node-plugin on the server.
const STATIC_NODE_TYPES = {
  begin: 'begin',
  interface: 'interface',
  generate: 'generate',
} as const;

const DYNAMIC_KEYS = (() => {
  try {
    return getDynamicNodeTypeKeys();
  } catch {
    return [] as string[];
  }
})();

export const NODE_TYPES = Object.freeze(
  DYNAMIC_KEYS.reduce((acc, k) => {
    (acc as Record<string, string>)[k] = k;
    return acc;
  }, { ...STATIC_NODE_TYPES } as Record<string, string>)
);
// Allow dynamic plugin node types while preserving autocomplete for built-ins
export type NodeTypeString = string & {};

// Generic plugin node data type retained (legacy support for dynamically loaded plugins)
export type PluginNodeData<TForm = Record<string, unknown>> = BaseNodeData<TForm> & { type: string };

export type NodeDataWithForm<TForm> = BaseNodeData<TForm> & {
  type: NodeTypeString;
};


// NodeData now sourced from generated union (AllNodeData) to reduce manual maintenance.
export type NodeData = AllNodeData;

// Helper type to extract specific node data
export type ExtractNodeData<T extends NodeTypeString> = Extract<NodeData, { type: T }>;

// Typed node instances

// FlowNode exported by generated file.

// Type for a complete flow
export interface Flow {
  nodes: FlowNode[];
  edges: Edge[];
}

// Node form field configuration
export interface NodeFormField {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'number' | 'tags';
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  rows?: number;
}

// Node configuration
export interface NodeConfig {
  type: NodeTypeString;
  icon?: React.ReactNode;
  input: string; // Description of what input the node accepts
  output: string; // Description of what output the node produces
  references?: InputReference[]; // Optional references for input/output
  data: Partial<NodeData>;
}

export interface JiraForm extends BaseForm {
  name: string;
  description?: string;
  action: 'create_issue' | 'update_issue' | 'get_issue' | 'search_issues' | 'add_comment';
  serverUrl: string;
  username: string;
  apiToken: string;
  projectKey?: string;
  issueType?: string;
  summary?: string;
  issueKey?: string;
  jql?: string;
  assignee?: string;
  priority?: string;
  comment?: string;
}
