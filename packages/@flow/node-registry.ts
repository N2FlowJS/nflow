/**
 * NODE REGISTRY - Central registry for all node definitions
 * 
 * This registry:
 * - Stores all NodeDefinitions in a centralized map
 * - Provides lookup by node type
 * - Enables dynamic node/form generation
 * - Eliminates need for hard-coded components
 */

import { NodeDefinition } from '../@node-plugin/type';

/**
 * Central registry for all node definitions
 */
class NodeRegistryClass {
  private definitions = new Map<string, NodeDefinition<any>>();

  /**
   * Register a node definition
   */
  register<TConfig = any>(definition: NodeDefinition<TConfig>): void {
    if (this.definitions.has(definition.id)) {
      console.warn(`[NodeRegistry] Overwriting definition for node type: ${definition.id}`);
    }
    this.definitions.set(definition.id, definition);
    console.log(`[NodeRegistry] Registered: ${definition.id} (${definition.name})`);
  }

  /**
   * Get a node definition by type
   */
  get<TConfig = any>(nodeType: string): NodeDefinition<TConfig> | undefined {
    return this.definitions.get(nodeType);
  }

  /**
   * Get all registered node definitions
   */
  getAll(): NodeDefinition<any>[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get all node definitions by category
   */
  getByCategory(category: string): NodeDefinition<any>[] {
    return this.getAll().filter(def => def.category === category);
  }

  /**
   * Check if a node type is registered
   */
  has(nodeType: string): boolean {
    return this.definitions.has(nodeType);
  }

  /**
   * Unregister a node definition (for testing)
   */
  unregister(nodeType: string): boolean {
    return this.definitions.delete(nodeType);
  }

  /**
   * Clear all definitions (for testing)
   */
  clear(): void {
    this.definitions.clear();
  }

  /**
   * Get definition count
   */
  get size(): number {
    return this.definitions.size;
  }
}

/**
 * Singleton instance
 */
export const NodeRegistry = new NodeRegistryClass();

/**
 * Helper to register multiple definitions at once
 */
export function registerNodes(...definitions: NodeDefinition<any>[]): void {
  definitions.forEach(def => NodeRegistry.register(def));
}

export default NodeRegistry;
