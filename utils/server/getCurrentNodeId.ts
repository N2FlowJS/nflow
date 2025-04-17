import { Flow, FlowNode } from '@components/agent/types/flowTypes';

export function getCurrentNodeId(flow: Flow, id?: string): FlowNode {
  const node = flow.nodes.find((node) => node.id === id) || flow.nodes.find((node) => node.type === 'begin');
  if (!node) {
    throw new Error(`Node with ID ${id} not found in the flow`);
  }
  return node;
}
