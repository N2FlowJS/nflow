import { Edge } from '@xyflow/react';
import { EXECUTION_STATUS } from './EXECUTION_STATUS';
import { ExecutionResult, Flow, FlowNode, FlowState } from './type';

export const findNextNodes = (flow: Flow, currentNodeId: string): string[] => {
  const edges = flow.edges.filter((edge: Edge) => edge.source === currentNodeId);

  if (edges.length === 0) {
    return [];
  }

  // Map each edge to a result object containing the target node ID and edge information
  return edges.map((edge) => edge.target) || [];
};

export const GetLabelWaiting = (node_name: string) => `Waiting for input variables for ${node_name} operation`;
export const GetLabelInProgress = (node_name: string) => `In Progress... for ${node_name}`;

export const ResultWaiting = (node: FlowNode, flowState: FlowState, startTime: string): ExecutionResult => {
  return {
    nextNodes: [],
    status: EXECUTION_STATUS.WAITING,
    message: GetLabelWaiting(node.data.type),
    flowState,
    nodeInfo: {
      id: node.id,
      name: node.data?.label || node.id,
      type: node.data.type,
      role: node.data.role || node.data.form.role || 'developer',
    },
    execution: {
      output: GetLabelWaiting(node.data.type),
      nodeId: node.id,
      nodeName: node.data?.label || node.id,
      startTime: startTime,
    },
  };
};
