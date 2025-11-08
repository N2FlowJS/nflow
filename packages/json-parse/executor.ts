import { BaseNodeExecutor } from '../@node-plugin/base-executor';
import { JsonParseForm } from './types';

function extractFromPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const key = arrayMatch[1];
      const index = parseInt(arrayMatch[2], 10);
      current = current[key];
      if (Array.isArray(current)) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }
  return current;
}

export class JsonParseExecutor extends BaseNodeExecutor<JsonParseForm> {
  constructor() {
    super({
      nodeType: 'json-parse',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['jsonData', 'jsonPath'],
    });
  }

  protected async executeLogic(form: JsonParseForm): Promise<string> {
    const processedJsonData = form.jsonData;
    const processedJsonPath = form.jsonPath || '';
    let result: any;
    switch (form.operation) {
      case 'parse':
        try {
          result = JSON.parse(processedJsonData);
        } catch (error) {
          throw new Error(`Invalid JSON data: ${error instanceof Error ? error.message : 'Parse error'}`);
        }
        break;
      case 'stringify':
        try {
          const data = JSON.parse(processedJsonData);
          result = JSON.stringify(data, null, 2);
        } catch (error) {
          result = processedJsonData;
        }
        break;
      case 'extract':
        if (!processedJsonPath) {
          throw new Error('JSON path is required for extract operation');
        }
        try {
          const data = JSON.parse(processedJsonData);
          result = extractFromPath(data, processedJsonPath);
        } catch (error) {
          throw new Error(`Failed to extract from JSON path: ${error instanceof Error ? error.message : 'Extract error'}`);
        }
        break;
      case 'validate':
        try {
          JSON.parse(processedJsonData);
          result = { valid: true, message: 'Valid JSON' };
        } catch (error) {
          result = { valid: false, message: error instanceof Error ? error.message : 'Invalid JSON' };
        }
        break;
      default:
        throw new Error(`Unsupported JSON operation: ${form.operation}`);
    }
    if (form.outputFormat === 'string' || typeof result === 'string') {
      return String(result);
    } else {
      return JSON.stringify(result, null, 2);
    }
  }
}
