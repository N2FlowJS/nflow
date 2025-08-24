// Core structural flow types extracted from flowTypes.ts to reduce coupling.
import { Edge, Node } from '@xyflow/react';
import React from 'react';
import { BaseNodeData, BaseForm, InputReference } from '@n2flowjs/flow';

// Open string brand allows dynamic plugin keys while preserving autocomplete for known ones elsewhere.
export type NodeTypeString = string & {};

// Generic plugin node data for dynamically loaded nodes (fallback shape)
export type PluginNodeData<TForm = Record<string, unknown>> = BaseNodeData<TForm> & { type: string };

// Structural fallback node data (no giant union) for generic UI/helpers that don't need per-node form typing.
export type AnyNodeData = BaseNodeData<any> & { type: NodeTypeString };
export type FlowNodeBase = Node<AnyNodeData>;

// Lightweight node configuration for registry usage
export interface NodeConfig {
  type: NodeTypeString;
  icon?: React.ReactNode;
  input: string;
  output: string;
  references?: InputReference[];
  data: Partial<AnyNodeData>;
}

export interface Flow {
  nodes: Node<any>[]; // intentionally widened to avoid tight coupling with full union
  edges: Edge[];
}

export type { BaseNodeData, BaseForm, InputReference };
