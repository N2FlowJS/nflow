import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { TextUppercaseForm } from './types';

export class TextUppercaseExecutor extends BaseNodeExecutor<TextUppercaseForm> {
  constructor() {
    super({
      nodeType: 'text-uppercase',
      defaultRole: 'developer',
      checkInputReadiness: false,
      templateFields: [],
    });
  }

  protected async executeLogic(_: TextUppercaseForm, context: ExecutionContext): Promise<string> {
    // The input text is expected to be in context.resolvedInputs.text
    const text = context.resolvedInputs.text || '';
    return text.toUpperCase();
  }
}

export default TextUppercaseExecutor;
