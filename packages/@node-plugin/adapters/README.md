# Adapter Layer - Week 2 Implementation

## Purpose

The adapter layer provides backward compatibility between the old `NodePlugin` format and the new `NodeDefinition` format. This allows existing nodes to continue working while we migrate them to the new architecture.

## Key Components

### `legacy-adapter.ts`

Converts old `NodePlugin` format to new `NodeDefinition` format.

#### Main Functions

**`adaptLegacyPlugin(plugin, metadata?)`**

Converts a single legacy plugin to the new format.

```typescript
import { adaptLegacyPlugin } from '@node-plugin/adapters';

const legacyPlugin = {
  name: 'My Old Node',
  match: (node) => node.type === 'my-old-node',
  run: async (node, context) => {
    // Legacy execution logic
    return { result: 'output' };
  }
};

const newDefinition = adaptLegacyPlugin(legacyPlugin, {
  id: 'my-old-node',
  category: 'transform',
  description: 'My old node converted to new format',
});
```

**`adaptLegacyPlugins(plugins, metadataMap?)`**

Batch converts multiple legacy plugins.

```typescript
const legacyPlugins = [plugin1, plugin2, plugin3];
const metadataMap = {
  'plugin1': { category: 'transform', description: '...' },
  'plugin2': { category: 'api', description: '...' },
};

const newDefinitions = adaptLegacyPlugins(legacyPlugins, metadataMap);
```

**`isLegacyPlugin(plugin)`**

Type guard to check if a plugin uses the old format.

```typescript
if (isLegacyPlugin(plugin)) {
  // Convert to new format
  plugin = adaptLegacyPlugin(plugin);
}
```

## How It Works

### 1. Port Creation

The adapter creates default input/output ports for legacy nodes:

- **Default Input**: One `ANY` type input port that accepts any data
- **Default Output**: One `TEXT` type output port for the result

### 2. Execution Wrapping

The adapter wraps the legacy `run` function:

```typescript
// Old format (run function)
async run(node, context, callback, dispatcher) {
  // Legacy execution
  return { result: 'value' };
}

// Converted to new format (execute function)
async execute(context) {
  // Calls the old run function
  // Adapts inputs/outputs
  return { outputs: { output: 'value' }, status: 'success' };
}
```

### 3. Category Mapping

Legacy category strings are mapped to the new `NodeCategory` enum:

| Legacy Category | New Category |
|----------------|--------------|
| 'input', 'begin' | INPUT |
| 'output', 'display' | OUTPUT |
| 'transform', 'process' | TRANSFORM |
| 'llm', 'ai' | AI |
| 'database', 'db' | DATABASE |
| 'api', 'http' | API |
| 'logic', 'condition' | LOGIC |
| 'file' | UTILITY |

### 4. Result Adaptation

Legacy execution results are converted to the new format:

```typescript
// Legacy result
{ result: 'value', error: null }

// Converted to new format
{
  outputs: { output: 'value' },
  status: 'success',
  error: undefined
}
```

## Usage in Migration

### Phase 1: Identify Legacy Nodes

```typescript
import { isLegacyPlugin } from '@node-plugin/adapters';

const allPlugins = getRegisteredPlugins();
const legacyPlugins = allPlugins.filter(isLegacyPlugin);
console.log(`Found ${legacyPlugins.length} legacy nodes to migrate`);
```

### Phase 2: Adapt During Runtime

```typescript
import { adaptLegacyPlugin } from '@node-plugin/adapters';

function registerPlugin(plugin: any) {
  if (isLegacyPlugin(plugin)) {
    plugin = adaptLegacyPlugin(plugin, {
      category: detectCategory(plugin),
      description: plugin.name || 'Legacy node',
    });
  }
  
  registry.register(plugin);
}
```

### Phase 3: Gradual Migration

The adapter allows both formats to coexist:

```typescript
// Old nodes continue working
const legacyNode = { name: 'Old Node', run: ... };
const adapted = adaptLegacyPlugin(legacyNode);

// New nodes use native format
const newNode: NodeDefinition = {
  id: 'new-node',
  inputs: [...],
  outputs: [...],
  execute: async (context) => { ... }
};

// Both can be registered and executed
registry.register(adapted);
registry.register(newNode);
```

## Limitations

1. **Port Customization**: Legacy nodes get default ports only. For custom ports, you need to migrate to the new format.

2. **Type Safety**: Legacy nodes don't have explicit type checking. The adapter uses `ANY` type for maximum compatibility.

3. **Advanced Features**: Legacy nodes can't use:
   - Custom input/output ports
   - Port validation
   - Connection type checking
   - Before/after execution hooks
   
4. **Performance**: The adaptation adds a small overhead. Fully migrated nodes are more efficient.

## Best Practices

1. **Use Metadata**: Always provide metadata when adapting plugins for better organization:
   ```typescript
   adaptLegacyPlugin(plugin, {
     id: 'my-node',
     category: 'transform',
     description: 'Clear description',
     version: '1.0.0',
   });
   ```

2. **Batch Conversion**: Use `adaptLegacyPlugins` with metadata map for bulk operations.

3. **Gradual Migration**: Don't rush to convert all nodes at once. Use adapters during transition.

4. **Test Adapted Nodes**: Verify that adapted nodes work correctly:
   ```typescript
   const adapted = adaptLegacyPlugin(legacyPlugin);
   const result = await adapted.execute(testContext);
   expect(result.status).toBe('success');
   ```

## Next Steps

After Week 2 (Adapter Layer), we proceed to:

- **Week 3**: Migrate 6 critical nodes (begin, llm, retrieval, http-request, condition, display)
- **Week 4-5**: Build UI components for port display and editing
- **Week 6**: Add connection validation UI
- **Week 7**: Migrate remaining 63 nodes
- **Week 8**: Polish and release

## Related Files

- `packages/@node-plugin/adapters/legacy-adapter.ts` - Main adapter implementation
- `packages/@node-plugin/adapters/index.ts` - Adapter exports
- `packages/@node-plugin/type.ts` - Type definitions for both formats
- `packages/@node-plugin/ports/` - Port system (Week 1)
- `__tests__/adapters.test.ts` - Adapter tests
