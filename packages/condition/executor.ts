/**
 * Condition Node Executor - Refactored using BaseNodeExecutor
 * Evaluates conditional expressions for flow branching
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { ConditionForm } from './types';

/**
 * Condition node executor - evaluates boolean expressions
 */
export class ConditionExecutor extends BaseNodeExecutor<ConditionForm> {
  constructor() {
    super({
      nodeType: 'condition',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [], // Custom extraction in extractTemplateVariables
    });
  }

  /**
   * Override to extract variables from all expressions
   */
  protected extractTemplateVariables(form: ConditionForm): string[] {
    const variables: string[] = [];

    form.expressions?.forEach((expr) => {
      // Extract from left value
      if (typeof expr.left === 'string') {
        const leftVars = this.extractVarsFromString(expr.left);
        variables.push(...leftVars);
      }

      // Extract from right value (if string)
      if (typeof expr.right === 'string') {
        const rightVars = this.extractVarsFromString(expr.right);
        variables.push(...rightVars);
      }
    });

    return [...new Set(variables)]; // Remove duplicates
  }

  /**
   * Extract {variable} syntax from string
   */
  private extractVarsFromString(str: string): string[] {
    const matches = str.match(/\{([^}]+)\}/g);
    if (!matches) return [];
    return matches.map((m) => m.slice(1, -1)); // Remove { }
  }

  /**
   * Execute condition evaluation logic
   */
  protected async executeLogic(form: ConditionForm, context: ExecutionContext): Promise<string> {
    // Validate expressions exist
    if (!form.expressions || form.expressions.length === 0) {
      throw new Error('No expressions defined for condition');
    }

    console.log(
      `[Condition] Node ${context.node.id}: Evaluating ${form.expressions.length} expression(s) with logic: ${form.logic}`
    );

    // Evaluate each expression
    const results = form.expressions.map((expr, index) => {
      const leftProcessed = this.processTemplate(expr.left, context);
      let rightProcessed: any;

      if (typeof expr.right === 'string') {
        rightProcessed = this.processTemplate(expr.right, context);
      } else {
        rightProcessed = expr.right;
      }

      const outcome = this.evaluateExpression(leftProcessed, expr.operator, rightProcessed);

      console.log(
        `[Condition] Expression ${index + 1}: "${leftProcessed}" ${expr.operator} "${rightProcessed}" = ${outcome}`
      );

      return outcome;
    });

    // Apply logic (all/any)
    const conditionResult = form.logic === 'all' ? results.every(Boolean) : results.some(Boolean);

    console.log(`[Condition] Final result (${form.logic}): ${conditionResult}`);

    return String(conditionResult);
  }

  /**
   * Evaluate single expression based on operator
   */
  private evaluateExpression(left: string, operator: string, right: any): boolean {
    switch (operator) {
      case '==':
        // Intentional non-strict for template flexibility
        return left == right;

      case '!=':
        return left != right;

      case '>':
        return Number(left) > Number(right);

      case '>=':
        return Number(left) >= Number(right);

      case '<':
        return Number(left) < Number(right);

      case '<=':
        return Number(left) <= Number(right);

      case 'contains':
        return String(left).includes(String(right));

      case 'not_contains':
        return !String(left).includes(String(right));

      case 'starts_with':
        return String(left).startsWith(String(right));

      case 'ends_with':
        return String(left).endsWith(String(right));

      case 'regex':
        try {
          const regex = new RegExp(String(right));
          return regex.test(String(left));
        } catch (error) {
          console.error(`[Condition] Invalid regex: ${right}`, error);
          return false;
        }

      case 'in':
        if (Array.isArray(right)) {
          return right.includes(left);
        } else {
          // Parse comma-separated string
          const values = String(right).split(',').map((v) => v.trim());
          return values.includes(left);
        }

      case 'not_in':
        if (Array.isArray(right)) {
          return !right.includes(left);
        } else {
          const values = String(right).split(',').map((v) => v.trim());
          return !values.includes(left);
        }

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
}

// Export singleton instance
export const conditionExecutor = new ConditionExecutor();
