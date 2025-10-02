/**
 * Weather Node Definition
 * 
 * Get weather information using weather API services.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType } from '@n2flowjs/flow/ports';
import { getInputFromTemplate, processTemplate } from '@n2flowjs/template/template';

interface WeatherConfig {
  name?: string;
  action: 'current_weather' | 'forecast' | 'weather_alerts' | 'historical_weather';
  apiKey?: string;
  location: string;
  units?: 'metric' | 'imperial';
}

const WeatherNodeDefinition: NodeDefinition<WeatherConfig> = {
  id: 'weather',
  name: 'Weather',
  category: NodeCategory.API,
  description: 'Get weather information for any location',
  version: '1.0.0',
  
  inputs: [
    {
      id: 'trigger',
      name: 'Trigger',
      type: PortType.ANY,
      required: false,
    },
  ],
  
  outputs: [
    {
      id: 'output',
      name: 'Weather Data',
      type: PortType.JSON,
    },
  ],
  
  getDynamicInputs: (config: WeatherConfig) => {
    const variables = new Set<string>();
    if (config.location) {
      getInputFromTemplate(config.location).forEach(v => variables.add(v));
    }
    
    return Array.from(variables).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: false,
    }));
  },
  
  config: {
    properties: {
      name: { type: 'string', title: 'Name', default: 'Weather' },
      action: {
        type: 'string',
        title: 'Action',
        enum: ['current_weather', 'forecast', 'weather_alerts', 'historical_weather'],
        default: 'current_weather',
      },
      apiKey: { type: 'string', title: 'API Key', format: 'password' },
      location: {
        type: 'string',
        title: 'Location',
        description: 'City name or coordinates (supports {variable} templates)',
      },
      units: {
        type: 'string',
        title: 'Units',
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
    },
  },
  
  async execute({ config, inputs, node }) {
    const startTime = new Date().toISOString();
    
    try {
      const vars: Record<string, string> = {};
      Object.keys(inputs).forEach((key) => {
        if (inputs[key] !== undefined) {
          vars[key] = String(inputs[key]);
        }
      });
      
      const processedLocation = processTemplate(config.location || '', vars);
      
      if (!processedLocation.trim()) {
        throw new Error('Location is empty after template processing');
      }
      
      const result = {
        message: 'Weather API placeholder',
        location: processedLocation,
        action: config.action,
        units: config.units,
      };
      
      const resultText = JSON.stringify(result, null, 2);
      
      return {
        outputs: { output: resultText },
        status: 'success',
        metadata: {
          execution: {
            nodeId: node.id,
            nodeName: config.name || node.id,
            startTime,
            endTime: new Date().toISOString(),
            output: resultText,
          },
        },
      };
    } catch (error: any) {
      return {
        outputs: {},
        status: 'error',
        error: error?.message || 'Unknown weather error',
      };
    }
  },
};

export default WeatherNodeDefinition;
