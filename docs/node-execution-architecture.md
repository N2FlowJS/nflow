---
layout: default
title: Node Execution Architecture
nav_order: 4
---

# Node Execution Architecture

This document describes NFlow's unified node execution system built around the `BaseNodeExecutor` pattern.

## Overview

NFlow's execution engine provides a unified, extensible system for executing nodes in visual flows. All nodes, whether built-in or user-defined, follow the same execution pattern through the `BaseNodeExecutor` base class.

## Core Components

### BaseNodeExecutor

The `BaseNodeExecutor<TForm>` is an abstract base class that provides unified execution flow for all node types:

```typescript
export abstract class BaseNodeExecutor<TForm = any> {
  constructor(protected config: ExecutorConfig) {}

  // Main execution entry point
  async execute(
    node: FlowNode,
    context: FlowExecutionContext,
    dispatcher?: FlowStateDispatcher
  ): Promise<ExecutionResult>

  // Business logic implemented by subclasses
  protected abstract executeLogic(
    form: TForm,
    context: ExecutionContext
  ): Promise<string>;

  // Template variable processing
  protected extractTemplateVariables(form: TForm): string[]
  protected resolveInputValues(inputs: string[], flowState: any): Record<string, any>
  protected buildTemplateVariables(inputs: string[], flowState: any): Record<string, string>

  // State management
  protected updateState(node: FlowNode, output: string, flowState: any, dispatcher?: FlowStateDispatcher): any

  // Result creation
  protected createSuccessResult(...): ExecutionResult
  protected createErrorResult(...): ExecutionResult
  protected createWaitingResult(...): ExecutionResult
}
```

### Execution Flow

Every node execution follows this standardized flow:

1. **Template Variable Extraction**: Extract `{variable}` references from form fields
2. **Input Readiness Check**: Verify required inputs are available (optional)
3. **Input Resolution**: Resolve template variables to actual values from flow state
4. **Business Logic Execution**: Run node-specific logic via `executeLogic()`
5. **State Update**: Update flow state with execution results
6. **Next Node Resolution**: Determine which nodes to execute next

### Package Structure

All nodes follow a standardized package structure:

```
packages/{node-type}/
├── definition.ts      # Node metadata, form config, icon
├── executor.ts        # BaseNodeExecutor implementation
└── .nflow.json        # Package configuration
```

## Node Categories

### Built-in Nodes

Core functionality nodes that ship with NFlow:

- **Logic Nodes**: `condition`, `decision`, `loop`
- **Data Processing**: `transform`, `json-parse`, `text-process`
- **Math Operations**: `math`, `counter`
- **Utility**: `delay`, `log`, `display`

### API Integration Nodes

Nodes that integrate with external services:

- **Communication**: `slack`, `discord`, `telegram`
- **Development**: `github`, `gitlab`, `jira`
- **Social Media**: `twitter`, `facebook`, `linkedin`
- **Search**: `google-search`, `bing-search`

### Custom Nodes

User-defined nodes created through the UI:

- **JavaScript Execution**: Safe code execution in sandboxed environment
- **Dynamic Ports**: Configurable input/output interfaces
- **Template Variables**: Full support for `{variable}` syntax
- **Team Sharing**: Organization-wide custom node libraries

## Execution Registry

The `EXECUTOR_REGISTRY` automatically discovers and registers executors:

```typescript
// Auto-discovery from packages directory
function autoRegisterExecutors() {
  const packagesDir = 'packages/';
  // Scan for executor.ts files
  // Register BaseNodeExecutor instances
}

// Manual registration for custom nodes
export function registerExecutor(nodeType: string, executor: BaseNodeExecutor<any>) {
  EXECUTOR_REGISTRY.set(nodeType, executor);
}
```

## Template Variable System

NFlow supports template variables in node configurations:

```typescript
// In form fields
{
  message: "Hello {userName}, your order {orderId} is ready",
  apiUrl: "https://api.example.com/users/{userId}"
}

// Automatic resolution
const resolvedInputs = {
  userName: "John Doe",
  orderId: "12345",
  userId: "67890"
};
```

## Error Handling

Comprehensive error handling at multiple levels:

```typescript
// Node-level errors
try {
  const result = await executor.execute(node, context, dispatcher);
} catch (error) {
  return createErrorResult(node, form, error, flowState, startTime);
}

// Flow-level error recovery
if (result.status === 'error') {
  // Handle error, potentially continue with alternative path
}
```

