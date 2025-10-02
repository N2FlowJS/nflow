// Legacy exports (for backward compatibility)
export { RetrievalNodeDefinition as retrievalPlugin, RetrievalNodeDefinition as plugin } from './definition';
export { RetrievalNodeDefinition as default } from './definition';

// NEW: NodeDefinition export (Week 3 migration)
export { RetrievalNodeDefinition } from './definition';
export { default as RetrievalNode } from './definition';

// Re-export types
export * from './types';
