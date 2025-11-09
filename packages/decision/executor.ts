/**
 * Decision Node Executor - Refactored using BaseNodeExecutor
 * Complex decision branching with multiple conditions and AND/OR logic
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { DecisionForm, DecisionBranch, ConditionGroup, DecisionCondition } from './types';

/**
 * Decision node executor - evaluates conditions and selects appropriate branch
 */
export class DecisionExecutor extends BaseNodeExecutor<DecisionForm> {
  constructor() {
    super({
      nodeType: 'decision',
      defaultRole: 'developer',
      checkInputReadiness: false, // Decision node evaluates available inputs
      templateFields: [], // Custom extraction in executeLogic
    });
  }

  /**
   * Execute decision logic - evaluate branches and select appropriate path
   */
  protected async executeLogic(form: DecisionForm, context: ExecutionContext): Promise<string> {
    const branches = form.branches || [];
    let selectedBranch = 'default';

    // Evaluate branches sequentially
    for (const branch of branches) {
      if (this.evaluateBranch(branch, context.resolvedInputs)) {
        selectedBranch = branch.name;
        break;
      }
    }

    console.log(`[Decision] Selected branch: ${selectedBranch}`);
    return selectedBranch;
  }

  /**
   * Evaluate a single branch (contains multiple condition groups)
   */
  private evaluateBranch(branch: DecisionBranch, inputs: Record<string, any>): boolean {
    if (!branch.groups || branch.groups.length === 0) {
      return false;
    }

    const groupResults = branch.groups.map(group => this.evaluateConditionGroup(group, inputs));
    const groupOperator = branch.groupOperator || 'AND';

    if (groupOperator === 'AND') {
      return groupResults.every(result => result);
    } else {
      return groupResults.some(result => result);
    }
  }

  /**
   * Evaluate a condition group (contains multiple conditions)
   */
  private evaluateConditionGroup(group: ConditionGroup, inputs: Record<string, any>): boolean {
    if (!group.conditions || group.conditions.length === 0) {
      return false;
    }

    const conditionResults = group.conditions.map(condition => this.evaluateCondition(condition, inputs));
    const logicalOperator = group.logicalOperator || 'AND';

    if (logicalOperator === 'AND') {
      return conditionResults.every(result => result);
    } else {
      return conditionResults.some(result => result);
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: DecisionCondition, inputs: Record<string, any>): boolean {
    const inputValue = inputs[condition.input];

    if (inputValue === undefined) {
      return false;
    }

    const val1 = String(inputValue);
    const val2 = String(condition.value);

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
}

// Export singleton instance
export const decisionExecutor = new DecisionExecutor();