import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';

// In-memory counter storage
const counters: Map<string, number> = new Map();

/**
 * Counter Node Definition
 * 
 * Manages numeric counters with increment/decrement/reset operations.
 * Useful for loops, iterations, tracking, and state management.
 * 
 * Configuration:
 * - counterName: Unique counter identifier
 * - operation: increment | decrement | reset | set
 * - stepValue: Amount to change (default: 1)
 * - initialValue: Starting value (default: 0)
 * - maxValue: Maximum allowed value (optional)
 * - minValue: Minimum allowed value (optional)
 * 
 * Features:
 * - Named counters (multiple counters supported)
 * - Constraints (min/max values)
 * - Persistent across flow execution
 * - Returns previous and current values
 * 
 * Operations:
 * - increment: Add stepValue to counter
 * - decrement: Subtract stepValue from counter
 * - reset: Set to initialValue
 * - set: Set to specific value
 * 
 * Example:
 * ```json
 * {
 *   "counterName": "loopCounter",
 *   "operation": "increment",
 *   "stepValue": 1,
 *   "initialValue": 0,
 *   "maxValue": 100
 * }
 * ```
 */
export const CounterNodeDefinition: NodeDefinition = {
  id: 'counter',
  name: 'Counter',
  category: NodeCategory.UTILITY,
  description: 'Manage numeric counters with increment/decrement/reset operations',
  version: '1.0.0',

  inputs: [
    {
      id: 'counterName',
      name: 'Counter Name',
      type: PortType.TEXT,
      description: 'Unique identifier for this counter',
      required: true,
      defaultValue: 'defaultCounter',
      metadata: { inputType: 'text', placeholder: 'defaultCounter' },
    },
    {
      id: 'operation',
      name: 'Operation',
      type: PortType.TEXT,
      description: 'Counter operation',
      required: true,
      defaultValue: 'increment',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Increment', value: 'increment' },
          { label: 'Decrement', value: 'decrement' },
          { label: 'Reset', value: 'reset' },
          { label: 'Set', value: 'set' },
        ],
      },
    },
    {
      id: 'stepValue',
      name: 'Step Value',
      type: PortType.NUMBER,
      description: 'Amount to increment/decrement',
      required: false,
      defaultValue: 1,
      metadata: { inputType: 'number' },
    },
    {
      id: 'initialValue',
      name: 'Initial Value',
      type: PortType.NUMBER,
      description: 'Starting value or reset value',
      required: false,
      defaultValue: 0,
      metadata: { inputType: 'number' },
    },
    {
      id: 'maxValue',
      name: 'Max Value',
      type: PortType.NUMBER,
      description: 'Maximum allowed value (optional)',
      required: false,
      metadata: { inputType: 'number' },
    },
    {
      id: 'minValue',
      name: 'Min Value',
      type: PortType.NUMBER,
      description: 'Minimum allowed value (optional)',
      required: false,
      metadata: { inputType: 'number' },
    },
  ] as InputPort[],

  outputs: [
    {
      id: 'currentValue',
      name: 'Current Value',
      type: PortType.NUMBER,
      description: 'Updated counter value',
    },
    {
      id: 'previousValue',
      name: 'Previous Value',
      type: PortType.NUMBER,
      description: 'Value before operation',
    },
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Complete counter operation result',
    },
  ] as OutputPort[],

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, dispatcher, node } = context;
    const startTime = new Date().toISOString();

    try {
      const counterName = (config.counterName as string) || 'defaultCounter';
      const operation = (config.operation as string) || 'increment';
      const stepValue = (config.stepValue as number) || 1;
      const initialValue = (config.initialValue as number) || 0;
      const maxValue = config.maxValue as number | undefined;
      const minValue = config.minValue as number | undefined;

      // Get current counter value or initialize it
      let currentValue = counters.get(counterName) ?? initialValue;
      let newValue = currentValue;

      switch (operation) {
        case 'increment':
          newValue = currentValue + stepValue;
          if (maxValue !== undefined && newValue > maxValue) {
            newValue = maxValue;
          }
          break;

        case 'decrement':
          newValue = currentValue - stepValue;
          if (minValue !== undefined && newValue < minValue) {
            newValue = minValue;
          }
          break;

        case 'reset':
          newValue = initialValue;
          break;

        case 'set':
          newValue = initialValue;
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

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, newValue.toString(), 'counter');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          currentValue: newValue,
          previousValue: currentValue,
          result: result
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          counterName,
          operation,
          changed: newValue !== currentValue
        }
      };
    } catch (error: unknown) {
      console.error('Counter node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown counter error';

      return {
        outputs: {
          currentValue: 0,
          previousValue: 0,
          result: { error: errorMessage }
        },
        status: 'error',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          error: errorMessage
        }
      };
    }
  }
};
