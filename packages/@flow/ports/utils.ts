// Utility functions for working with ports

import { PortDefinition, InputPort, OutputPort, PortType, PortConnection } from './types';
import { PortTypeRegistry } from './registry';

/**
 * Create a default input port
 */
export function createInputPort(
  id: string,
  name: string,
  type: PortType | PortType[] = PortType.ANY,
  options: Partial<InputPort> = {}
): InputPort {
  return {
    id,
    name,
    type,
    required: false,
    showHandle: true,
    customizable: false,
    ...options,
  };
}

/**
 * Create a default output port
 */
export function createOutputPort(
  id: string,
  name: string,
  type: PortType | PortType[] = PortType.ANY,
  options: Partial<OutputPort> = {}
): OutputPort {
  return {
    id,
    name,
    type,
    required: false,
    showHandle: true,
    ...options,
  };
}

/**
 * Clone a port definition with modifications
 */
export function clonePort<T extends PortDefinition>(
  port: T,
  modifications: Partial<T> = {}
): T {
  return { ...port, ...modifications };
}

/**
 * Check if a port has a default value
 */
export function hasDefaultValue(port: PortDefinition): boolean {
  return port.defaultValue !== undefined && port.defaultValue !== null;
}

/**
 * Get the effective value for a port (considering defaults)
 */
export function getPortValue(port: PortDefinition, providedValue: any): any {
  if (providedValue !== undefined && providedValue !== null) {
    return providedValue;
  }
  return port.defaultValue;
}

/**
 * Validate a connection between two nodes
 */
export function validateConnection(
  sourceNodeId: string,
  sourcePort: OutputPort,
  targetNodeId: string,
  targetPort: InputPort
): { valid: boolean; error?: string } {
  // Can't connect to self
  if (sourceNodeId === targetNodeId) {
    return { valid: false, error: 'Cannot connect a node to itself' };
  }
  
  // Check type compatibility
  if (!PortTypeRegistry.canConnect(sourcePort, targetPort)) {
    return {
      valid: false,
      error: PortTypeRegistry.getConnectionError(sourcePort, targetPort),
    };
  }
  
  return { valid: true };
}

/**
 * Find a port by ID in a list
 */
export function findPortById<T extends PortDefinition>(
  ports: T[],
  portId: string
): T | undefined {
  return ports.find(p => p.id === portId);
}

/**
 * Find required ports
 */
export function getRequiredPorts(ports: PortDefinition[]): PortDefinition[] {
  return ports.filter(p => p.required);
}

/**
 * Find optional ports
 */
export function getOptionalPorts(ports: PortDefinition[]): PortDefinition[] {
  return ports.filter(p => !p.required);
}

/**
 * Find customizable ports
 */
export function getCustomizablePorts(ports: InputPort[]): InputPort[] {
  return ports.filter(p => p.customizable);
}

/**
 * Group ports by type
 */
export function groupPortsByType(ports: PortDefinition[]): Map<PortType, PortDefinition[]> {
  const groups = new Map<PortType, PortDefinition[]>();
  
  for (const port of ports) {
    const types = Array.isArray(port.type) ? port.type : [port.type];
    
    for (const type of types) {
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(port);
    }
  }
  
  return groups;
}

/**
 * Check if all required inputs are provided
 */
export function hasAllRequiredInputs(
  inputs: Record<string, any>,
  portDefinitions: InputPort[]
): boolean {
  const requiredPorts = getRequiredPorts(portDefinitions);
  
  return requiredPorts.every(port => {
    const value = inputs[port.id];
    return value !== undefined && value !== null;
  });
}

/**
 * Get missing required inputs
 */
export function getMissingRequiredInputs(
  inputs: Record<string, any>,
  portDefinitions: InputPort[]
): InputPort[] {
  const requiredPorts = getRequiredPorts(portDefinitions);
  
  return requiredPorts.filter(port => {
    const value = inputs[port.id];
    return value === undefined || value === null;
  });
}

/**
 * Merge default values with provided inputs
 */
export function mergeWithDefaults(
  inputs: Record<string, any>,
  portDefinitions: InputPort[]
): Record<string, any> {
  const merged: Record<string, any> = { ...inputs };
  
  for (const port of portDefinitions) {
    if (!(port.id in merged) && hasDefaultValue(port)) {
      merged[port.id] = port.defaultValue;
    }
  }
  
  return merged;
}

/**
 * Create a connection object
 */
export function createConnection(
  sourceNodeId: string,
  sourcePortId: string,
  targetNodeId: string,
  targetPortId: string
): PortConnection {
  return {
    sourceNodeId,
    sourcePortId,
    targetNodeId,
    targetPortId,
  };
}

/**
 * Format port for display (with type and required indicator)
 */
export function formatPortDisplay(port: PortDefinition): string {
  const typeStr = PortTypeRegistry.formatPortType(port);
  const requiredStr = port.required ? ' *' : '';
  return `${port.name} (${typeStr})${requiredStr}`;
}

/**
 * Generate a unique port ID
 */
export function generatePortId(prefix: string = 'port'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if a value matches port type
 */
export function matchesPortType(value: any, type: PortType): boolean {
  const result = PortTypeRegistry.validateValue(value, {
    id: 'temp',
    name: 'temp',
    type,
  });
  return result.valid;
}

/**
 * Extract port IDs from a list
 */
export function extractPortIds(ports: PortDefinition[]): string[] {
  return ports.map(p => p.id);
}

/**
 * Compare two port arrays (check if they're equivalent)
 */
export function portsAreEqual(ports1: PortDefinition[], ports2: PortDefinition[]): boolean {
  if (ports1.length !== ports2.length) return false;
  
  return ports1.every((p1, idx) => {
    const p2 = ports2[idx];
    return p1.id === p2.id && 
           p1.name === p2.name && 
           JSON.stringify(p1.type) === JSON.stringify(p2.type);
  });
}
