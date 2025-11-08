import { BaseNodeExecutor } from '../@node-plugin/base-executor';
import { CounterForm } from './types';

const counters: Map<string, number> = new Map();

export class CounterNodeExecutor extends BaseNodeExecutor<CounterForm> {
  constructor() {
    super({
      nodeType: 'counter',
      defaultRole: 'developer',
      checkInputReadiness: false,
      templateFields: [],
    });
  }

  protected async executeLogic(form: CounterForm): Promise<string> {
    const counterName = form.counterName || 'defaultCounter';
    const operation = form.operation || 'increment';
    const stepValue = form.stepValue || 1;
    const initialValue = form.initialValue || 0;
    const maxValue = form.maxValue;
    const minValue = form.minValue;

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

    counters.set(counterName, newValue);

    const result = {
      counterName,
      operation,
      previousValue: currentValue,
      currentValue: newValue,
      stepValue,
      constraints: { maxValue, minValue },
    };

    return JSON.stringify({
      currentValue: newValue,
      previousValue: currentValue,
      result,
    });
  }
}
