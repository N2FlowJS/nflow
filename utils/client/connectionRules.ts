import { NodeTypeString } from '../../models/flowTypes';

// Define which node types can be connected to which other node types
export const CONNECTION_RULES: Record<NodeTypeString, NodeTypeString[]> = {
  begin: ['interface', 'generate', 'categorize', 'retrieval'],

  interface: ['generate', 'categorize', 'retrieval', 'decision', 'keywords'],

  generate: ['interface', 'categorize', 'retrieval', 'decision', 'keywords'],

  categorize: ['interface', 'generate', 'retrieval', 'decision', 'keywords'],

  retrieval: ['generate', 'interface', 'decision', 'keywords'],

  decision: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  keywords: ['interface', 'generate', 'categorize', 'retrieval', 'decision'],
};

export function isConnectionAllowed(sourceType: NodeTypeString, targetType: NodeTypeString): boolean {
  return CONNECTION_RULES[sourceType]?.includes(targetType) || false;
}
