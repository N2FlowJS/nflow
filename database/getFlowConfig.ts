import { prisma } from '@lib/prisma';
import { Flow } from '../components/agent/types/flowTypes';

// Helper function for getting flow configuration
export async function getFlowConfig(flowId: string): Promise<Flow | null> {
  const agent = await prisma.agent.findUnique({
    where: { id: flowId },
    select: { flowConfig: true },
  });

  if (!agent) return null;

  // Parse the flow configuration
  return typeof agent.flowConfig === 'string' ? JSON.parse(agent.flowConfig) : agent.flowConfig;
}
