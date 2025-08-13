import { ExecutionResult, FlowExecutionContext } from '../../../../models/flowExecutionTypes';
import { GoogleMapNodeData, FlowNode } from '../../../../models/flowTypes';
import { findNextNodes } from '../../../../packages/@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../../../../packages/@template-processor/templateProcessor';
import { isNodeReady } from '../../../../packages/@flow/is-node-ready';
import { FlowStateDispatcher } from '../../../../packages/@flow/flow-state-dispatcher';

/**
 * Handler for executing Google Maps nodes
 */
export async function executeGoogleMapNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as GoogleMapNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = [
    ...getInputFromTemplate(form.address || ''),
    ...getInputFromTemplate(form.origin || ''),
    ...getInputFromTemplate(form.destination || ''),
    ...getInputFromTemplate(form.query || ''),
  ];
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for Google Maps operation',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'googlemap',
        role: 'developer',
      },
      execution: {
        output: 'Waiting for input variables',
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
      },
    };
  }

  // Prepare variables for template processing
  const vars: Record<string, string> = {};
  inputs.forEach((key) => {
    if (flowState.components[key] !== undefined) {
      vars[key] = flowState.components[key].output || '';
    }
  });

  try {
    // Validate required fields
    if (!form.apiKey) {
      throw new Error('Google Maps API key is required');
    }

    console.log(`Executing Google Maps node: ${node.id} with action: ${form.action}`);

    let result: any;

    switch (form.action) {
      case 'geocode':
        if (!form.address) {
          throw new Error('Address is required for geocoding');
        }

        const processedAddress = processTemplate(form.address, vars);
        result = await geocodeAddress(form.apiKey, processedAddress);
        break;

      case 'reverse_geocode':
        if (!form.latitude || !form.longitude) {
          throw new Error('Latitude and longitude are required for reverse geocoding');
        }
        
        result = await reverseGeocode(form.apiKey, form.latitude, form.longitude);
        break;

      case 'directions':
        if (!form.origin || !form.destination) {
          throw new Error('Origin and destination are required for directions');
        }
        
        const processedOrigin = processTemplate(form.origin, vars);
        const processedDestination = processTemplate(form.destination, vars);
        
        result = await getDirections(form.apiKey, processedOrigin, processedDestination, form.travelMode || 'driving');
        break;

      case 'places_search':
        if (!form.query) {
          throw new Error('Search query is required for places search');
        }
        
        const processedQuery = processTemplate(form.query, vars);
        result = await searchPlaces(form.apiKey, processedQuery, {
          latitude: form.latitude,
          longitude: form.longitude,
          radius: form.radius,
          type: form.type,
        });
        break;

      case 'place_details':
        if (!form.placeId) {
          throw new Error('Place ID is required for place details');
        }
        
        result = await getPlaceDetails(form.apiKey, form.placeId);
        break;

      case 'distance_matrix':
        if (!form.origin || !form.destination) {
          throw new Error('Origins and destinations are required for distance matrix');
        }
        
        const processedOrigins = processTemplate(form.origin, vars);
        const processedDestinations = processTemplate(form.destination, vars);
        
        result = await getDistanceMatrix(form.apiKey, processedOrigins, processedDestinations, form.travelMode || 'driving');
        break;

      default:
        throw new Error(`Unsupported Google Maps action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Google Maps node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'googlemap');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'googlemap';
      flowState.components[node.id]['executionTime'] = Date.now();
      flowState.currentNode = node;
      finalState = flowState;
    }

    const nextNodes = findNextNodes(flow, node.id);

    if (nextNodes.length === 0) {
      throw new Error(`At the Node ${node.data.label} no next node found in the flow`);
    }

    return {
      status: 'in_progress',
      nextNodes,
      flowState: finalState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'googlemap',
        role: 'developer',
      },
      execution: {
        nodeId: node.id,
        nodeName: node.data?.form?.name || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
        output: resultText,
      },
    };
  } catch (error: unknown) {
    console.error('Google Maps execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown Google Maps error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Google Maps operation failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'googlemap',
        role: 'developer',
      },
      execution: {
        output: `Error: ${errorMessage}`,
        nodeId: node.id,
        nodeName: node.data?.label || node.id,
        startTime: startTime,
        endTime: new Date().toISOString(),
      },
    };
  }
}

// Helper functions for Google Maps API operations
async function geocodeAddress(apiKey: string, address: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}

async function reverseGeocode(apiKey: string, latitude: string, longitude: string) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Reverse geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}

async function getDirections(apiKey: string, origin: string, destination: string, mode: string) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Directions failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}

async function searchPlaces(apiKey: string, query: string, options: any) {
  let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
  
  if (options.latitude && options.longitude) {
    url += `&location=${options.latitude},${options.longitude}`;
    if (options.radius) {
      url += `&radius=${options.radius}`;
    }
  }
  
  if (options.type) {
    url += `&type=${options.type}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Places search failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}

async function getPlaceDetails(apiKey: string, placeId: string) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Place details failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}

async function getDistanceMatrix(apiKey: string, origins: string, destinations: string, mode: string) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&key=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Google Maps API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Distance matrix failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  return data;
}
