import { BaseForm, BaseNodeData } from '@n2flowjs/flow/type';

export interface WeatherForm extends BaseForm {
  name: string;
  description?: string;
  action: 'current_weather' | 'forecast' | 'weather_alerts' | 'historical_weather';
  location: string;
  apiKey?: string;
  useSystemConfig?: boolean;
  units?: 'metric' | 'imperial' | 'kelvin';
  language?: string;
  days?: number;
  includeHourly?: boolean;
  includeAlerts?: boolean;
}

export type WeatherNodeData = BaseNodeData<WeatherForm> & { type: 'weather' };


// Auto-added augmentation for NodeDataMap
declare module '@n2flowjs/flow' {
  interface NodeDataMap {
    WeatherNodeData: WeatherNodeData;
  }
}
