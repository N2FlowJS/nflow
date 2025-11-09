/**
 * Decision Node - NEW ARCHITECTURE
 * 
 * Complex decision branching with multiple conditions.
 * Supports AND/OR logic, multiple branches, and default fallback.
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, createInputPort, createOutputPort } from '../@flow/ports';
import { DecisionForm, DecisionBranch, ConditionGroup, DecisionCondition } from './types';
import { decisionExecutor } from './executor';

/**
 * Get all inputs from branches
 */
function getInputsFromBranches(branches: DecisionBranch[]): string[] {
  const inputs: string[] = [];
  branches.forEach((b) => {
    if (b.groups)
      b.groups.forEach((g) => {
        if (g.conditions)
          g.conditions.forEach((c) => {
            if (!inputs.includes(c.input)) inputs.push(c.input);
          });
      });
  });
  return inputs;
}

/**
 * Decision Node Definition
 */
export const DecisionNodeDefinition: NodeDefinition<DecisionForm> = {
  // Metadata
  id: 'decision',
  name: 'Decision',
  category: NodeCategory.LOGIC,
  description: 'Complex decision branching with multiple conditions',
  version: '2.0.0',

  // Visual
  color: '#722ed1',
  tags: ['decision', 'branch', 'condition', 'logic', 'if'],

  // Input Ports (dynamic from branches)
  inputs: [],

  // Output Ports
  outputs: [
    createOutputPort('branch', 'Branch', PortType.TEXT, {
      description: 'Selected branch name',
      required: true,
    }),
  ],

  // Dynamic Input Ports from branch conditions
  getDynamicInputs: (config: DecisionForm) => {
    const branches = config?.branches || [];
    const inputNames = getInputsFromBranches(branches);

    return inputNames.map(name =>
      createInputPort(name, name, PortType.ANY, {
        description: `Input for condition: ${name}`,
        required: true,
        metadata: {
          isDynamic: true,
          sourceTemplate: 'branches',
        },
      })
    );
  },

  // Execution Logic
  async execute(context: any): Promise<NodeExecutionResult> {
    const { node, flowState, dispatcher } = context;
    
    // Convert to FlowExecutionContext format expected by BaseNodeExecutor
    const flowExecutionContext = { 
      flow: { nodes: [], edges: [] }, 
      flowState,
      input: { role: 'user' as const, content: '' } // Empty input for now
    };
    
    // Execute using the BaseNodeExecutor
    const result = await decisionExecutor.execute(node, flowExecutionContext, dispatcher);
    
    // Convert ExecutionResult to NodeExecutionResult format
    const statusMap: Record<string, 'success' | 'error' | 'in_progress'> = {
      'ended': 'success',
      'error': 'error',
      'in_progress': 'in_progress',
      'waiting': 'in_progress',
      'token': 'in_progress',
      'add_message': 'in_progress'
    };
    
    return {
      outputs: {
        branch: result.execution?.output || 'default',
      },
      status: statusMap[result.status] || 'in_progress',
      metadata: {
        startTime: result.execution?.startTime,
        endTime: result.execution?.endTime,
        branch: result.execution?.output,
        branchesEvaluated: (node.data?.form as DecisionForm)?.branches?.length || 0,
      },
    };
  },
};

export default DecisionNodeDefinition;