## Performance Optimizations

### State Management
- **FlowStateDispatcher**: Centralized state updates
- **Immutable Updates**: Prevent race conditions
- **Batch Operations**: Minimize re-renders

### Execution Optimization
- **Lazy Loading**: Executors loaded on-demand
- **Caching**: Template variable resolution caching
- **Async Processing**: Non-blocking execution

## Security

### Sandboxed Execution
Custom nodes run in isolated JavaScript execution:

```typescript
const executionContext = {
  inputs: resolvedInputs,
  outputs: {},
  console: { log: (...args) => console.log('[NodeName]', ...args) },
  JSON: { parse, stringify },
  Math, Date, String, Number, Array, Object
};
```

### Input Validation
- Template variable validation
- Type checking for port connections
- User permission verification

## Extensibility

### Creating New Nodes

1. **Create Package Structure**:
```bash
mkdir packages/my-custom-node
cd packages/my-custom-node
```

2. **Implement Definition** (`definition.ts`):
```typescript
export const MyCustomNodeDefinition = {
  type: 'my-custom-node',
  icon: '⚙️',
  input: 'input1, input2',
  output: 'result',
  data: {
    type: 'my-custom-node',
    form: {
      name: 'My Custom Node',
      description: 'Does something useful',
      input1: '',
      input2: ''
    }
  }
};
```

3. **Implement Executor** (`executor.ts`):
```typescript
export class MyCustomNodeExecutor extends BaseNodeExecutor<MyCustomForm> {
  constructor() {
    super({
      nodeType: 'my-custom-node',
      defaultRole: 'developer',
      templateFields: ['input1', 'input2']
    });
  }

  protected async executeLogic(form: MyCustomForm, context: ExecutionContext): Promise<string> {
    // Your business logic here
    return `Result: ${form.input1} + ${form.input2}`;
  }
}

export const myCustomNodeExecutor = new MyCustomNodeExecutor();
```


## Migration Guide

### From Legacy Plugin System

The new `BaseNodeExecutor` system replaces the legacy plugin system:

**Before (Legacy)**:
```typescript
// plugin.ts
export const myPlugin = {
  name: 'my-node',
  match: (node) => node.type === 'my-node',
  run: async (node, context, callback, dispatcher) => {
    // Custom execution logic
  }
};
```

**After (New)**:
```typescript
// executor.ts
export class MyNodeExecutor extends BaseNodeExecutor<MyForm> {
  constructor() {
    super({ nodeType: 'my-node' });
  }

  protected async executeLogic(form: MyForm, context: ExecutionContext): Promise<string> {
    // Business logic only
    return 'result';
  }
}
```

### Benefits of Migration

- **Unified API**: All nodes use the same execution pattern
- **Better Error Handling**: Standardized error reporting
- **Template Support**: Built-in variable resolution
- **State Management**: Automatic state updates
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized execution flow

## Testing

Node executors should be tested with the standard test framework:

```typescript
describe('MyCustomNodeExecutor', () => {
  let executor: MyCustomNodeExecutor;

  beforeEach(() => {
    executor = new MyCustomNodeExecutor();
  });

  it('should execute logic correctly', async () => {
    const node = { /* mock node */ };
    const context = { /* mock context */ };

    const result = await executor.execute(node, context);

    expect(result.status).toBe('ended');
    expect(result.execution.output).toBe('expected output');
  });
});
```

## Monitoring and Debugging

### Execution Logging
All node executions are logged with structured information:

```typescript
{
  nodeId: 'node_123',
  nodeType: 'my-custom-node',
  startTime: '2025-01-01T10:00:00Z',
  endTime: '2025-01-01T10:00:01Z',
  output: 'execution result',
  error: null // or error message
}
```

### Performance Metrics
Execution times and resource usage are tracked:

- Template resolution time
- Business logic execution time
- State update time
- Memory usage patterns

## Future Enhancements

### Planned Features
- **Parallel Execution**: Concurrent node execution
- **Conditional Execution**: Advanced branching logic
- **Retry Mechanisms**: Automatic failure recovery
- **Execution Profiling**: Detailed performance analysis
- **Custom Executors**: User-defined execution strategies

This architecture provides a solid foundation for NFlow's visual programming capabilities while maintaining extensibility and performance.
