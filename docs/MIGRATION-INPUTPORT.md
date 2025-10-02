# Migration Guide: config → InputPort Pattern

## Overview
NFlow has migrated from `config/configSchema` pattern to InputPort-based configuration for cleaner architecture and better type safety.

## What Changed

### OLD Pattern (Deprecated)
```typescript
export const OldNode: NodeDefinition = {
  id: 'old-node',
  name: 'Old Node',
  // ...
  
  config: {
    properties: {
      myField: {
        type: 'string',
        title: 'My Field',
        description: 'Field description',
        default: 'default value',
        enum: ['option1', 'option2'],
      },
    },
  },
};
```

### NEW Pattern (Current)
```typescript
export const NewNode: NodeDefinition = {
  id: 'new-node',
  name: 'New Node',
  // ...
  
  inputs: [
    {
      id: 'myField',
      name: 'My Field',
      type: PortType.TEXT,
      description: 'Field description',
      defaultValue: 'default value',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['option1', 'option2'],
      },
    },
  ],
};
```

## Migration Steps

### 1. Convert Property Types

| Old `property.type` | New `InputPort.type` |
|---------------------|----------------------|
| `'string'`          | `PortType.TEXT`      |
| `'number'`          | `PortType.NUMBER`    |
| `'integer'`         | `PortType.NUMBER`    |
| `'boolean'`         | `PortType.BOOLEAN`   |
| `'array'`           | `PortType.ARRAY`     |
| `'object'`          | `PortType.JSON`      |

### 2. Map Property Fields

| Old Config Property | New InputPort Property |
|---------------------|------------------------|
| `property.title`    | `InputPort.name`       |
| `property.description` | `InputPort.description` |
| `property.default`  | `InputPort.defaultValue` |
| `property.required` | `InputPort.required`   |

### 3. Convert Metadata

#### Select/Dropdown
```typescript
// OLD
config: {
  properties: {
    engine: {
      type: 'string',
      enum: ['simple', 'advanced'],
    }
  }
}

// NEW
inputs: [{
  id: 'engine',
  type: PortType.TEXT,
  metadata: {
    inputType: 'select',
    options: ['simple', 'advanced'],
  }
}]
```

#### Textarea
```typescript
// OLD
config: {
  properties: {
    content: {
      type: 'string',
      format: 'textarea',
      rows: 8,
    }
  }
}

// NEW
inputs: [{
  id: 'content',
  type: PortType.TEXT,
  metadata: {
    inputType: 'textarea',
    rows: 8,
  }
}]
```

#### Number with constraints
```typescript
// OLD
config: {
  properties: {
    temperature: {
      type: 'number',
      minimum: 0,
      maximum: 2,
      step: 0.1,
    }
  }
}

// NEW
inputs: [{
  id: 'temperature',
  type: PortType.NUMBER,
  metadata: {
    inputType: 'number',
    min: 0,
    max: 2,
    step: 0.1,
  }
}]
```

## Complete Example

### Before
```typescript
import { NodeDefinition, NodeCategory } from '../@node-plugin/type';

export const HttpRequestNode: NodeDefinition = {
  id: 'http-request',
  name: 'HTTP Request',
  category: NodeCategory.API,
  description: 'Make HTTP requests',
  version: '1.0.0',
  
  inputs: [],
  outputs: [
    { id: 'response', name: 'response', type: PortType.JSON }
  ],
  
  config: {
    properties: {
      method: {
        type: 'string',
        title: 'HTTP Method',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
      },
      url: {
        type: 'string',
        title: 'URL',
        description: 'Request URL (supports template variables)',
        placeholder: 'https://api.example.com/{{endpoint}}',
      },
      timeout: {
        type: 'number',
        title: 'Timeout (ms)',
        default: 30000,
        minimum: 1000,
        maximum: 300000,
      },
    },
  },
  
  execute: async (context) => {
    // ... implementation
  },
};
```

### After
```typescript
import { NodeDefinition, NodeCategory } from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';

export const HttpRequestNode: NodeDefinition = {
  id: 'http-request',
  name: 'HTTP Request',
  category: NodeCategory.API,
  description: 'Make HTTP requests',
  version: '1.0.0',
  icon: 'ApiOutlined',
  color: '#1890ff',
  
  inputs: [
    {
      id: 'method',
      name: 'HTTP Method',
      type: PortType.TEXT,
      defaultValue: 'GET',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
      },
    },
    {
      id: 'url',
      name: 'URL',
      type: PortType.TEXT,
      description: 'Request URL (supports template variables)',
      required: true,
      metadata: {
        inputType: 'text',
        placeholder: 'https://api.example.com/{{endpoint}}',
      },
    },
    {
      id: 'timeout',
      name: 'Timeout (ms)',
      type: PortType.NUMBER,
      defaultValue: 30000,
      required: false,
      metadata: {
        inputType: 'number',
        min: 1000,
        max: 300000,
      },
    },
  ],
  
  outputs: [
    { id: 'response', name: 'response', type: PortType.JSON }
  ],
  
  execute: async (context) => {
    const { config } = context;
    const { method, url, timeout } = config;
    // ... implementation
  },
};
```

## Node & Form Files

### node/index.tsx
```typescript
/**
 * Export DynamicNode for automatic rendering
 */
export { DynamicNode as default } from '@n2flowjs/flow/node/DynamicNode';
```

### form/index.tsx
```typescript
/**
 * Export DynamicForm for automatic form generation
 */
export { DynamicForm as default } from '@n2flowjs/flow/form/DynamicForm';
```

## Checklist

- [ ] Convert `config.properties` to `inputs` array
- [ ] Map property types to PortType enum
- [ ] Move `default` to `defaultValue`
- [ ] Add `metadata.inputType` for form rendering
- [ ] Update node/index.tsx to export DynamicNode
- [ ] Update form/index.tsx to export DynamicForm
- [ ] Test form rendering in UI
- [ ] Test node execution with new config structure

## Reference Implementation

See `packages/promt/definition.ts` for a complete working example.

## Common Pitfalls

1. **Forgetting metadata.inputType**: Form won't render correctly
2. **Using 'default' instead of 'defaultValue'**: Won't work
3. **Not filtering dynamic ports in DynamicForm**: Template variables shown as config
4. **Wrong PortType**: Use TEXT for most string fields, not STRING

## Migration Status

Run to check migration status:
```bash
node scripts/migrate-to-inputport.cjs --all
```

Current: ~66 packages need migration (as of 2025-01-04)
