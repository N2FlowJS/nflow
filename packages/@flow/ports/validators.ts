// Default validators for each port type

import { PortType, PortValidator } from './types';

/**
 * Validator for TEXT type
 */
const textValidator: PortValidator = (value) => ({
  valid: typeof value === 'string',
  error: typeof value === 'string' ? undefined : 'Expected string value',
});

/**
 * Validator for NUMBER type
 */
const numberValidator: PortValidator = (value) => ({
  valid: typeof value === 'number' && !isNaN(value),
  error: typeof value === 'number' && !isNaN(value) ? undefined : 'Expected numeric value',
});

/**
 * Validator for BOOLEAN type
 */
const booleanValidator: PortValidator = (value) => ({
  valid: typeof value === 'boolean',
  error: typeof value === 'boolean' ? undefined : 'Expected boolean value',
});

/**
 * Validator for JSON type
 */
const jsonValidator: PortValidator = (value) => {
  const valid = typeof value === 'object' && value !== null && !Array.isArray(value);
  return {
    valid,
    error: valid ? undefined : 'Expected JSON object',
  };
};

/**
 * Validator for ARRAY type
 */
const arrayValidator: PortValidator = (value) => ({
  valid: Array.isArray(value),
  error: Array.isArray(value) ? undefined : 'Expected array',
});

/**
 * Validator for FILE type
 */
const fileValidator: PortValidator = (value) => {
  const valid = typeof value === 'object' && 
                value !== null && 
                ('path' in value || 'url' in value || 'id' in value);
  return {
    valid,
    error: valid ? undefined : 'Expected file object with path, url, or id',
  };
};

/**
 * Validator for IMAGE type
 */
const imageValidator: PortValidator = (value) => {
  const valid = typeof value === 'string' || 
                (typeof value === 'object' && 
                 value !== null && 
                 ('url' in value || 'data' in value || 'base64' in value));
  return {
    valid,
    error: valid ? undefined : 'Expected image URL or data object',
  };
};

/**
 * Validator for EMBEDDING type
 */
const embeddingValidator: PortValidator = (value) => {
  const valid = Array.isArray(value) && 
                value.length > 0 && 
                value.every(v => typeof v === 'number');
  return {
    valid,
    error: valid ? undefined : 'Expected array of numbers (vector embedding)',
  };
};

/**
 * Validator for ANY type - always valid
 */
const anyValidator: PortValidator = () => ({ valid: true });

/**
 * Map of default validators for each port type
 */
export const DEFAULT_VALIDATORS: Record<PortType, PortValidator> = {
  [PortType.TEXT]: textValidator,
  [PortType.NUMBER]: numberValidator,
  [PortType.BOOLEAN]: booleanValidator,
  [PortType.JSON]: jsonValidator,
  [PortType.ARRAY]: arrayValidator,
  [PortType.FILE]: fileValidator,
  [PortType.IMAGE]: imageValidator,
  [PortType.EMBEDDING]: embeddingValidator,
  [PortType.ANY]: anyValidator,
  [PortType.OBJECT]: jsonValidator,
};

/**
 * Helper to validate a value against multiple types
 */
export function validateAgainstTypes(
  value: any, 
  types: PortType[]
): { valid: boolean; error?: string } {
  for (const type of types) {
    const validator = DEFAULT_VALIDATORS[type];
    const result = validator(value);
    if (result.valid) {
      return result;
    }
  }
  
  return {
    valid: false,
    error: `Value does not match any of the expected types: ${types.join(', ')}`,
  };
}

/**
 * Helper to check if a value can be coerced to a type
 */
export function canCoerce(value: any, targetType: PortType): boolean {
  switch (targetType) {
    case PortType.TEXT:
      return true; // Everything can be stringified
    
    case PortType.NUMBER:
      return !isNaN(Number(value));
    
    case PortType.BOOLEAN:
      return typeof value === 'boolean' || 
             value === 'true' || 
             value === 'false' || 
             value === 0 || 
             value === 1;
    
    case PortType.JSON:
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
          return true;
        }
        return typeof value === 'object' && value !== null;
      } catch {
        return false;
      }
    
    case PortType.ARRAY:
      return Array.isArray(value) || typeof value === 'string';
    
    case PortType.ANY:
      return true;
    
    default:
      return false;
  }
}

/**
 * Coerce a value to a target type
 */
export function coerceValue(value: any, targetType: PortType): any {
  switch (targetType) {
    case PortType.TEXT:
      return String(value);
    
    case PortType.NUMBER:
      return Number(value);
    
    case PortType.BOOLEAN:
      if (typeof value === 'boolean') return value;
      if (value === 'true' || value === 1) return true;
      if (value === 'false' || value === 0) return false;
      return Boolean(value);
    
    case PortType.JSON:
      if (typeof value === 'string') return JSON.parse(value);
      return value;
    
    case PortType.ARRAY:
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') return value.split(',');
      return [value];
    
    default:
      return value;
  }
}
