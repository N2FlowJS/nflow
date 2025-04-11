import { NodeTypeString } from "../types/flowTypes";

// Define which node types can be connected to which other node types
export const CONNECTION_RULES: Record<NodeTypeString, NodeTypeString[]> = {
  // Begin nodes can connect to any node except other begin nodes
  begin: ['interface', 'generate', 'categorize', 'retrieval'],
  
  // Interface nodes can connect to generate, categorize, and retrieval nodes
  interface: ['generate', 'categorize', 'retrieval'],
  
  // Generate nodes can connect to interface, categorize, and retrieval nodes
  generate: ['interface', 'categorize', 'retrieval'],
  
  // Categorize nodes have special handling via their categories
  // The actual connections are handled in CategorizeNodeForm
  categorize: ['interface', 'generate', 'retrieval'],
  
  // Retrieval nodes can connect to generate and interface nodes
  retrieval: ['generate', 'interface'],
};

/**
 * Check if a connection between two node types is allowed
 * @param sourceType The type of the source node
 * @param targetType The type of the target node
 * @returns boolean indicating if the connection is allowed
 */
export function isConnectionAllowed(sourceType: NodeTypeString, targetType: NodeTypeString): boolean {
  return CONNECTION_RULES[sourceType]?.includes(targetType) || false;
}
