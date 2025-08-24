import { Node } from '@xyflow/react';
import type { BaseNodeData } from '@n2flowjs/flow';

// Interface to be augmented by each package's types.ts
export interface NodeDataMap {}

// Union of all augmented node data plus a permissive fallback for dynamic plugins.
export type AllNodeData = NodeDataMap[keyof NodeDataMap] | (BaseNodeData<any> & { type: string });
export type NodeData = AllNodeData;
export type FlowNode = Node<AllNodeData>;

// Make this a module even if nothing else is exported after tree-shaking.
export {};
