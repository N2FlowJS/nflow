import { NodeTypeString } from '../../models/flowTypes';

// Define which node types can be connected to which other node types
export const CONNECTION_RULES: Partial<Record<NodeTypeString, NodeTypeString[]>> = {
  begin: ['interface', 'generate', 'categorize', 'retrieval', 'agent', 'subagent'],

  interface: [
    'generate',
    'categorize',
    'retrieval',
    'decision',
    'keywords',
    'agent',
    'subagent',
    'execmysql',
    'execpostgres',
    'execmssql',
  ],

  generate: ['interface', 'categorize', 'retrieval', 'decision', 'keywords', 'execmysql', 'execpostgres', 'execmssql'],

  categorize: ['interface', 'generate', 'retrieval', 'decision', 'keywords'],

  retrieval: [
    'generate',
    'interface',
    'decision',
    'keywords',
    'agent',
    'subagent',
    'execmysql',
    'execpostgres',
    'execmssql',
  ],

  decision: [
    'interface',
    'generate',
    'categorize',
    'retrieval',
    'decision',
    'keywords',
    'agent',
    'subagent',
    'execmysql',
    'execpostgres',
    'execmssql',
  ],
  keywords: [
    'interface',
    'generate',
    'categorize',
    'retrieval',
    'decision',
    'agent',
    'subagent',
    'execmysql',
    'execpostgres',
    'execmssql',
  ],

  agent: ['subagent', 'interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  subagent: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  execmssql: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  execmysql: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
  execpostgres: ['interface', 'generate', 'categorize', 'retrieval', 'decision', 'keywords'],
};

export function isConnectionAllowed(sourceType: NodeTypeString, targetType: NodeTypeString): boolean {
  return CONNECTION_RULES[sourceType]?.includes(targetType) || false;
}
