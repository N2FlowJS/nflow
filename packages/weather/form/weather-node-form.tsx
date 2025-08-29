import { CloudOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface WeatherNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WeatherNodeForm: React.FC<WeatherNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Weather Node"
        description="Get weather information, forecasts, and alerts using OpenWeatherMap API. Supports current weather, forecasts, and weather alerts."
        type="info"
        showIcon
        icon={<CloudOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['weather', 'config', 'api']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'weather',
            label: (
              <Text strong>
                <CloudOutlined style={{ marginRight: 8 }} />
                Weather Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <DropdownField
                  name="action"
                  label="Weather Action"
                  required
                  options={[
                    { label: 'Current Weather', value: 'current_weather' },
                    { label: 'Weather Forecast', value: 'forecast' },
                    { label: 'Weather Alerts', value: 'weather_alerts' },
                    { label: 'Historical Weather (Premium)', value: 'historical_weather' }
                  ]}
                />

                <TextInputField
                  name="location"
                  label="Location"
                  required
                  placeholder="{{location}} OR London, UK OR 40.7128,-74.0060"
                />

                {/* Forecast Days only for 'forecast' action */}
                <TextInputField
                  name="days"
                  label="Forecast Days"
                  type="number"
                  placeholder="Number of days (1-5)"
                />
              </Space>
            ),
          },
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Display Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <DropdownField
                  name="units"
                  label="Temperature Units"
                  options={[
                    { label: 'Metric (°C, m/s, km/h)', value: 'metric' },
                    { label: 'Imperial (°F, mph)', value: 'imperial' },
                    { label: 'Kelvin (K)', value: 'kelvin' }
                  ]}
                />

                <DropdownField
                  name="language"
                  label="Language"
                  options={[
                    { label: 'English', value: 'en' },
                    { label: 'Spanish', value: 'es' },
                    { label: 'French', value: 'fr' },
                    { label: 'German', value: 'de' },
                    { label: 'Italian', value: 'it' },
                    { label: 'Portuguese', value: 'pt' },
                    { label: 'Japanese', value: 'ja' },
                    { label: 'Korean', value: 'ko' },
                    { label: 'Chinese', value: 'zh' },
                    { label: 'Vietnamese', value: 'vi' }
                  ]}
                />

                <DropdownField
                  name="includeHourly"
                  label="Include Hourly Data"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                />

                <DropdownField
                  name="includeAlerts"
                  label="Include Weather Alerts"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                />
              </Space>
            ),
          },
          {
            key: 'api',
            label: (
              <Text strong>
                <KeyOutlined style={{ marginRight: 8 }} />
                API Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <DropdownField
                  name="useSystemConfig"
                  label="Use System Configuration"
                  options={[
                    { label: 'Yes', value: 'true' },
                    { label: 'No', value: 'false' }
                  ]}
                />

                <TextInputField
                  name="apiKey"
                  label="OpenWeatherMap API Key"
                  type="password"
                  placeholder="Enter your OpenWeatherMap API key"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="API Requirements"
        description={
          <div>
            <p>This node uses OpenWeatherMap API:</p>
            <ul>
              <li>Free tier: Current weather, 5-day forecast</li>
              <li>Paid tier: Historical data, extended forecasts</li>
              <li>Sign up at: <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer">openweathermap.org</a></li>
            </ul>
          </div>
        }
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default WeatherNodeForm;
