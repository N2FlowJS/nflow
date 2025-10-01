import type { FlowNode } from '../../models/nodeDataMap';
import type { ConditionNodeData, ConditionForm } from './types';
import { findNextNodes, ResultWaiting } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow';
import { ExecutionResult, FlowExecutionContext } from '../@flow';

/**
 * Handler for executing Condition nodes
 */
export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as ConditionNodeData;
  const form = (data.form || {}) as ConditionForm;
  const startTime = new Date().toISOString();

  // Extract variables from left and right value templates
  // Collect inputs from all expression templates
  const inputs: string[] = [];
  form.expressions?.forEach(expr => {
    inputs.push(...getInputFromTemplate(expr.left || ''));
    if (typeof expr.right === 'string') {
      inputs.push(...getInputFromTemplate(expr.right || ''));
    }
  });
  
  if (!isNodeReady(inputs, flowState)) {
    return ResultWaiting(node, flowState, startTime);
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required fields
    if (!form.expressions || form.expressions.length === 0) {
      throw new Error('No expressions defined for condition');
    }

    // Evaluate each expression sequentially
    const results = form.expressions.map(expr => {
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
        case '==': outcome = leftProcessed == rightProcessed; break; // intentional non-strict for template flexibility
        case '!=': outcome = leftProcessed != rightProcessed; break;
        case '>': outcome = Number(leftProcessed) > Number(rightProcessed); break;
        case '>=': outcome = Number(leftProcessed) >= Number(rightProcessed); break;
        case '<': outcome = Number(leftProcessed) < Number(rightProcessed); break;
        case '<=': outcome = Number(leftProcessed) <= Number(rightProcessed); break;
        case 'contains': outcome = String(leftProcessed).includes(String(rightProcessed)); break;
        case 'not_contains': outcome = !String(leftProcessed).includes(String(rightProcessed)); break;
        case 'starts_with': outcome = String(leftProcessed).startsWith(String(rightProcessed)); break;
        case 'ends_with': outcome = String(leftProcessed).endsWith(String(rightProcessed)); break;
        case 'regex': {
          const regex = new RegExp(String(rightProcessed));
          outcome = regex.test(String(leftProcessed));
          break;
        }
        case 'in': outcome = Array.isArray(expr.right) ? expr.right.includes(leftProcessed) : String(rightProcessed).split(',').includes(leftProcessed); break;
        case 'not_in': outcome = Array.isArray(expr.right) ? !expr.right.includes(leftProcessed) : !String(rightProcessed).split(',').includes(leftProcessed); break;
        default:
          throw new Error(`Unsupported operator: ${op}`);
      }
      return outcome;
    });

    const conditionResult = form.logic === 'all' ? results.every(Boolean) : results.some(Boolean);
    const result = String(conditionResult);
    console.log(`Condition node completed: ${node.id} => ${result}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
  dispatcher.setNodeOutput(node.id, result, 'condition');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = result;
      flowState.components[node.id]['type'] = 'condition';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'condition',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: result,
      },
    };
  } catch (error: unknown) {
    console.error('Condition execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown condition error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Condition failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'condition',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}
