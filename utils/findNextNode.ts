import { Flow } from '@components/agent/types/flowTypes';

/**
 * Utility functions for flow execution
 */
/**
 * Find the next node in the flow
 */

export const findNextNode = (flow: Flow, currentNodeId: string, edgeSelector?: string): string | null => {
  // Find edges that start from the current node
  const edges = flow.edges.filter((edge) => edge.source === currentNodeId);

  if (edges.length === 0) {
    return null;
  }

  // If an edge selector is provided (e.g., a category name for categorize nodes)
  if (edgeSelector) {
    const edge = edges.find((e) => e.sourceHandle === `out-${edgeSelector}`);
    return edge ? edge.target : null;
  }

  // Otherwise, just take the first edge
  return edges[0].target;
};
