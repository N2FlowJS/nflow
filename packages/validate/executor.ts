/**
 * Validate Node Executor - Refactored using BaseNodeExecutor
 * Validates input data against various validation types
 */

import { BaseNodeExecutor, ExecutionContext } from '../@node-plugin/base-executor';
import { ValidateForm } from './types';

/**
 * Validation result structure
 */
interface ValidationResult {
  valid: boolean;
  message: string;
  value: string;
}

/**
 * Validate node executor - validates input data
 */
export class ValidateExecutor extends BaseNodeExecutor<ValidateForm> {
  constructor() {
    super({
      nodeType: 'validate',
      defaultRole: 'developer',
      checkInputReadiness: true,
      templateFields: ['inputData'],
    });
  }

  /**
   * Execute validation logic
   */
  protected async executeLogic(form: ValidateForm, context: ExecutionContext): Promise<string> {
    // Process input data template
    const inputData = this.processTemplate(form.inputData || '', context);

    console.log(`[Validate] Node ${context.node.id}: Type ${form.validationType}`);

    // Check required field
    if (form.required && (!inputData || inputData.trim() === '')) {
      return this.createResult(false, 'Field is required but empty', inputData);
    }

    // Check length constraints
    if (form.minLength !== undefined && inputData.length < form.minLength) {
      return this.createResult(
        false,
        `Value length (${inputData.length}) is less than minimum required (${form.minLength})`,
        inputData
      );
    }

    if (form.maxLength !== undefined && inputData.length > form.maxLength) {
      return this.createResult(
        false,
        `Value length (${inputData.length}) exceeds maximum allowed (${form.maxLength})`,
        inputData
      );
    }

    // Validate based on type
    const result = this.validateByType(inputData, form);
    return this.createResult(result.valid, result.message, inputData);
  }

  /**
   * Validate input based on validation type
   */
  private validateByType(inputData: string, form: ValidateForm): { valid: boolean; message: string } {
    switch (form.validationType) {
      case 'email':
        return this.validateEmail(inputData);

      case 'url':
        return this.validateUrl(inputData);

      case 'phone':
        return this.validatePhone(inputData);

      case 'json':
        return this.validateJson(inputData);

      case 'number':
        return this.validateNumber(inputData, form);

      case 'date':
        return this.validateDate(inputData);

      case 'custom':
        return this.validateCustom(inputData, form.customPattern);

      default:
        throw new Error(`Unsupported validation type: ${form.validationType}`);
    }
  }

  private validateEmail(value: string): { valid: boolean; message: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      valid: isValid,
      message: isValid ? 'Valid email address' : 'Invalid email format',
    };
  }

  private validateUrl(value: string): { valid: boolean; message: string } {
    try {
      new URL(value);
      return { valid: true, message: 'Valid URL' };
    } catch {
      return { valid: false, message: 'Invalid URL format' };
    }
  }

  private validatePhone(value: string): { valid: boolean; message: string } {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const isValid = phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    return {
      valid: isValid,
      message: isValid ? 'Valid phone number' : 'Invalid phone number format',
    };
  }

  private validateJson(value: string): { valid: boolean; message: string } {
    try {
      JSON.parse(value);
      return { valid: true, message: 'Valid JSON' };
    } catch {
      return { valid: false, message: 'Invalid JSON format' };
    }
  }

  private validateNumber(value: string, form: ValidateForm): { valid: boolean; message: string } {
    const num = parseFloat(value);
    const isValid = !isNaN(num) && isFinite(num);

    if (!isValid) {
      return { valid: false, message: 'Invalid number format' };
    }

    // Check min/max value constraints
    if (form.minValue !== undefined && num < form.minValue) {
      return {
        valid: false,
        message: `Value (${num}) is less than minimum (${form.minValue})`,
      };
    }

    if (form.maxValue !== undefined && num > form.maxValue) {
      return {
        valid: false,
        message: `Value (${num}) exceeds maximum (${form.maxValue})`,
      };
    }

    return { valid: true, message: 'Valid number' };
  }

  private validateDate(value: string): { valid: boolean; message: string } {
    const dateValue = new Date(value);
    const isValid = !isNaN(dateValue.getTime());
    return {
      valid: isValid,
      message: isValid ? 'Valid date' : 'Invalid date format',
    };
  }

  private validateCustom(value: string, pattern?: string): { valid: boolean; message: string } {
    if (!pattern) {
      return { valid: false, message: 'No custom pattern specified' };
    }

    try {
      const regex = new RegExp(pattern);
      const isValid = regex.test(value);
      return {
        valid: isValid,
        message: isValid ? 'Matches custom pattern' : 'Does not match custom pattern',
      };
    } catch {
      return { valid: false, message: 'Invalid custom pattern' };
    }
  }

  /**
   * Create validation result JSON
   */
  private createResult(valid: boolean, message: string, value: string): string {
    const result: ValidationResult = { valid, message, value };
    return JSON.stringify(result, null, 2);
  }
}

// Export singleton instance
export const validateExecutor = new ValidateExecutor();
