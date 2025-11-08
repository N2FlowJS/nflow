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
    const { config, inputs, dispatcher, node, flowState } = context;
    const startTime = new Date().toISOString();

    const templateVars = [
      ...getInputFromTemplate((config.address as string) || ''),
      ...getInputFromTemplate((config.origin as string) || ''),
      ...getInputFromTemplate((config.destination as string) || ''),
      ...getInputFromTemplate((config.query as string) || '')
    ];

    if (!isNodeReady(templateVars, flowState)) {
      return {
        outputs: { result: null, formatted: '' },
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

      if (!config.apiKey) {
        throw new Error('Google Maps API key is required');
      }

      let result: any;

      switch (config.action) {
        case 'geocode':
          if (!config.address) {
            throw new Error('Address is required for geocoding');
          }
          const processedAddress = processTemplate(config.address as string, vars);
          result = await geocodeAddress(config.apiKey as string, processedAddress);
          break;

        case 'reverse_geocode':
          if (!config.latitude || !config.longitude) {
            throw new Error('Latitude and longitude are required for reverse geocoding');
          }
          result = await reverseGeocode(config.apiKey as string, config.latitude as number, config.longitude as number);
          break;

        case 'directions':
          if (!config.origin || !config.destination) {
            throw new Error('Origin and destination are required for directions');
          }
          const processedOrigin = processTemplate(config.origin as string, vars);
          const processedDestination = processTemplate(config.destination as string, vars);
          result = await getDirections(
            config.apiKey as string,
            processedOrigin,
            processedDestination,
            (config.travelMode as string) || 'driving'
          );
          break;

        case 'places_search':
          if (!config.query) {
            throw new Error('Search query is required for places search');
          }
          const processedQuery = processTemplate(config.query as string, vars);
          result = await searchPlaces(config.apiKey as string, processedQuery, {
            latitude: config.latitude as number,
            longitude: config.longitude as number,
            radius: config.radius as number,
            type: config.type as string
          });
          break;

        case 'place_details':
          if (!config.placeId) {
            throw new Error('Place ID is required for place details');
          }
          result = await getPlaceDetails(config.apiKey as string, config.placeId as string);
          break;

        case 'distance_matrix':
          if (!config.origin || !config.destination) {
            throw new Error('Origins and destinations are required for distance matrix');
          }
          const origins = processTemplate(config.origin as string, vars);
          const destinations = processTemplate(config.destination as string, vars);
          result = await getDistanceMatrix(
            config.apiKey as string,
            origins,
            destinations,
            (config.travelMode as string) || 'driving'
          );
          break;

        default:
          throw new Error(`Unsupported Google Maps action: ${config.action}`);
      }

      const resultText = JSON.stringify(result, null, 2);

      if (dispatcher) {
        dispatcher.setNodeOutput(node.id, resultText, 'googlemap');
        dispatcher.setCurrentNode(node);
      }

      return {
        outputs: {
          result,
          formatted: resultText.substring(0, 500)
        },
        status: 'success',
        metadata: {
          startTime,
          endTime: new Date().toISOString(),
          action: config.action
        }
      };
    } catch (error: unknown) {
      console.error('Google Maps API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown Maps error';

      return {
        outputs: {
          result: null,
          formatted: ''
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

// Helper functions
async function geocodeAddress(apiKey: string, address: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
  );
  return response.json();
}

async function reverseGeocode(apiKey: string, lat: number, lng: number) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
  );
  return response.json();
}

async function getDirections(apiKey: string, origin: string, destination: string, mode: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`
  );
  return response.json();
}

async function searchPlaces(apiKey: string, query: string, options: any) {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  
  if (options.latitude && options.longitude) {
    url += `&location=${options.latitude},${options.longitude}`;
  }
  if (options.radius) {
    url += `&radius=${options.radius}`;
  }
  if (options.type) {
    url += `&type=${options.type}`;
  }

  const response = await fetch(url);
  return response.json();
}

async function getPlaceDetails(apiKey: string, placeId: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`
  );
  return response.json();
}

async function getDistanceMatrix(apiKey: string, origins: string, destinations: string, mode: string) {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&key=${apiKey}`
  );
  return response.json();
}
