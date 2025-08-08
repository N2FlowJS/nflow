import { NodeTypeString } from '../../models/flowTypes';

// Define which node types can be connected to which other node types
export const CONNECTION_RULES: Partial<Record<NodeTypeString, NodeTypeString[]>> = {
  begin: ['interface', 'generate', 'categorize', 'retrieval'],

  interface: ['generate', 'categorize', 'retrieval', 'decision', 'keywords'],

  generate: ['interface', 'categorize', 'retrieval', 'decision', 'keywords'],

  categorize: ['interface', 'generate', 'retrieval', 'decision', 'keywords'],

  retrieval: ['generate', 'interface', 'decision', 'keywords'],

  decision: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  keywords: ['interface', 'generate', 'categorize', 'retrieval', 'decision'],

  // Added agent and subagent rules
  agent: ['subagent', 'interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  subagent: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
};

export function isConnectionAllowed(sourceType: NodeTypeString, targetType: NodeTypeString): boolean {
  return CONNECTION_RULES[sourceType]?.includes(targetType) || false;
}
