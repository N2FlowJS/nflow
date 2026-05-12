import type { NodeValidator } from '../types';

export const validateAgentNode: NodeValidator = (node, context) => {
  const hasLlm = context.edges.some(
    (e) => e.target === node.id && (e.targetHandle === 'agent_llm' || e.targetHandle?.includes('llm')),
  );
  if (hasLlm) return [];

  return [
    {
      level: 'error',
      nodeId: node.id,
      message: `Agent "${node.data.label}" is missing Chat Model connection.`,
    },
  ];
};
