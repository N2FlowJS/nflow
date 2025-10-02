/**
 * NODE REGISTRY INSPECTOR
 * 
 * Debug utilities for inspecting registered nodes.
 * Useful for development and troubleshooting.
 */

import { NodeRegistry } from './node-registry';
import { NodeCategory } from '../@node-plugin/type';

/**
 * Pretty-print all registered nodes
 */
export function printRegisteredNodes(): void {
  const all = NodeRegistry.getAll();
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║           REGISTERED NODE DEFINITIONS                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  if (all.length === 0) {
    console.log('❌ No nodes registered');
    return;
  }

  // Group by category
  const byCategory: Record<string, typeof all> = {};
  all.forEach(def => {
    const cat = def.category || 'unknown';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(def);
  });

  // Print each category
  Object.entries(byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([category, nodes]) => {
      console.log(`\n📁 ${category.toUpperCase()} (${nodes.length})`);
      console.log('─'.repeat(60));
      
      nodes
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(node => {
          const inputs = node.inputs?.length || 0;
          const outputs = node.outputs?.length || 0;
          const hasDynamic = node.getDynamicInputs || node.getDynamicOutputs;
          const dynamic = hasDynamic ? ' 🔄' : '';
          
          console.log(`  • ${node.name} (${node.id})${dynamic}`);
          console.log(`    Ports: ${inputs} in → ${outputs} out`);
          if (node.description) {
            console.log(`    ${node.description}`);
          }
          console.log('');
        });
    });

  console.log('─'.repeat(60));
  console.log(`✅ Total: ${all.length} nodes registered\n`);
}

/**
 * Get node statistics
 */
export function getNodeStats(): {
  total: number;
  byCategory: Record<string, number>;
  withDynamicPorts: number;
  withCustomComponents: number;
} {
  const all = NodeRegistry.getAll();
  const byCategory: Record<string, number> = {};
  let withDynamicPorts = 0;
  let withCustomComponents = 0;

  all.forEach(def => {
    // Category count
    const cat = def.category || 'unknown';
    byCategory[cat] = (byCategory[cat] || 0) + 1;

    // Dynamic ports
    if (def.getDynamicInputs || def.getDynamicOutputs) {
      withDynamicPorts++;
    }

    // Custom components (currently not in NodeDefinition, always use Dynamic)
    withCustomComponents = 0; // All use DynamicNode/DynamicForm now
  });

  return {
    total: all.length,
    byCategory,
    withDynamicPorts,
    withCustomComponents,
  };
}

/**
 * Find nodes by category
 */
export function findNodesByCategory(category: NodeCategory | string): string[] {
  return NodeRegistry.getByCategory(category).map(def => def.id);
}

/**
 * Check if a node is registered
 */
export function isNodeRegistered(nodeId: string): boolean {
  return NodeRegistry.has(nodeId);
}

/**
 * Get node definition (safe)
 */
export function getNodeDefinition(nodeId: string) {
  return NodeRegistry.get(nodeId);
}

/**
 * Validate all registered nodes
 */
export function validateRegisteredNodes(): {
  valid: number;
  invalid: { id: string; errors: string[] }[];
} {
  const all = NodeRegistry.getAll();
  const invalid: { id: string; errors: string[] }[] = [];

  all.forEach(def => {
    const errors: string[] = [];

    if (!def.id) errors.push('Missing id');
    if (!def.name) errors.push('Missing name');
    if (!def.category) errors.push('Missing category');
    if (!def.execute) errors.push('Missing execute function');
    if (!def.inputs) errors.push('Missing inputs array');
    if (!def.outputs) errors.push('Missing outputs array');

    if (errors.length > 0) {
      invalid.push({ id: def.id || 'unknown', errors });
    }
  });

  return {
    valid: all.length - invalid.length,
    invalid,
  };
}

/**
 * Export node definitions to JSON (for debugging)
 */
export function exportNodeDefinitionsJSON(): string {
  const all = NodeRegistry.getAll();
  const simplified = all.map(def => ({
    id: def.id,
    name: def.name,
    category: def.category,
    description: def.description,
    version: def.version,
    inputs: def.inputs?.length || 0,
    outputs: def.outputs?.length || 0,
    hasDynamicInputs: !!def.getDynamicInputs,
    hasDynamicOutputs: !!def.getDynamicOutputs,
    tags: def.tags || [],
  }));

  return JSON.stringify(simplified, null, 2);
}

/**
 * Browser console helper
 * Usage: window.__inspectNodes()
 */
if (typeof window !== 'undefined') {
  (window as any).__inspectNodes = () => {
    printRegisteredNodes();
    const stats = getNodeStats();
    console.log('\n📊 STATISTICS:');
    console.log(`   Total: ${stats.total}`);
    console.log(`   With Dynamic Ports: ${stats.withDynamicPorts}`);
    console.log(`   With Custom Components: ${stats.withCustomComponents}`);
    console.log('\n💡 Use NodeRegistry.get("node-id") to inspect a specific node\n');
  };

  console.log('💡 Dev tip: Run window.__inspectNodes() to see all registered nodes');
}

export default {
  printRegisteredNodes,
  getNodeStats,
  findNodesByCategory,
  isNodeRegistered,
  getNodeDefinition,
  validateRegisteredNodes,
  exportNodeDefinitionsJSON,
};
