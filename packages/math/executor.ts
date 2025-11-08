import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { MathForm } from './types';

export class MathExecutor extends BaseNodeExecutor<MathForm> {
  constructor() {
    super({
      nodeType: 'math',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['value1', 'value2'],
    });
  }

  protected async executeLogic(form: MathForm, context: ExecutionContext): Promise<string> {
    // Extract and process template variables
    const value1Str = this.processTemplate(form.value1 ?? '0', context);
    const value2Str = this.processTemplate(form.value2 ?? '0', context);
    const operation = form.operation ?? 'add';
    const precision = form.precision ?? 2;

    const value1 = parseFloat(value1Str);
    const value2 = parseFloat(value2Str);

    if (isNaN(value1)) throw new Error(`Invalid number for value1: ${value1Str}`);
    if (form.value2 && isNaN(value2)) throw new Error(`Invalid number for value2: ${value2Str}`);

    let result: number;
    switch (operation) {
      case 'add': result = value1 + value2; break;
      case 'subtract': result = value1 - value2; break;
      case 'multiply': result = value1 * value2; break;
      case 'divide':
        if (value2 === 0) throw new Error('Division by zero');
        result = value1 / value2; break;
      case 'power': result = Math.pow(value1, value2); break;
      case 'sqrt':
        if (value1 < 0) throw new Error('Square root of negative number');
        result = Math.sqrt(value1); break;
      case 'abs': result = Math.abs(value1); break;
      case 'round': result = Math.round(value1); break;
      case 'min': result = Math.min(value1, value2); break;
      case 'max': result = Math.max(value1, value2); break;
      default: throw new Error(`Unsupported operation: ${operation}`);
    }
    const formattedResult = parseFloat(result.toFixed(precision));
    return JSON.stringify({ result: formattedResult, resultText: String(formattedResult) });
  }
}

export const mathExecutor = new MathExecutor();
