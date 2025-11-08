import {
  NodeCategory,
  NodeDefinition,
} from '../@node-plugin/type';
import { PortType, InputPort, OutputPort } from '../@flow/ports/types';
import { CounterNodeExecutor } from './executor';

// (Legacy in-memory counter storage removed; now handled in executor)

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

  async execute(context) {
    // Delegate to new executor
    const executor = new CounterNodeExecutor();
    const { node, flowState, dispatcher } = context;
    // Compose minimal FlowExecutionContext
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
  }
};
