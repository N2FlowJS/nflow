import { Flow, FlowNode } from '@components/agent/types/flowTypes';

export function getCurrentNodeId(flow: Flow, id?: string): FlowNode | undefined {
  return flow.nodes.find((node) => node.id === id) || flow.nodes.find((node) => node.type === 'begin');
}
