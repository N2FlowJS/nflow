/**
 * Condition Node - NEW ARCHITECTURE
 * 
 * Evaluate conditions and control flow based on boolean logic.
 * Supports multiple expressions with AND/OR logic.
 * 
 * This node handles:
 * - Multiple comparison operators (==, !=, >, <, >=, <=)
 * - String operations (contains, starts_with, ends_with, regex)
 * - Array operations (in, not_in)
 * - Template variables in left and right values
 * - AND/OR logic for multiple expressions
 */

import {
  NodeDefinition,
  NodeCategory,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports';
import { ConditionForm } from './types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

/**
 * Condition Node Definition
 */
export const ConditionNodeDefinition: NodeDefinition<ConditionForm> = {
  // Metadata
  id: 'condition',
  name: 'Condition',
  category: NodeCategory.LOGIC,
  description: 'Evaluate conditional expressions with multiple operators and logic modes',
  version: '2.0.0',

  // Visual
  color: '#faad14',
  tags: ['condition', 'logic', 'if', 'comparison', 'branch'],

  // Input Ports (Configuration)
  inputs: [
    {
      id: 'logic',
      name: 'Logic Mode',
      type: PortType.TEXT,
      defaultValue: 'all',
      required: false,
      metadata: {
        inputType: 'select',
        options: ['all', 'any'],
      },
    },
    {
      id: 'expressions',
      name: 'Expressions',
      type: PortType.JSON,
      defaultValue: [],
      required: true,
      metadata: {
        inputType: 'textarea',
        rows: 6,
        placeholder: '[{"left": "{var}", "operator": "==", "right": "value"}]',
      },
    },
  ],

  // Output Ports
  outputs: [
    {
      id: 'result',
      name: 'Result',
      type: PortType.BOOLEAN,
      description: 'Condition evaluation result (true/false)',
    },
    {
      id: 'details',
      name: 'Details',
      type: PortType.TEXT,
      description: 'Detailed evaluation information',
    },
  ],

  // Dynamic Input Ports - Generated from expression template variables
  getDynamicInputs: (config: ConditionForm) => {
    const variables = new Set<string>();
    
    // Extract from all expressions
    config?.expressions?.forEach(expr => {
      // Extract from left value
      if (expr.left) {
        getInputFromTemplate(expr.left).forEach(v => variables.add(v));
      }
      
      // Extract from right value if it's a string
      if (typeof expr.right === 'string') {
        getInputFromTemplate(expr.right).forEach(v => variables.add(v));
      }
    });
    
    // Create InputPort for each variable
    return Array.from(variables)
      .sort()
      .map(varName => ({
        id: varName,
        name: varName,
        type: PortType.TEXT,
        description: `Template variable from expressions: {${varName}}`,
        required: false,
        metadata: {
          isDynamic: true,
          sourceTemplate: `{${varName}}`,
        },
      }));
  },

  // Execution Logic
  async execute({ node, config, inputs, dispatcher }): Promise<NodeExecutionResult> {
    const startTime = new Date().toISOString();

    try {
      // Get expressions from inputs or config
      const expressions = inputs.expressions || config.expressions;
      const logic = inputs.logic || config.logic || 'all';

      // Validate
      if (!expressions || !Array.isArray(expressions) || expressions.length === 0) {
        throw new Error('No expressions defined for condition');
      }

      // Extract all template variables
      const templateVars = new Set<string>();
      expressions.forEach((expr: any) => {
        if (expr.left) {
          getInputFromTemplate(expr.left).forEach(v => templateVars.add(v));
        }
        if (typeof expr.right === 'string') {
          getInputFromTemplate(expr.right).forEach(v => templateVars.add(v));
        }
      });

      // Build variable map from inputs
      const vars: Record<string, string> = {};
      templateVars.forEach(varName => {
        if (inputs[varName] !== undefined) {
          vars[varName] = String(inputs[varName]);
        }
      });

      // Evaluate each expression
      const evaluationDetails: Array<{
        expression: string;
        result: boolean;
        left: any;
        operator: string;
        right: any;
      }> = [];

      const results = expressions.map((expr: any) => {
        const leftProcessed = processTemplate(expr.left, vars);
        let rightProcessed: any;
        
        if (typeof expr.right === 'string') {
          rightProcessed = processTemplate(String(expr.right), vars);
        } else {
          rightProcessed = expr.right;
        }

        const op = expr.operator;
        let outcome = false;

        switch (op) {
          case '==': 
            outcome = leftProcessed == rightProcessed; 
            break;
          case '!=': 
            outcome = leftProcessed != rightProcessed; 
            break;
          case '>': 
            outcome = Number(leftProcessed) > Number(rightProcessed); 
            break;
          case '>=': 
            outcome = Number(leftProcessed) >= Number(rightProcessed); 
            break;
          case '<': 
            outcome = Number(leftProcessed) < Number(rightProcessed); 
            break;
          case '<=': 
            outcome = Number(leftProcessed) <= Number(rightProcessed); 
            break;
          case 'contains': 
            outcome = String(leftProcessed).includes(String(rightProcessed)); 
            break;
          case 'not_contains': 
            outcome = !String(leftProcessed).includes(String(rightProcessed)); 
            break;
          case 'starts_with': 
            outcome = String(leftProcessed).startsWith(String(rightProcessed)); 
            break;
          case 'ends_with': 
            outcome = String(leftProcessed).endsWith(String(rightProcessed)); 
            break;
          case 'regex': {
            const regex = new RegExp(String(rightProcessed));
            outcome = regex.test(String(leftProcessed));
            break;
          }
          case 'in': 
            outcome = Array.isArray(expr.right) 
              ? expr.right.includes(leftProcessed) 
              : String(rightProcessed).split(',').includes(leftProcessed); 
            break;
          case 'not_in': 
            outcome = Array.isArray(expr.right) 
              ? !expr.right.includes(leftProcessed) 
              : !String(rightProcessed).split(',').includes(leftProcessed); 
            break;
          default:
            throw new Error(`Unsupported operator: ${op}`);
        }

        evaluationDetails.push({
          expression: `${leftProcessed} ${op} ${rightProcessed}`,
          result: outcome,
          left: leftProcessed,
          operator: op,
          right: rightProcessed,
        });

        return outcome;
      });

      // Apply logic mode
      const conditionResult = logic === 'all' 
        ? results.every(Boolean) 
        : results.some(Boolean);

      const detailsText = JSON.stringify({
        logic,
        expressions: evaluationDetails,
        finalResult: conditionResult,
      }, null, 2);

      console.log(`[Condition] ${node.id} => ${conditionResult}`);

      // Update state via dispatcher
      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, String(conditionResult), 'condition');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result: conditionResult,
          details: detailsText,
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          logic,
          expressionCount: expressions.length,
          finalResult: conditionResult,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        outputs: {
          result: false,
          details: '',
        },
        status: 'error',
        error: `Condition evaluation failed: ${errorMessage}`,
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage,
        },
      };
    }
  },
};

export default ConditionNodeDefinition;
