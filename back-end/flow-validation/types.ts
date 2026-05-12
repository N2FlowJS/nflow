import type { Edge, Node } from '@xyflow/react';
import type { CustomNodeType, FlowValidationIssue } from '@n2flow/types';

export type { FlowValidationIssue };

export type ValidationContext = {
  nodes: Node[];
  edges: Edge[];
  nodeMap: Map<string, CustomNodeType>;
};

export type NodeValidator = (
  node: CustomNodeType,
  context: ValidationContext,
) => FlowValidationIssue[];
