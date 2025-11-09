import {
  NodeCategory,
  NodeDefinition,
  NodeExecutionContext,
  NodeExecutionResult,
} from '../@node-plugin/type';
import { PortType } from '../@flow/ports/types';
import { getInputFromTemplate } from '@n2flowjs/template/template';
import { googleMapExecutor } from './executor';

/**
 * Google Maps Node Definition
 * 
 * Interact with Google Maps API.
 * Geocoding, directions, places search, distance matrix, and more.
 * 
 * Configuration:
 * - apiKey: Google Maps API key (required)
 * - action: Operation to perform
 * - address: Address for geocoding (supports {variable} templates)
 * - latitude: Latitude coordinate
 * - longitude: Longitude coordinate
 * - origin: Origin location (supports {variable} templates)
 * - destination: Destination location (supports {variable} templates)
 * - travelMode: Travel mode (driving, walking, bicycling, transit)
 * - query: Search query for places (supports {variable} templates)
 * - radius: Search radius in meters
 * - type: Place type filter
 * - placeId: Place ID for details
 * 
 * Actions:
 * - geocode: Convert address to coordinates
 * - reverse_geocode: Convert coordinates to address
 * - directions: Get directions between locations
 * - places_search: Search for places
 * - place_details: Get place details
 * - distance_matrix: Calculate distances/durations
 * 
 * Example:
 * ```json
 * {
 *   "apiKey": "YOUR_API_KEY",
 *   "action": "geocode",
 *   "address": "{userAddress}"
 * }
 * ```
 */
export const GoogleMapNodeDefinition: NodeDefinition = {
  id: 'google-map',
  name: 'Google Maps',
  category: NodeCategory.API,
  description: 'Interact with Google Maps API',
  version: '1.0.0',

  inputs: [],

  outputs: [
    {
      id: 'result',
      name: 'API Result',
      type: PortType.JSON,
      description: 'Google Maps API response'
    },
    {
      id: 'formatted',
      name: 'Formatted Result',
      type: PortType.TEXT,
      description: 'Formatted result text'
    }
  ],

  getDynamicInputs: (config) => {
    const inputs: Set<string> = new Set();

    if (config.address) {
      const vars = getInputFromTemplate(config.address as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.origin) {
      const vars = getInputFromTemplate(config.origin as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.destination) {
      const vars = getInputFromTemplate(config.destination as string);
      vars.forEach(v => inputs.add(v));
    }

    if (config.query) {
      const vars = getInputFromTemplate(config.query as string);
      vars.forEach(v => inputs.add(v));
    }

    return Array.from(inputs).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Maps parameter: ${varName}`
    }));
  },

  async execute(context: NodeExecutionContext): Promise<NodeExecutionResult> {
    const { node, flowState, dispatcher } = context;

    // Convert to FlowExecutionContext format expected by BaseNodeExecutor
    const flowExecutionContext = {
      flow: { nodes: [], edges: [] },
      flowState,
      input: { role: 'user' as const, content: '' } // Empty input for now
    };

    // Execute using the BaseNodeExecutor
    const result = await googleMapExecutor.execute(node, flowExecutionContext, dispatcher);

    // Convert ExecutionResult to NodeExecutionResult format
    const statusMap: Record<string, 'success' | 'error' | 'in_progress'> = {
      'ended': 'success',
      'error': 'error',
      'in_progress': 'in_progress',
      'waiting': 'in_progress',
      'token': 'in_progress',
      'add_message': 'in_progress'
    };

    return {
      outputs: {
        result: result.execution?.output || null,
        formatted: typeof result.execution?.output === 'string' ? result.execution.output.substring(0, 500) : JSON.stringify(result.execution?.output || {}).substring(0, 500)
      },
      status: statusMap[result.status] || 'in_progress',
      metadata: {
        startTime: result.execution?.startTime,
        endTime: result.execution?.endTime,
        action: result.nodeInfo?.type,
      },
    };
  }
};
