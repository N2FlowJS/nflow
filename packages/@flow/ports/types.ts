// Port type system for NFlow nodes
// Defines data types that can flow through ports

/**
 * Port types - defines what kind of data can flow through
 */
export enum PortType {
  TEXT = 'text',           // Plain text/string
  JSON = 'json',           // JSON object
  NUMBER = 'number',       // Numeric value
  BOOLEAN = 'boolean',     // True/false
  ARRAY = 'array',         // Array of any type
  FILE = 'file',           // File reference
  IMAGE = 'image',         // Image data
  EMBEDDING = 'embedding', // Vector embedding
  ANY = 'any',            // Accept any type
  OBJECT = 'object',       // Generic object 
}

/**
 * Port validator function type
 */
export type PortValidator = (value: any) => { valid: boolean; error?: string };

/**
 * Base port definition - shared properties
 */
export interface PortDefinition {
  id: string;                    // Unique port ID within the node
  name: string;                  // Display name
  type: PortType | PortType[];   // Accepted types (can be multiple)
  description?: string;          // Tooltip description
  required?: boolean;            // Is this port required?
  defaultValue?: any;            // Default value if not connected
  multiple?: boolean;            // Can accept multiple connections?
  validation?: PortValidator;    // Custom validation function
  metadata?: Record<string, any>; // Additional metadata (e.g., isDynamic, sourceTemplate)
}

/**
 * Input port - port that receives data
 */
export interface InputPort extends PortDefinition {
  showHandle?: boolean;          // Show connection handle in UI (default: true)
  customizable?: boolean;        // User can modify this port (default: false)
}

/**
 * Output port - port that produces data
 */
export interface OutputPort extends PortDefinition {
  showHandle?: boolean;          // Show connection handle in UI (default: true)
  transform?: (data: any) => any; // Transform output before sending
}

/**
 * Port connection information
 */
export interface PortConnection {
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

/**
 * Port value with metadata
 */
export interface PortValue<T = any> {
  value: T;
  type: PortType;
  timestamp?: number;
  source?: string;
}

/**
 * Type guard to check if port is InputPort
 */
export function isInputPort(port: PortDefinition): port is InputPort {
  return 'customizable' in port || !('transform' in port);
}

/**
 * Type guard to check if port is OutputPort
 */
export function isOutputPort(port: PortDefinition): port is OutputPort {
  return 'transform' in port || !('customizable' in port);
}
