import { ExecutionResult, FlowExecutionContext } from '../../models/flowExecutionTypes';
import { WeatherNodeData, FlowNode } from '../../models/flowTypes';
import { findNextNodes } from '../@flow/find-next-node';
import { getInputFromTemplate, processTemplate } from '../@template-processor/templateProcessor';
import { isNodeReady } from '../@flow/is-node-ready';
import { FlowStateDispatcher } from '../@flow/flow-state-dispatcher';

/**
 * Handler for executing Weather nodes
 */
export async function executeWeatherNode(
  node: FlowNode,
  { flow, flowState }: FlowExecutionContext,
  dispatcher?: FlowStateDispatcher
): Promise<ExecutionResult> {
  const data = node.data as WeatherNodeData;
  const form = data.form || {};
  const startTime = new Date().toISOString();

  // Extract variables from relevant fields
  const inputs: string[] = getInputFromTemplate(form.location || '');
  
  const ready = isNodeReady(inputs, flowState);
  
  if (!ready) {
    return {
      nextNodes: [],
      status: 'waiting',
      message: 'Waiting for input variables for weather request',
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'weather',
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
    const processedLocation = processTemplate(form.location || '', vars);
    
    if (!processedLocation.trim()) {
      throw new Error('Location is empty after template processing');
    }

    console.log(`Executing Weather node: ${node.id} with action: ${form.action} for location: ${processedLocation}`);

    let result: any;

    switch (form.action) {
      case 'current_weather':
        result = await getCurrentWeather(form, processedLocation);
        break;

      case 'forecast':
        result = await getWeatherForecast(form, processedLocation);
        break;

      case 'weather_alerts':
        result = await getWeatherAlerts(form, processedLocation);
        break;

      case 'historical_weather':
        result = await getHistoricalWeather(form, processedLocation);
        break;

      default:
        throw new Error(`Unsupported weather action: ${form.action}`);
    }

    const resultText = JSON.stringify(result, null, 2);
    
    console.log(`Weather node completed: ${node.id}`);

    // Use shared dispatcher if available
    let finalState = flowState;

    if (dispatcher) {
      dispatcher.setNodeOutput(node.id, resultText, 'weather');
      dispatcher.setCurrentNode(node);
      finalState = dispatcher.getState();
    } else {
      // Fallback to local state update
      flowState.components[node.id]['output'] = resultText;
      flowState.components[node.id]['type'] = 'weather';
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
        type: 'weather',
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
    console.error('Weather execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown weather error';
    
    return {
      nextNodes: [],
      status: 'error',
      message: `Weather request failed: ${errorMessage}`,
      flowState,
      nodeInfo: {
        id: node.id,
        name: node.data?.label || node.id,
        type: 'weather',
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

// Helper functions for weather API operations
async function getCurrentWeather(form: any, location: string) {
  const apiKey = form.apiKey || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Weather API key is required. Set OPENWEATHER_API_KEY environment variable or provide in form.');
  }

  const units = form.units || 'metric';
  const language = form.language || 'en';

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${units}&lang=${language}`
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Weather API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  
  return {
    location: data.name,
    country: data.sys.country,
    coordinates: {
      latitude: data.coord.lat,
      longitude: data.coord.lon,
    },
    weather: {
      main: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
    },
    temperature: {
      current: data.main.temp,
      feels_like: data.main.feels_like,
      min: data.main.temp_min,
      max: data.main.temp_max,
      unit: units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K',
    },
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    visibility: data.visibility,
    wind: {
      speed: data.wind?.speed || 0,
      direction: data.wind?.deg || 0,
      gust: data.wind?.gust || 0,
    },
    clouds: data.clouds.all,
    sunrise: new Date(data.sys.sunrise * 1000).toISOString(),
    sunset: new Date(data.sys.sunset * 1000).toISOString(),
    timestamp: new Date().toISOString(),
  };
}

async function getWeatherForecast(form: any, location: string) {
  const apiKey = form.apiKey || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Weather API key is required. Set OPENWEATHER_API_KEY environment variable or provide in form.');
  }

  const units = form.units || 'metric';
  const language = form.language || 'en';
  const days = Math.min(form.days || 5, 5); // OpenWeather free tier limit

  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=${units}&lang=${language}&cnt=${days * 8}` // 8 forecasts per day (3-hour intervals)
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Weather API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  
  const forecasts = data.list.map((item: any) => ({
    datetime: new Date(item.dt * 1000).toISOString(),
    weather: {
      main: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    },
    temperature: {
      current: item.main.temp,
      feels_like: item.main.feels_like,
      min: item.main.temp_min,
      max: item.main.temp_max,
      unit: units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K',
    },
    humidity: item.main.humidity,
    pressure: item.main.pressure,
    wind: {
      speed: item.wind?.speed || 0,
      direction: item.wind?.deg || 0,
      gust: item.wind?.gust || 0,
    },
    clouds: item.clouds.all,
    precipitation: item.rain ? item.rain['3h'] : 0,
  }));

  return {
    location: data.city.name,
    country: data.city.country,
    coordinates: {
      latitude: data.city.coord.lat,
      longitude: data.city.coord.lon,
    },
    forecasts: forecasts,
    timestamp: new Date().toISOString(),
  };
}

async function getWeatherAlerts(form: any, location: string) {
  const apiKey = form.apiKey || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Weather API key is required. Set OPENWEATHER_API_KEY environment variable or provide in form.');
  }

  // First get coordinates from location name
  const geoResponse = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
  );

  if (!geoResponse.ok) {
    throw new Error(`Geocoding API error: ${geoResponse.status}`);
  }

  const geoData = await geoResponse.json();
  if (geoData.length === 0) {
    throw new Error(`Location not found: ${location}`);
  }

  const { lat, lon } = geoData[0];

  // Get weather alerts using One Call API
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&exclude=minutely,hourly,daily`
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Weather API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  
  return {
    location: location,
    coordinates: { latitude: lat, longitude: lon },
    alerts: data.alerts || [],
    timestamp: new Date().toISOString(),
  };
}

async function getHistoricalWeather(form: any, location: string) {
  const apiKey = form.apiKey || process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Weather API key is required. Set OPENWEATHER_API_KEY environment variable or provide in form.');
  }

  // Note: Historical weather data requires a paid OpenWeather subscription
  // This is a placeholder implementation
  throw new Error('Historical weather data requires a paid OpenWeather subscription. Please use current weather or forecast instead.');
}
