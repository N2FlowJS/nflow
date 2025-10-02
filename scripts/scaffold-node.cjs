#!/usr/bin/env node
/* Minimal scaffolder for a new node package */
const fs = require('fs');
const path = require('path');

const name = (process.argv[2] || '').trim();
if (!name) {
  console.error('Usage: node scripts/scaffold-node.cjs <package-name>');
  process.exit(1);
}

const root = process.cwd();
const dir = path.join(root, 'packages', name);
if (fs.existsSync(dir)) {
  console.error('Package already exists:', name);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

const pascal = name
  .replace(/(^|[-_])(\w)/g, (_m, _a, c) => c.toUpperCase())
  .replace(/[^A-Za-z0-9]/g, '');

fs.writeFileSync(path.join(dir, '.nflow.json'), JSON.stringify({ enabled: true }, null, 2));

fs.writeFileSync(
  path.join(dir, 'index.ts'),
  `import { ${pascal}Plugin } from './${name}';
export { ${pascal}Plugin, ${pascal}Plugin as plugin };
export default ${pascal}Plugin;
`
);

fs.writeFileSync(
  path.join(dir, `${name}.ts`),
  `import { NodePlugin } from '../@node-plugin/type';
import { execute${pascal}Node } from './execute';

export const ${pascal}Plugin: NodePlugin = {
  name: '${name}',
  match: (n) => n?.data?.type === '${name}',
  run: (n, c, cb, d) => execute${pascal}Node(n, c, cb, d),
} as const;
`
);

fs.writeFileSync(
  path.join(dir, 'execute.ts'),
  `import type { ExecutionResult, FlowExecutionContext, FlowNode } from '@n2flowjs/flow';
import { findNextNodes, FlowStateDispatcher } from '@n2flowjs/flow';

export async function execute${pascal}Node(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const startTime = new Date().toISOString();
  const resultText = JSON.stringify({ message: '${name} executed' });

  let finalState = flowState;
  if (dispatcher) {
    dispatcher.setNodeOutput(node.id, resultText, '${name}');
    dispatcher.setCurrentNode(node);
    finalState = dispatcher.getState();
  } else {
    flowState.components[node.id]['output'] = resultText;
    flowState.components[node.id]['type'] = '${name}';
    flowState.components[node.id]['executionTime'] = Date.now();
    flowState.currentNode = node;
    finalState = flowState;
  }

  const nextNodes = findNextNodes(flow, node.id);
  return {
    status: 'in_progress',
    nextNodes,
    flowState: finalState,
    nodeInfo: {
      id: node.id,
      name: node.data?.label || node.id,
      type: '${name}' as any,
      role: 'developer',
    },
    execution: {
      nodeId: node.id,
      nodeName: node.data?.form?.name || node.id,
      startTime,
      endTime: new Date().toISOString(),
      output: resultText,
    },
  };
}
`
);

fs.writeFileSync(
  path.join(dir, 'types.ts'),
  `import { BaseForm, BaseNodeData } from '@n2flowjs/flow';

export interface ${pascal}Form extends BaseForm {
  name: string;
}

export type ${pascal}NodeData = BaseNodeData<${pascal}Form> & { type: '${name}' };

declare module '@n2flowjs/flow' {
  interface NodeDataMap { ${pascal}NodeData: ${pascal}NodeData; }
}
`
);

console.log('[scaffold] created package:', name);
