import { Edge, Node, NodeProps } from "@xyflow/react";
import { NODE_REGISTRY } from "../util/NODE_REGISTRY";

// Node types as string literal types
export type NodeTypeString =
  | "begin"
  | "interface"
  | "generate"
  | "categorize"
  | "retrieval";

// Node types mapping
export const NODE_TYPES = {
  begin: "begin",
  interface: "interface",
  generate: "generate",
  categorize: "categorize",
  retrieval: "retrieval",
  textUpdater: "textUpdater",
} as const;

// Generic Base Node Data with form type parameter
export type BaseNodeData<TForm = any> = {
  label: string;
  id: string;
  position: { x: number; y: number };
  type: NodeTypeString;
  [key: string]: unknown;
  form: TForm; // Remove optional marker
};

export interface BaseForm {
  name: string;
  description: string;
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

export interface InterfaceForm extends BaseForm {}

export interface GenerateForm extends BaseForm {
  prompt: string;
  model: string;
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
}

export interface RetrievalForm extends BaseForm {
  knowledgeIds: string[];
  maxResults: number;
}

// Specialized node data types
export type BeginNodeData = BaseNodeData<BeginForm> & {
  type: "begin";
};

export type InterfaceNodeData = BaseNodeData<InterfaceForm> & {
  type: "interface";
};

export type GenerateNodeData = BaseNodeData<GenerateForm> & {
  type: "generate";
};

export type CategorizeNodeData = BaseNodeData<CategorizeForm> & {
  type: "categorize";
};

export type RetrievalNodeData = BaseNodeData<RetrievalForm> & {
  type: "retrieval";
};

// Union type for all node data
export type NodeData =
  | BeginNodeData
  | InterfaceNodeData
  | GenerateNodeData
  | CategorizeNodeData
  | RetrievalNodeData;

// Typed node instances
export type BeginNode = Node<BeginNodeData>;
export type InterfaceNode = Node<InterfaceNodeData>;
export type GenerateNode = Node<GenerateNodeData>;
export type CategorizeNode = Node<CategorizeNodeData>;
export type RetrievalNode = Node<RetrievalNodeData>;

// Union type for all flow nodes
export type FlowNode =
  | BeginNode
  | InterfaceNode
  | GenerateNode
  | CategorizeNode
  | RetrievalNode;

// Type for a complete flow
export interface Flow {
  nodes: FlowNode[];
  edges: Edge[];
}

// Node form field configuration
export interface NodeFormField {
  name: string;
  label: string;
  type: "input" | "textarea" | "select" | "number" | "tags";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  rows?: number;
}

// Node configuration
export interface NodeConfig {
  type: NodeTypeString;
  label: string;
  description: string;
  color: {
    background: string;
    border: string;
    handle: string;
  };
  defaultData: Partial<NodeData>;
}

// Helper function to create correctly typed node data
export function createNodeData(type: NodeTypeString, label: string): NodeData {
  const config = NODE_REGISTRY[type];

  // Ensure form is properly initialized
  const defaultData = {
    ...config.defaultData,
    type,
    label,
    form: config.defaultData.form || {}, // Always provide a form object
  };

  return defaultData as NodeData;
}
