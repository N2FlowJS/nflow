/**
 * Dynamic Port Generator
 * 
 * Generates input ports dynamically from template variables.
 * Used for LangFlow-style template-based nodes where each variable
 * in the template becomes an input handle.
 */

import { parseTemplateVariables, TemplateVariable } from '../../@template/variable-parser';
import { createInputPort } from './utils';
import { InputPort, PortType } from './types';

/**
 * Map template variable type to PortType
 */
function mapToPortType(type: 'string' | 'number' | 'boolean'): PortType {
  switch (type) {
    case 'number':
      return PortType.NUMBER;
    case 'boolean':
      return PortType.BOOLEAN;
    default:
      return PortType.TEXT;
  }
}

/**
 * Create input ports from template variables
 * 
 * @param variables - Parsed template variables
 * @returns Array of InputPort definitions
 */
export function createPortsFromVariables(variables: TemplateVariable[]): InputPort[] {
  return variables.map(variable => {
    const portType = mapToPortType(variable.type);
    const capitalizedName = variable.name.charAt(0).toUpperCase() + variable.name.slice(1);
    
    return createInputPort(
      variable.name,
      capitalizedName.replace(/_/g, ' '), // Convert user_name → User name
      portType,
      {
        description: `Template variable: {${variable.name}}`,
        required: false,  // Template variables are optional (can use defaults)
        defaultValue: undefined,
        // Mark as dynamic for UI differentiation
        metadata: {
          isDynamic: true,
          sourceTemplate: variable.fullMatch,
        },
      }
    );
  });
}

/**
 * Generate dynamic input ports from template string
 * Merges with static ports while maintaining order
 * 
 * Positioning strategy:
 * 1. Static "prompt" port (if exists) - First
 * 2. Dynamic variable ports - After prompt
 * 3. Other static ports - After dynamic ports
 * 
 * @param template - Template string to parse
 * @param staticPorts - Static input ports from node definition
 * @returns Merged array of static + dynamic ports
 */
export function createDynamicInputPorts(
  template: string | undefined,
  staticPorts: InputPort[]
): InputPort[] {
  // If no template, return static ports only
  if (!template || typeof template !== 'string') {
    return staticPorts;
  }

  // Parse template for variables
  const variables = parseTemplateVariables(template);
  
  // If no variables found, return static ports only
  if (variables.length === 0) {
    return staticPorts;
  }

  // Generate dynamic ports
  const dynamicPorts = createPortsFromVariables(variables);
  
  // Find prompt port (usually first)
  const promptPort = staticPorts.find(p => 
    p.id === 'prompt' || p.id === 'template' || p.name.toLowerCase().includes('prompt')
  );
  
  // Get other static ports (exclude prompt)
  const otherStaticPorts = staticPorts.filter(p => p.id !== promptPort?.id);
  
  // Build final port order
  const result: InputPort[] = [];
  
  // 1. Add prompt port first (if exists)
  if (promptPort) {
    result.push(promptPort);
  }
  
  // 2. Add dynamic variable ports
  result.push(...dynamicPorts);
  
  // 3. Add remaining static ports
  result.push(...otherStaticPorts);
  
  return result;
}

/**
 * Check if a port is dynamically generated from template
 */
export function isDynamicPort(port: InputPort): boolean {
  return port.metadata?.isDynamic === true;
}

/**
 * Get only dynamic ports from a port array
 */
export function getDynamicPorts(ports: InputPort[]): InputPort[] {
  return ports.filter(isDynamicPort);
}

/**
 * Get only static (non-dynamic) ports from a port array
 */
export function getStaticPorts(ports: InputPort[]): InputPort[] {
  return ports.filter(port => !isDynamicPort(port));
}

/**
 * Update dynamic ports when template changes
 * Preserves existing connections if variable names match
 * 
 * @param oldPorts - Previous port configuration
 * @param newTemplate - New template string
 * @returns Updated port array
 */
export function updateDynamicPorts(
  oldPorts: InputPort[],
  newTemplate: string
): InputPort[] {
  // Separate static and dynamic ports
  const staticPorts = getStaticPorts(oldPorts);
  
  // Generate new dynamic ports from new template
  return createDynamicInputPorts(newTemplate, staticPorts);
}

/**
 * Extract template values from node inputs
 * Maps input port values to template variable names
 * 
 * @param inputs - Node execution context inputs
 * @param template - Template string
 * @returns Object with variable name → value mapping
 */
export function extractTemplateValues(
  inputs: Record<string, any>,
  template: string
): Record<string, any> {
  const variables = parseTemplateVariables(template);
  const values: Record<string, any> = {};
  
  for (const variable of variables) {
    if (inputs[variable.name] !== undefined) {
      values[variable.name] = inputs[variable.name];
    }
  }
  
  return values;
}
