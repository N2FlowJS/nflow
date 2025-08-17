import { CloudOutlined, SettingOutlined, KeyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
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
                <Form.Item
                  name="action"
                  label="Weather Action"
                  help="Type of weather information to retrieve"
                  initialValue="current_weather"
                  rules={[{ required: true, message: 'Please select weather action' }]}
                >
                  <Select>
                    <Select.Option value="current_weather">Current Weather</Select.Option>
                    <Select.Option value="forecast">Weather Forecast</Select.Option>
                    <Select.Option value="weather_alerts">Weather Alerts</Select.Option>
                    <Select.Option value="historical_weather" disabled>Historical Weather (Premium)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="location"
                  label="Location"
                  help="City name, coordinates, or use {{variableName}} for dynamic location"
                  rules={[{ required: true, message: 'Please enter a location' }]}
                >
                  <Input
                    placeholder="{{location}} OR London, UK OR 40.7128,-74.0060"
                    prefix={<EnvironmentOutlined />}
                  />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const action = getFieldValue('action');
                    
                    return action === 'forecast' ? (
                      <Form.Item
                        name="days"
                        label="Forecast Days"
                        help="Number of days for forecast (1-5)"
                        initialValue={5}
                        rules={[{ required: true, type: 'number', min: 1, max: 5 }]}
                      >
                        <InputNumber
                          min={1}
                          max={5}
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
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
                <Form.Item
                  name="units"
                  label="Temperature Units"
                  help="Units for temperature and measurements"
                  initialValue="metric"
                >
                  <Select>
                    <Select.Option value="metric">Metric (°C, m/s, km/h)</Select.Option>
                    <Select.Option value="imperial">Imperial (°F, mph)</Select.Option>
                    <Select.Option value="kelvin">Kelvin (K)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="language"
                  label="Language"
                  help="Language for weather descriptions"
                  initialValue="en"
                >
                  <Select>
                    <Select.Option value="en">English</Select.Option>
                    <Select.Option value="es">Spanish</Select.Option>
                    <Select.Option value="fr">French</Select.Option>
                    <Select.Option value="de">German</Select.Option>
                    <Select.Option value="it">Italian</Select.Option>
                    <Select.Option value="pt">Portuguese</Select.Option>
                    <Select.Option value="ja">Japanese</Select.Option>
                    <Select.Option value="ko">Korean</Select.Option>
                    <Select.Option value="zh">Chinese</Select.Option>
                    <Select.Option value="vi">Vietnamese</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="includeHourly"
                  label="Include Hourly Data"
                  help="Include hourly weather data in forecast"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="includeAlerts"
                  label="Include Weather Alerts"
                  help="Include severe weather alerts when available"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
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
                <Form.Item
                  name="useSystemConfig"
                  label="Use System Configuration"
                  help="Use system-wide API key instead of custom key"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const useSystemConfig = getFieldValue('useSystemConfig');
                    
                    return !useSystemConfig ? (
                      <Form.Item
                        name="apiKey"
                        label="OpenWeatherMap API Key"
                        help="Your OpenWeatherMap API key"
                        rules={[{ required: true, message: 'Please enter your OpenWeatherMap API key' }]}
                      >
                        <Input.Password placeholder="Enter your OpenWeatherMap API key" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
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
