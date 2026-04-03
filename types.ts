import { Node, Edge } from '@xyflow/react';

export type NodeData = {
  label: string;
  type: string;
  description?: string;
  status?: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
  lastInput?: any;
  lastOutput?: any;
  configSchema?: {
    label: string;
    name: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
    options?: string[];
    value?: string | number | boolean;
    hidden?: boolean;
  }[];
};

export type CustomNodeType = Node<NodeData>;
export type CustomEdgeType = Edge;