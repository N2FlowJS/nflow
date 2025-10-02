// Port type registry - manages port types and validation

import { PortType, PortValidator, PortDefinition, InputPort, OutputPort } from './types';
import { DEFAULT_VALIDATORS, validateAgainstTypes, canCoerce } from './validators';

/**
 * Port type registry - central registry for port validation
 */
export class PortTypeRegistry {
  private static validators = new Map<PortType, PortValidator>(
    Object.entries(DEFAULT_VALIDATORS) as [PortType, PortValidator][]
  );
  
  private static customValidators = new Map<string, PortValidator>();

  /**
   * Register a custom validator for a port type
   */
  static registerValidator(type: PortType, validator: PortValidator): void {
    this.validators.set(type, validator);
  }

  /**
   * Register a custom validator with a unique name
   */
  static registerCustomValidator(name: string, validator: PortValidator): void {
    this.customValidators.set(name, validator);
  }

  /**
   * Get validator for a port type
   */
  static getValidator(type: PortType): PortValidator | undefined {
    return this.validators.get(type);
  }

  /**
   * Get custom validator by name
   */
  static getCustomValidator(name: string): PortValidator | undefined {
    return this.customValidators.get(name);
  }

  /**
   * Check if two ports can be connected
   * @param outputPort - The source port (output)
   * @param inputPort - The target port (input)
   * @returns true if connection is valid
   */
  static canConnect(outputPort: OutputPort, inputPort: InputPort): boolean {
    // ANY type can connect to/from anything
    if (outputPort.type === PortType.ANY || inputPort.type === PortType.ANY) {
      return true;
    }
    
    // Get types as arrays
    const outputTypes = Array.isArray(outputPort.type) ? outputPort.type : [outputPort.type];
    const inputTypes = Array.isArray(inputPort.type) ? inputPort.type : [inputPort.type];
    
    // Check if any output type matches any input type
    const directMatch = outputTypes.some(ot => inputTypes.includes(ot));
    if (directMatch) return true;
    
    // Check if types can be coerced
    return outputTypes.some(ot => inputTypes.some(it => canCoerce(ot as any, it)));
  }

  /**
   * Get connection error message
   */
  static getConnectionError(outputPort: OutputPort, inputPort: InputPort): string {
    if (this.canConnect(outputPort, inputPort)) {
      return '';
    }
    
    const outputTypes = Array.isArray(outputPort.type) ? outputPort.type : [outputPort.type];
    const inputTypes = Array.isArray(inputPort.type) ? inputPort.type : [inputPort.type];
    
    return `Cannot connect ${outputTypes.join('|')} to ${inputTypes.join('|')}. Types are incompatible.`;
  }

  /**
   * Validate a value against a port definition
   * @param value - The value to validate
   * @param port - The port definition
   * @returns Validation result
   */
  static validateValue(value: any, port: PortDefinition): { valid: boolean; error?: string } {
    // Check required
    if (port.required && (value === null || value === undefined)) {
      return { valid: false, error: `Port "${port.name}" is required` };
    }
    
    // If not required and no value, use default or skip validation
    if (value === null || value === undefined) {
      return { valid: true };
    }
    
    // Custom validation first
    if (port.validation) {
      return port.validation(value);
    }
    
    // Type-based validation
    const types = Array.isArray(port.type) ? port.type : [port.type];
    return validateAgainstTypes(value, types);
  }

  /**
   * Validate all inputs for a node
   */
  static validateInputs(
    inputs: Record<string, any>, 
    portDefinitions: InputPort[]
  ): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    for (const port of portDefinitions) {
      const value = inputs[port.id];
      const result = this.validateValue(value, port);
      
      if (!result.valid) {
        errors[port.id] = result.error || 'Validation failed';
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Get compatible input ports for an output port
   */
  static getCompatibleInputs(
    outputPort: OutputPort, 
    availableInputs: InputPort[]
  ): InputPort[] {
    return availableInputs.filter(input => this.canConnect(outputPort, input));
  }

  /**
   * Get compatible output ports for an input port
   */
  static getCompatibleOutputs(
    inputPort: InputPort, 
    availableOutputs: OutputPort[]
  ): OutputPort[] {
    return availableOutputs.filter(output => this.canConnect(output, inputPort));
  }

  /**
   * Format port type for display
   */
  static formatPortType(port: PortDefinition): string {
    const types = Array.isArray(port.type) ? port.type : [port.type];
    return types.join(' | ');
  }

  /**
   * Get port type color for UI
   */
  static getPortTypeColor(type: PortType): string {
    const colors: Record<PortType, string> = {
      [PortType.TEXT]: '#3b82f6',      // blue
      [PortType.NUMBER]: '#10b981',    // green
      [PortType.BOOLEAN]: '#8b5cf6',   // purple
      [PortType.JSON]: '#f59e0b',      // amber
      [PortType.ARRAY]: '#ec4899',     // pink
      [PortType.FILE]: '#6366f1',      // indigo
      [PortType.IMAGE]: '#14b8a6',     // teal
      [PortType.EMBEDDING]: '#06b6d4', // cyan
      [PortType.ANY]: '#6b7280',       // gray
      [PortType.OBJECT]: '#f97316',    // orange
    };
    
    return colors[type] || '#6b7280';
  }

  /**
   * Get port type icon for UI
   */
  static getPortTypeIcon(type: PortType): string {
    const icons: Record<PortType, string> = {
      [PortType.TEXT]: '📝',
      [PortType.NUMBER]: '🔢',
      [PortType.BOOLEAN]: '🔘',
      [PortType.JSON]: '{}',
      [PortType.OBJECT]: '{}',
      [PortType.ARRAY]: '[]',
      [PortType.FILE]: '📄',
      [PortType.IMAGE]: '🖼️',
      [PortType.EMBEDDING]: '🧮',
      [PortType.ANY]: '⚡',
    };
    
    return icons[type] || '•';
  }

  /**
   * Clear all custom validators (useful for testing)
   */
  static clearCustomValidators(): void {
    this.customValidators.clear();
  }

  /**
   * Reset to default validators
   */
  static reset(): void {
    this.validators = new Map(
      Object.entries(DEFAULT_VALIDATORS) as [PortType, PortValidator][]
    );
    this.customValidators.clear();
  }
}
