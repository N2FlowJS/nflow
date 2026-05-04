import type { NodeValidator } from '../types';

export const validateAgentNode: NodeValidator = (node, context) => {
  const hasLlm = context.edges.some(
    (edge) => edge.target === node.id && edge.targetHandle === 'agent_llm',
  );
  if (hasLlm) return [];

  return [
    {
      level: 'error',
      nodeId: node.id,
      message: `Agent "${node.data.label}" is missing Chat Model connection (LLM_LINK).`,
    },
  ];
};
