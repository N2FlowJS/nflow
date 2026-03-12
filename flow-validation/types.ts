import type { Edge, Node } from '@xyflow/react';
import type { CustomNodeType } from '../types';

export type FlowValidationIssue = {
  level: 'error' | 'warning';
  nodeId?: string;
  fieldName?: string;
  message: string;
};

export type ValidationContext = {
  nodes: Node[];
  edges: Edge[];
  nodeMap: Map<string, CustomNodeType>;
};

export type NodeValidator = (
  node: CustomNodeType,
  context: ValidationContext,
) => FlowValidationIssue[];
