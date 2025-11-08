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

/**
 * Evaluate a single condition
 */
function evaluateCondition(condition: DecisionCondition, inputs: Record<string, any>): boolean {
  const inputValue = inputs[condition.input];
  const conditionValue = condition.value;

  if (inputValue === undefined) {
    return false;
  }

  const val1 = String(inputValue);
  const val2 = String(conditionValue);

  switch (condition.operator) {
    case 'equals':
      return val1 === val2;
    case 'notEquals':
      return val1 !== val2;
    case 'contains':
      return val1.includes(val2);
    case 'greaterThan':
      return parseFloat(val1) > parseFloat(val2);
    case 'lessThan':
      return parseFloat(val1) < parseFloat(val2);
    case 'startsWith':
      return val1.startsWith(val2);
    case 'endsWith':
      return val1.endsWith(val2);
    default:
      return false;
  }
}

/**
 * Evaluate condition group
 */
function evaluateConditionGroup(group: ConditionGroup, inputs: Record<string, any>): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true;
  }

  const operator = group.logicalOperator || 'AND';

  if (operator === 'AND') {
    return group.conditions.every((cond) => evaluateCondition(cond, inputs));
  } else {
    return group.conditions.some((cond) => evaluateCondition(cond, inputs));
  }
}

/**
 * Evaluate branch
 */
function evaluateBranch(branch: DecisionBranch, inputs: Record<string, any>): boolean {
  if (!branch.groups || branch.groups.length === 0) {
    return true;
  }

  const operator = branch.groupOperator || 'OR';

  if (operator === 'AND') {
    return branch.groups.every((group) => evaluateConditionGroup(group, inputs));
  } else {
    return branch.groups.some((group) => evaluateConditionGroup(group, inputs));
  }
}

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
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      const branches = config.branches || [];
      let branchName = 'default';

      // Evaluate branches sequentially
      for (const branch of branches) {
        if (evaluateBranch(branch, inputs)) {
          branchName = branch.name;
          break;
        }
      }

      console.log(`[Decision] Selected branch: ${branchName}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, branchName, 'decision');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          branch: branchName,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          branch: branchName,
          branchesEvaluated: branches.length,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          branch: 'error',
        },
        status: 'error',
        error: `Decision evaluation failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default DecisionNodeDefinition;
