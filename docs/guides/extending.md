# Developer Guide: Extending N2FLOW

Learn how to add custom functionality to the N2FLOW platform by creating new tools and validation rules.

## Adding a Custom Tool

Tools are the primary way to extend what an Agent can do. All tools must be registered in the `back-end/tools/index.ts` file.

### 1. Create the Handler
Create a new file in `back-end/tools/my-tool.ts`:

```typescript
import { ToolHandler } from './registry';

export const myToolHandler: ToolHandler = async (node, args, options) => {
  const { log } = options;
  const { someParam } = args;

  log(`My tool is running with param: ${someParam}`);
  
  // Perform your logic (e.g., call an API)
  const result = `Processed ${someParam}`;
  
  return result;
};
```

### 2. Register the Tool
In `back-end/tools/index.ts`, register your new handler:

```typescript
import { myToolHandler } from './my-tool';

ToolRegistry.register('MyCustomToolComponent', {
  handler: myToolHandler,
  metadata: {
    category: 'Custom',
    description: 'My custom business logic tool',
    requiredParams: ['someParam']
  }
});
```

### 3. Update the Frontend
To make the tool appear in the editor:
1.  Add a new node registration in `back-end/node-registry/index.ts` (if needed for custom UI/validation).
2.  The node will automatically appear in the "Add Node" menu if it's registered in the backend `NodeRegistry` or `ToolRegistry`.

## Adding Validation Rules

Validation rules help users catch errors before running a flow.

### 1. Create a Validation Rule
Add a new rule in `back-end/flow-validation/rules/my-rule.ts`:

```typescript
import { NodeValidator } from '../types';

export const validateMyNode: NodeValidator = (node, nodes, edges) => {
  const issues = [];
  const someValue = node.data?.params?.someValue;

  if (!someValue) {
    issues.push({
      nodeId: node.id,
      level: 'error',
      message: 'Some Value is required!',
    });
  }

  return issues;
};
```

### 2. Register the Rule
In `back-end/flow-validation/ruleRegistry.ts`, add your validator to the `validatorsByRuleKey` map.

### 3. Link to Node Type
In `back-end/node-registry/index.ts`, add the rule key to your node's `validationRules` array.

## Running Tests
Always add a test case for your new tool or rule in `back-end/tests/`. Run them using:

```bash
cd back-end
npm test
```
