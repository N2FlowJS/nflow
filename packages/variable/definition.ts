/**
 * Variable Node - NEW ARCHITECTURE
 * 
 * Store, retrieve, and manipulate flow-level variables.
 * Supports set, get, delete, and append operations.
 * 
 * This node handles:
 * - Setting variables with template values
 * - Getting variables with default fallback
 * - Deleting variables from flow state
 * - Appending to array variables
 */

import {
  NodeDefinition,
  NodeCategory,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { VariableForm } from './types';
// import { getInputFromTemplate } from '@n2flowjs/template/template';
import { VariableNodeExecutor } from './executor';

/**
 * Variable Node Definition
 */
export const VariableNodeDefinition: NodeDefinition<VariableForm> = {
  // Metadata
  id: 'variable',
  name: 'Variable',
  category: NodeCategory.UTILITY,
  description: 'Store, retrieve, and manipulate flow-level variables',
  version: '2.0.0',

  // Visual
  color: '#13c2c2',
  tags: ['variable', 'storage', 'state', 'data', 'store'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      defaultValue: 'set',
      required: true,
      metadata: {
        inputType: 'select',
        options: ['set', 'get', 'delete', 'append'],
      },
    },
    {
      id: 'variableName',
      name: 'Variable Name',
      type: PortType.TEXT,
      defaultValue: '',
      required: true,
      metadata: {
        inputType: 'text',
      },
    },
  ],
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.TEXT,
      description: 'Operation result as JSON',
    },
    {
      id: 'value',
      name: 'Value',
      type: PortType.ANY,
      description: 'Variable value',
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Operation performed',
    },
  ],
  execute: async ({ node, flowState, dispatcher }) => {
    const executor = new VariableNodeExecutor();
  const execResult = await executor.execute(node, { flow: { nodes: [], edges: [] }, flowState, input: { role: 'system', content: '' } }, dispatcher);
    let outputs: Record<string, any> = {};
    try {
      outputs = JSON.parse(execResult.execution.output);
    } catch {
      outputs = { result: execResult.execution.output };
    }
    return {
      outputs,
      status: execResult.status as any,
      error: execResult.status === 'error' ? execResult.message : undefined,
      metadata: execResult.nodeInfo,
    };
  },
};

export default VariableNodeDefinition;
