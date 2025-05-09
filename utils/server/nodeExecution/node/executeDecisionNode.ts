import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { ConditionGroup, DecisionBranch, DecisionCondition, DecisionNodeData, FlowNode } from '../../../../models/flowTypes';

function getInputFromBranch(branchs: DecisionBranch[]): string[] {
  const inputs: string[] = [];
  branchs.forEach((b) => {
    if (b.groups)
      b.groups.forEach((g) => {
        if (g.conditions)
          g.conditions.forEach((c) => {
            if (!inputs.find((p) => p == c.input)) inputs.push(c.input);
          });
      });
  });

  return inputs;
}
/**
 * Evaluates a single condition.
 */
function evaluateCondition(condition: DecisionCondition, inputs: Record<string, any>): boolean {
  const inputValue = inputs[condition.input]; // Assuming input ID corresponds to a key in inputs
  const conditionValue = condition.value;

  if (inputValue === undefined) {
    console.warn(`Input variable '${condition.input}' not found for condition evaluation.`);
    return false; // Or handle as needed, maybe throw error or return specific value
  }

  // Convert types if necessary for comparison (basic example)
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
      return parseFloat(val1) > parseFloat(val2); // Ensure numeric comparison
    case 'lessThan':
      return parseFloat(val1) < parseFloat(val2); // Ensure numeric comparison
    case 'startsWith':
      return val1.startsWith(val2);
    case 'endsWith':
      return val1.endsWith(val2);
    default:
      console.warn(`Unsupported operator: ${condition.operator}`);
      return false;
  }
}

/**
 * Evaluates a group of conditions based on the logical operator.
 */
function evaluateConditionGroup(group: ConditionGroup, inputs: Record<string, any>): boolean {
  if (!group.conditions || group.conditions.length === 0) {
    return true; // An empty group might be considered true, or handle as needed
  }

  const operator = group.logicalOperator || 'AND'; // Default to AND

  if (operator === 'AND') {
    return group.conditions.every((cond) => evaluateCondition(cond, inputs));
  } else {
    // OR
    return group.conditions.some((cond) => evaluateCondition(cond, inputs));
  }
}

/**
 * Evaluates a decision branch based on its condition groups.
 */
function evaluateBranch(branch: DecisionBranch, inputs: Record<string, any>): boolean {
  if (!branch.groups || branch.groups.length === 0) {
    return true; // An empty branch might be considered true, or handle as needed
  }

  const operator = branch.groupOperator || 'OR'; // Default to OR

  if (operator === 'AND') {
    return branch.groups.every((group) => evaluateConditionGroup(group, inputs));
  } else {
    // OR
    return branch.groups.some((group) => evaluateConditionGroup(group, inputs));
  }
}

/**
 * Handler for executing Decision nodes
 */
export async function executeDecisionNode(node: FlowNode, { flowState }: FlowExecutionContext): Promise<ExecutionResult> {
  const data = node.data as DecisionNodeData;
  const form = data.form || {};
  const nodeLabel = node.data?.label || node.id;
  const inputs = getInputFromBranch(form.branches);

  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });
  const branches = form.branches || [];
  let nextNodeId: string | null = null;
  let branchToUse = 'default';

  try {
    // Evaluate branches sequentially
    for (const branch of branches) {
      if (evaluateBranch(branch, vars)) {
        nextNodeId = branch.targetNode || null;
        flowState.components[node.id]['output'] = branch.name;
        branchToUse = branch.name;
        break; // Stop at the first matching branch
      }
    }

    // If no branch matched, use the default target
    if (!nextNodeId) {
      nextNodeId = form.defaultTarget;
      flowState.components[node.id]['output'] = 'default';
    }

    flowState.components[node.id]['type'] = 'decision';
    flowState.components[node.id]['executionTime'] = Date.now();
    flowState.currentNode = node;

    if (!nextNodeId) {
      throw new Error(`At the Node ${node.data.label} next node found in the flow`);
    }

    return {
      status: 'in_progress', // Or 'completed' if this is the final step for this node
      nextNodes: [nextNodeId],
      flowState,
      nodeInfo: { id: node.id, name: nodeLabel, type: 'decision', role: 'developer' },
      execution: { output: branchToUse, nodeId: node.id, nodeName: nodeLabel, startTime: new Date().toISOString() },
    };
  } catch (error: unknown) {
    console.error(`Error executing decision node '${nodeLabel}':`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during decision evaluation';
    return {
      nextNodes: [],
      status: 'error',
      message: `Error in decision node '${nodeLabel}': ${errorMessage}`,
      flowState,
      nodeInfo: { id: node.id, name: nodeLabel, type: 'decision', role: 'developer' },
      execution: { output: `Error: ${errorMessage}`, nodeId: node.id, nodeName: nodeLabel, startTime: new Date().toISOString(), endTime: new Date().toISOString() },
    };
  }
}
