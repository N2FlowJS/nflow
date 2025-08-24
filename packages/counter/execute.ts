import { CounterNodeData } from './types';
import { FlowNode } from '../../models/flowTypes';
import { ExecutionResult, findNextNodes, FlowExecutionContext, FlowStateDispatcher } from '@n2flowjs/flow';

// In-memory counter storage (in production, this could be database or Redis)
const counters: Map<string, number> = new Map();

export async function execute(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as CounterNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  try {
    console.log(`Executing Counter node: ${node.id} with operation: ${form.operation}`);

    const counterName = form.counterName || 'defaultCounter';
    const operation = form.operation || 'increment';
    const stepValue = form.stepValue || 1;
    const initialValue = form.initialValue || 0;
    const maxValue = form.maxValue;
    const minValue = form.minValue;

    // Get current counter value or initialize it
    let currentValue = counters.get(counterName) ?? initialValue;

    let newValue = currentValue;

    switch (operation) {
      case 'increment':
        newValue = currentValue + stepValue;
        
        // Check max value constraint
        if (maxValue !== undefined && newValue > maxValue) {
          newValue = maxValue;
        }
        break;

      case 'decrement':
        newValue = currentValue - stepValue;
        
        // Check min value constraint
        if (minValue !== undefined && newValue < minValue) {
          newValue = minValue;
        }
        break;

      case 'reset':
        newValue = initialValue;
        break;

      case 'set':
        newValue = initialValue;
        
        // Check constraints for set operation
        if (maxValue !== undefined && newValue > maxValue) {
          newValue = maxValue;
        }
        if (minValue !== undefined && newValue < minValue) {
          newValue = minValue;
        }
        break;

      default:
        throw new Error(`Unsupported counter operation: ${operation}`);
    }

    // Update counter in storage
    counters.set(counterName, newValue);

    const result = {
      counterName: counterName,
      operation: operation,
      previousValue: currentValue,
      currentValue: newValue,
      stepValue: stepValue,
      constraints: {
        maxValue: maxValue,
        minValue: minValue,
      },
    };

    const resultText = JSON.stringify(result, null, 2);

    console.log(`Counter node completed: ${node.id}, value: ${newValue}`, resultText);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, newValue.toString(), 'counter');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = newValue.toString();
      flowState.components[node.id]['type'] = 'counter';
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
        type: 'counter',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: newValue.toString(),
      },
    };
  } catch (error: unknown) {
    console.error('Counter execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown counter error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Counter operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'counter',
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

// Helper function to get current counter value (for external access)
export function getCounterValue(counterName: string): number | undefined {
  return counters.get(counterName);
}

// Helper function to set counter value (for external access)
export function setCounterValue(counterName: string, value: number): void {
  counters.set(counterName, value);
}

// Helper function to reset all counters (for testing/cleanup)
export function resetAllCounters(): void {
  counters.clear();
}
