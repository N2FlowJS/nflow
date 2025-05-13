import { Edge, Node } from '@xyflow/react';
import React from 'react';

// Node types mapping
export const NODE_TYPES = {
  begin: 'begin',
  interface: 'interface',
  generate: 'generate',
  categorize: 'categorize',
  retrieval: 'retrieval',
  decision: 'decision',
} as const;
export type NodeTypeString = keyof typeof NODE_TYPES;

// Input/Output reference system - simplified for specific node types
export interface InputReference {
  sourceNodeId: string;
  id: string;
}

// Generic Base Node Data with form type parameter
export type BaseNodeData<TForm = unknown> = {
  label: string;
  id: string;
  position: { x: number; y: number };
  type: NodeTypeString;
  [key: string]: unknown;
  form: TForm;
  _lastUpdate?: number; // Add timestamp field for forcing re-renders
};

export interface BaseForm {
  name: string; // This field is essential for display and node identification
  description?: string; // Make these optional since not all nodes need them
  output?: string;
  role?: 'developer' | 'assistant' | 'system' | 'user';
  inputRefs?: InputReference[]; // Add support for input references
}

// Form types for each node
export interface BeginForm extends BaseForm {
  greeting: string;
  variables: {
    title: string;
    dataIndex: number;
    key: string;
  }[];
}

export interface InterfaceForm extends BaseForm {
  // No additional fields needed for Interface nodes as they just display previous output
  displayFormat?: 'text' | 'markdown' | 'html';
}

export interface GenerateForm extends BaseForm {
  prompt: string;
  model: string;
  // No input references here, only template variables
  templateVariables?: Record<string, string>;
}

export interface ICategory {
  name: string;
  description?: string;
  examples?: string[];
  targetNode?: string; // Add target node field
}

export interface CategorizeForm extends BaseForm {
  categories: ICategory[];
  defaultCategory: string;
  model: string;
}
export interface DecisionForm extends BaseForm {
  branches: DecisionBranch[];
  defaultTarget: string;
}

export interface RetrievalForm extends BaseForm {
  knowledgeIds: string[];
  maxResults: number;
  threshold: number;
}

// Specialized node data types
export type BeginNodeData = BaseNodeData<BeginForm> & {
  type: 'begin';
};

export type InterfaceNodeData = BaseNodeData<InterfaceForm> & {
  type: 'interface';
};

export type GenerateNodeData = BaseNodeData<GenerateForm> & {
  type: 'generate';
};

export type CategorizeNodeData = BaseNodeData<CategorizeForm> & {
  type: 'categorize';
};
export type DecisionNodeData = BaseNodeData<DecisionForm> & {
  type: 'decision';
};

export type RetrievalNodeData = BaseNodeData<RetrievalForm> & {
  type: 'retrieval';
};

export interface DecisionCondition {
  input: string;
  operator: string;
  value: string;
}

export interface ConditionGroup {
  conditions: DecisionCondition[];
  logicalOperator: 'AND' | 'OR';
}

export interface DecisionBranch {
  name: string;
  groups: ConditionGroup[];
  groupOperator: 'AND' | 'OR';
  targetNode?: string;
}

// Union type for all node data
export type NodeData =
  | BeginNodeData
  | InterfaceNodeData
  | GenerateNodeData
  | CategorizeNodeData
  | RetrievalNodeData
  | DecisionNodeData;

// Typed node instances
export type BeginNode = Node<BeginNodeData>;
export type InterfaceNode = Node<InterfaceNodeData>;
export type GenerateNode = Node<GenerateNodeData>;
export type CategorizeNode = Node<CategorizeNodeData>;
export type RetrievalNode = Node<RetrievalNodeData>;
export type DecisionNode = Node<DecisionNodeData>;

// Union type for all flow nodes
export type FlowNode = {
  type: NodeTypeString;
} & (BeginNode | InterfaceNode | GenerateNode | CategorizeNode | RetrievalNode | DecisionNode);

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
  color: {
    background: string;
    border: string;
    handle: string;
  };
  input: string; // Description of what input the node accepts
  output: string; // Description of what output the node produces
  references?: InputReference[]; // Optional references for input/output
  data: Partial<NodeData>;
}
