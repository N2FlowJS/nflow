import { Flow } from '@/models/flowTypes';





export const findNextNodes = (
  flow: Flow,
  currentNodeId: string
): string[] => {
  const edges = flow.edges.filter((edge) => edge.source === currentNodeId);

  if (edges.length === 0) {
    return [];
  }

  // Map each edge to a result object containing the target node ID and edge information
  return edges.map(edge => edge.target) || [];
};

