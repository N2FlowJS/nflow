import { prisma } from '@lib/prisma';
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
  return data && 
    Array.isArray(data.nodes) && 
    Array.isArray(data.edges);
}

/**
 * Ensures data conforms to Flow structure, applying defaults where needed
 */
function normalizeFlowData(data: any): Flow {
  if (!data) return { ...DEFAULT_FLOW };
  
  return {
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    edges: Array.isArray(data.edges) ? data.edges : [],
    // Preserve other properties if they exist
    ...Object.fromEntries(
      Object.entries(data).filter(([key]) => !['nodes', 'edges'].includes(key))
    )
  };
}

// Helper function for getting flow configuration
export async function getFlowConfig(flowId: string): Promise<Flow> {
  // Input validation
  if (!flowId || typeof flowId !== 'string') {
    console.error('Invalid flowId provided to getFlowConfig:', flowId);
    return { ...DEFAULT_FLOW };
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: flowId },
      select: { flowConfig: true },
    });

    if (!agent || agent.flowConfig === null || agent.flowConfig === undefined) {
      return { ...DEFAULT_FLOW };
    }

    let flowData: any;
    
    if (typeof agent.flowConfig === 'string') {
      try {
        flowData = JSON.parse(agent.flowConfig);
      } catch (parseError) {
        console.error('Error parsing flow configuration:', parseError);
        return { ...DEFAULT_FLOW };
      }
    } else {
      flowData = agent.flowConfig;
    }

    if (isValidFlowStructure(flowData)) {
      return flowData;
    } else {
      console.warn('Flow data has invalid structure, normalizing:', flowId);
      return normalizeFlowData(flowData);
    }
  } catch (error) {
    console.error('Error retrieving flow configuration:', error);
    return { ...DEFAULT_FLOW };
  }
}
