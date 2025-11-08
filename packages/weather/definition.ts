/**
 * Weather Node Definition
 * 
 * Get weather information using weather API services.
 */

import { NodeDefinition, NodeCategory } from '@n2flowjs/node-plugin';
import { PortType, InputPort, OutputPort } from '@n2flowjs/flow/ports';
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
      id: 'action',
      name: 'Action',
      type: PortType.TEXT,
      description: 'Weather operation to perform',
      required: true,
      defaultValue: 'current_weather',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Current Weather', value: 'current_weather' },
          { label: 'Forecast', value: 'forecast' },
          { label: 'Weather Alerts', value: 'weather_alerts' },
          { label: 'Historical Weather', value: 'historical_weather' },
        ],
      },
    },
    {
      id: 'apiKey',
      name: 'API Key',
      type: PortType.TEXT,
      description: 'Weather API key',
      required: false,
      metadata: { inputType: 'text', placeholder: 'Enter API key...', isPassword: true },
    },
    {
      id: 'location',
      name: 'Location',
      type: PortType.TEXT,
      description: 'City name or coordinates (supports {variable} templates)',
      required: true,
      metadata: { inputType: 'text', placeholder: 'London, UK' },
    },
    {
      id: 'units',
      name: 'Units',
      type: PortType.TEXT,
      description: 'Temperature units',
      required: false,
      defaultValue: 'metric',
      metadata: {
        inputType: 'select',
        options: [
          { label: 'Metric (°C)', value: 'metric' },
          { label: 'Imperial (°F)', value: 'imperial' },
        ],
      },
    },
  ] as InputPort[],
  
  outputs: [
    {
      id: 'output',
      name: 'Weather Data',
      type: PortType.JSON,
      description: 'Weather information',
    },
  ] as OutputPort[],
  
  getDynamicInputs: (config: WeatherConfig) => {
    const variableNames = new Set<string>();
    if (config.location) {
      getInputFromTemplate(config.location).forEach(v => variableNames.add(v));
    }
    
    const dynamicPorts: InputPort[] = Array.from(variableNames).map(varName => ({
      id: varName,
      name: varName,
      type: PortType.TEXT,
      required: true,
      description: `Template variable: ${varName}`,
      metadata: { isDynamic: true, inputType: 'text' },
    }));
    
    return [...WeatherNodeDefinition.inputs, ...dynamicPorts];
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
