import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';
import { isNodeReady } from '@n2flowjs/flow/is-node-ready';

/**
 * Validate Node Definition
 * 
 * Validates input data against various rules and formats.
 * Supports email, URL, phone, JSON, number, date validation, and custom regex.
 * 
 * Validation Types:
 * - email: Email address format
 * - url: Valid URL format
 * - phone: Phone number format
 * - json: Valid JSON syntax
 * - number: Numeric value
 * - date: Valid date format
 * - custom: Custom regex pattern
 * 
 * Constraints:
 * - required: Field must not be empty
 * - minLength: Minimum string length
 * - maxLength: Maximum string length
 * - customPattern: Regex pattern for custom validation
 * 
 * Example:
 * ```json
 * {
 *   "inputData": "{userEmail}",
 *   "validationType": "email",
 *   "required": true,
 *   "minLength": 5,
 *   "maxLength": 100
 * }
 * ```
 */
export const ValidateNodeDefinition: NodeDefinition = {
  id: 'validate',
  name: 'Validate',
  category: NodeCategory.LOGIC,
  description: 'Validate input data against various rules (email, URL, phone, JSON, etc.)',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'valid',
      name: 'Is Valid',
      type: PortType.BOOLEAN,
      description: 'Validation result (true/false)'
    },
    {
      id: 'message',
      name: 'Message',
      type: PortType.TEXT,
      description: 'Validation message'
    },
    {
      id: 'result',
      name: 'Result',
      type: PortType.JSON,
      description: 'Complete validation result'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.inputData) {
      const vars = getInputFromTemplate(config.inputData as string);
      vars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`
    }));
  },

  config: {
    properties: {
      inputData: {
        type: 'string',
        title: 'Input Data',
        description: 'Data to validate (supports {variable} templates)',
        required: true
      },
      validationType: {
        type: 'string',
        title: 'Validation Type',
        description: 'Type of validation',
        enum: ['email', 'url', 'phone', 'json', 'number', 'date', 'custom'],
        default: 'email',
        required: true
      },
      required: {
        type: 'boolean',
        title: 'Required',
        description: 'Field must not be empty',
        default: false,
        required: false
      },
      minLength: {
        type: 'number',
        title: 'Min Length',
        description: 'Minimum string length',
        required: false
      },
      maxLength: {
        type: 'number',
        title: 'Max Length',
        description: 'Maximum string length',
        required: false
      },
      customPattern: {
        type: 'string',
        title: 'Custom Pattern',
        description: 'Regex pattern for custom validation',
        required: false
      }
    }
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = getInputFromTemplate((config.inputData as string) || '');

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { valid: false, message: 'Waiting for input', result: {} },
        status: 'in_progress',
        metadata: { message: 'Waiting for input variables' }
      };
    }

    try {
      const vars: Record<string, string> = {};
      templateVars.forEach((key) => {
        if (inputs?.[key] !== undefined) {
          vars[key] = String(inputs[key]);
        } else if (flowState.components[key] !== undefined) {
          vars[key] = flowState.components[key].output || '';
        }
      });

      const processedInputData = processTemplate((config.inputData as string) || '', vars);

      // Check required field
      if (config.required && (!processedInputData || processedInputData.trim() === '')) {
        const result = {
          valid: false,
          message: 'Field is required but empty',
          value: processedInputData,
        };

        if (dispatcher) {
          dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'validate');
          dispatcher.setCurrentNode(node);
        }

        return {
          outputs: {
            valid: false,
            message: result.message,
            result
          },
          status: 'success',
          metadata: { startTime, endTime: new Date().toISOString() }
        };
      }

      // Check length constraints
      if (config.minLength !== undefined && processedInputData.length < (config.minLength as number)) {
        const result = {
          valid: false,
          message: `Value length (${processedInputData.length}) is less than minimum required (${config.minLength})`,
          value: processedInputData,
        };

        if (dispatcher) {
          dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'validate');
          dispatcher.setCurrentNode(node);
        }

        return {
          outputs: { valid: false, message: result.message, result },
          status: 'success',
          metadata: { startTime, endTime: new Date().toISOString() }
        };
      }

      if (config.maxLength !== undefined && processedInputData.length > (config.maxLength as number)) {
        const result = {
          valid: false,
          message: `Value length (${processedInputData.length}) exceeds maximum allowed (${config.maxLength})`,
          value: processedInputData,
        };

        if (dispatcher) {
          dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'validate');
          dispatcher.setCurrentNode(node);
        }

        return {
          outputs: { valid: false, message: result.message, result },
          status: 'success',
          metadata: { startTime, endTime: new Date().toISOString() }
        };
      }

      // Validate based on type
      let isValid = false;
      let message = '';

      switch (config.validationType) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          isValid = emailRegex.test(processedInputData);
          message = isValid ? 'Valid email address' : 'Invalid email format';
          break;

        case 'url':
          try {
            new URL(processedInputData);
            isValid = true;
            message = 'Valid URL';
          } catch {
            isValid = false;
            message = 'Invalid URL format';
          }
          break;

        case 'phone':
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          isValid = phoneRegex.test(processedInputData.replace(/[\s\-\(\)]/g, ''));
          message = isValid ? 'Valid phone number' : 'Invalid phone number format';
          break;

        case 'json':
          try {
            JSON.parse(processedInputData);
            isValid = true;
            message = 'Valid JSON';
          } catch {
            isValid = false;
            message = 'Invalid JSON format';
          }
          break;

        case 'number':
          isValid = !isNaN(parseFloat(processedInputData)) && isFinite(parseFloat(processedInputData));
          message = isValid ? 'Valid number' : 'Invalid number format';
          break;

        case 'date':
          const dateValue = new Date(processedInputData);
          isValid = !isNaN(dateValue.getTime());
          message = isValid ? 'Valid date' : 'Invalid date format';
          break;

        case 'custom':
          if (config.customPattern) {
            try {
              const regex = new RegExp(config.customPattern as string);
              isValid = regex.test(processedInputData);
              message = isValid ? 'Matches custom pattern' : 'Does not match custom pattern';
            } catch {
              isValid = false;
              message = 'Invalid custom pattern';
            }
          } else {
            isValid = false;
            message = 'No custom pattern specified';
          }
          break;

        default:
          throw new Error(`Unsupported validation type: ${config.validationType}`);
      }

      const result = {
        valid: isValid,
        message: message,
        value: processedInputData,
      };

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, JSON.stringify(result), 'validate');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          valid: isValid,
          message: message,
          result
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          validationType: config.validationType,
          isValid
        }
      };
    } catch (error: unknown) {
      console.error('Validate node error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';

      return {
        outputs: {
          valid: false,
          message: `Error: ${errorMessage}`,
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
