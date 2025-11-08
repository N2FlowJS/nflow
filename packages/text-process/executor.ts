import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { TextProcessForm } from './types';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class TextProcessExecutor extends BaseNodeExecutor<TextProcessForm> {
  constructor() {
    super({
      nodeType: 'textprocess',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: [
        'inputText',
        'searchValue',
        'replaceValue',
        'separator',
        'regexPattern',
      ],
    });
  }

  protected async executeLogic(form: TextProcessForm, context: ExecutionContext): Promise<string> {
    let inputText = form.inputText;
    let searchValue = form.searchValue || '';
    let replaceValue = form.replaceValue || '';
    let separator = form.separator || '';
    let regexPattern = form.regexPattern || '';
    let result: string = '';

    // Template processing
    if (typeof inputText === 'string') {
      inputText = this.processTemplate(inputText, context);
    }
    if (typeof searchValue === 'string') {
      searchValue = this.processTemplate(searchValue, context);
    }
    if (typeof replaceValue === 'string') {
      replaceValue = this.processTemplate(replaceValue, context);
    }
    if (typeof separator === 'string') {
      separator = this.processTemplate(separator, context);
    }
    if (typeof regexPattern === 'string') {
      regexPattern = this.processTemplate(regexPattern, context);
    }

    switch (form.operation) {
      case 'uppercase':
        result = String(inputText).toUpperCase();
        break;
      case 'lowercase':
        result = String(inputText).toLowerCase();
        break;
      case 'trim':
        result = String(inputText).trim();
        break;
      case 'replace':
        if (!searchValue) {
          throw new Error('Search value is required for replace operation');
        }
        result = String(inputText).replace(new RegExp(escapeRegex(searchValue), 'g'), replaceValue);
        break;
      case 'split':
        if (!separator) {
          throw new Error('Separator is required for split operation');
        }
        result = JSON.stringify(String(inputText).split(separator), null, 2);
        break;
      case 'join':
        try {
          const arrayData = JSON.parse(String(inputText));
          if (!Array.isArray(arrayData)) {
            throw new Error('Input must be a JSON array for join operation');
          }
          result = arrayData.join(separator || ',');
        } catch (error) {
          throw new Error(`Failed to parse input as JSON array: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
        break;
      case 'regex':
        if (!regexPattern) {
          throw new Error('Regex pattern is required for regex operation');
        }
        try {
          const regex = new RegExp(regexPattern, form.regexFlags || 'g');
          const matches = String(inputText).match(regex);
          result = matches ? JSON.stringify(matches, null, 2) : '[]';
        } catch (error) {
          throw new Error(`Invalid regex pattern: ${error instanceof Error ? error.message : 'Regex error'}`);
        }
        break;
      case 'substring':
        const startIndex = form.startIndex || 0;
        const endIndex = form.endIndex;
        result = String(inputText).substring(startIndex, endIndex);
        break;
      case 'length':
        result = String(String(inputText).length);
        break;
      default:
        throw new Error(`Unsupported operation: ${form.operation}`);
    }
    return result;
  }
}

// No default export
