// Register ts-node and tsconfig-paths for TS/paths support when running with `node -r` flags
import { executeNode } from '../utils/server/nodeExecution/executeNode';
import type { Flow } from '../models/flowTypes';
import type { FlowState } from '@n2flowjs/flow/type';
import { FlowStateDispatcher } from '@n2flowjs/flow/flow-state-dispatcher';

async function runVariableNode() {
  const flow: Flow = {
    nodes: [
      {
        id: 'var1',
        type: 'variable' as any,
        position: { x: 0, y: 0 },
        data: {
          id: 'var1',
          label: 'Variable Set',
          position: { x: 0, y: 0 },
          type: 'variable' as any,
          form: {
            name: 'Set foo',
            operation: 'set',
            variableName: 'foo',
            variableValue: 'hello-world',
          },
        },
      } as any,
      {
        id: 'log2',
        type: 'log' as any,
        position: { x: 100, y: 0 },
        data: {
          id: 'log2',
          label: 'Log',
          position: { x: 100, y: 0 },
          type: 'log' as any,
          form: { name: 'Log' },
        },
      } as any,
    ],
    edges: [{ id: 'e1', source: 'var1', target: 'log2' } as any],
  };

  const initState: FlowState = {
    currentNode: flow.nodes[0] as any,
    executionTime: 0,
    components: {
      var1: { type: 'variable' as any, output: '', executionTime: 0, inputFlow: [] },
      log2: { type: 'log' as any, output: '', executionTime: 0, inputFlow: [] },
    },
    variables: {},
    history: [],
  };

  const dispatcher = new FlowStateDispatcher(initState);
  const res = await executeNode(flow.nodes[0] as any, { flow, flowState: initState, input: { role: 'user', content: '' } as any }, undefined, dispatcher);
  console.log('[SMOKE] variable result status:', res.status);
  console.log('[SMOKE] variable nextNodes:', res.nextNodes);
  console.log('[SMOKE] variables:', dispatcher.getState().variables);
}

async function runWikipediaNode() {
  const flow: Flow = {
    nodes: [
      {
        id: 'wiki1',
        type: 'wikipediasearch' as any,
        position: { x: 0, y: 0 },
        data: {
          id: 'wiki1',
          label: 'Wikipedia Search',
          position: { x: 0, y: 0 },
          type: 'wikipediasearch' as any,
          form: {
            name: 'Lookup',
            query: 'OpenAI',
            maxResults: 3,
            summaryOnly: true,
          },
        },
      } as any,
      {
        id: 'log3',
        type: 'log' as any,
        position: { x: 100, y: 0 },
        data: {
          id: 'log3',
          label: 'Log',
          position: { x: 100, y: 0 },
          type: 'log' as any,
          form: { name: 'Log' },
        },
      } as any,
    ],
    edges: [{ id: 'e2', source: 'wiki1', target: 'log3' } as any],
  };

  const initState: FlowState = {
    currentNode: flow.nodes[0] as any,
    executionTime: 0,
    components: {
      wiki1: { type: 'wikipediasearch' as any, output: '', executionTime: 0, inputFlow: [] },
      log3: { type: 'log' as any, output: '', executionTime: 0, inputFlow: [] },
    },
    variables: {},
    history: [],
  };

  const dispatcher = new FlowStateDispatcher(initState);
  const res = await executeNode(flow.nodes[0] as any, { flow, flowState: initState, input: { role: 'user', content: '' } as any }, undefined, dispatcher);
  console.log('[SMOKE] wikipedia result status:', res.status);
  console.log('[SMOKE] wikipedia nextNodes:', res.nextNodes);
  console.log('[SMOKE] output length:', res.execution.output?.length ?? 0);
}

async function main() {
  await runVariableNode();
  await runWikipediaNode();
}

main().catch((e) => {
  console.error('[SMOKE] error:', e);
  process.exit(1);
});
