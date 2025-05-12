import { prisma } from '../lib/prisma';
import { Flow } from '../models/flowTypes';

// Default empty flow configuration
const DEFAULT_FLOW: Flow = {
  nodes: [],
  edges: [],
};

/**
 * Validates if the data has valid Flow structure
 */
function isValidFlowStructure(data: any): data is Flow {
  return data && Array.isArray(data.nodes) && Array.isArray(data.edges);
}

/**
 * Ensures data conforms to Flow structure, applying defaults where needed
 */
function normalizeFlowData(data: any): Flow {
  if (!data) return { ...DEFAULT_FLOW };

  return {
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    edges: Array.isArray(data.edges) ? data.edges : [],
    ...Object.fromEntries(Object.entries(data).filter(([key]) => !['nodes', 'edges'].includes(key))),
  };
}

// Helper function for getting flow configuration
export async function getFlowConfig(flowId: string): Promise<Flow> {
  const agent = await prisma.agent.findUnique({
    where: { id: flowId },
    select: { flowConfig: true },
  });

  if (!agent) throw new Error(`Agent with ID ${flowId} not found`);

  if (isValidFlowStructure(agent.flowConfig)) {
    return agent.flowConfig;
  } else {
    return normalizeFlowData(agent.flowConfig);
  }
}
