import { EnvironmentOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert, InputNumber } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface GoogleMapNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleMapNodeForm: React.FC<GoogleMapNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Google Maps Node"
        description="Access Google Maps services including geocoding, directions, places search, and location data. Requires Google Maps API key."
        type="info"
        showIcon
        icon={<EnvironmentOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['api', 'action', 'parameters']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'api',
            label: (
              <Text strong>
                <KeyOutlined style={{ marginRight: 8 }} />
                {t('googlemap.apiKey')}
              </Text>
            ),
            children: (
              <Form.Item
                name="apiKey"
                label="Google Maps API Key"
                help="Your Google Maps API key with required permissions"
                rules={[{ required: true, message: 'Please enter Google Maps API key' }]}>
                <Input.Password placeholder="AIza..." />
              </Form.Item>
            ),
          },
          {
            key: 'action',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Action Configuration
              </Text>
            ),
            children: (
              <Form.Item
                name="action"
                label="Action Type"
                help="Choose what operation to perform"
                initialValue="geocode"
                rules={[{ required: true, message: 'Please select an action' }]}>
                <Select>
                  <Select.Option value="geocode">Geocode (Address to Coordinates)</Select.Option>
                  <Select.Option value="reverse_geocode">Reverse Geocode (Coordinates to Address)</Select.Option>
                  <Select.Option value="directions">Get Directions</Select.Option>
                  <Select.Option value="places_search">Places Search</Select.Option>
                  <Select.Option value="place_details">Place Details</Select.Option>
                  <Select.Option value="distance_matrix">Distance Matrix</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');

                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'geocode' && (
                        <Form.Item
                          name="address"
                          label="Address"
                          help="Address to convert to coordinates"
                          rules={[{ required: true, message: 'Please enter address' }]}>
                          <Input placeholder="{{locationQuery}} or 1600 Amphitheatre Parkway, Mountain View, CA" />
                        </Form.Item>
                      )}

                      {action === 'reverse_geocode' && (
                        <>
                          <Form.Item
                            name="latitude"
                            label="Latitude"
                            help="Latitude coordinate"
                            rules={[{ required: true, message: 'Please enter latitude' }]}>
                            <Input placeholder="37.4224764" />
                          </Form.Item>
                          <Form.Item
                            name="longitude"
                            label="Longitude"
                            help="Longitude coordinate"
                            rules={[{ required: true, message: 'Please enter longitude' }]}>
                            <Input placeholder="-122.0842499" />
                          </Form.Item>
                        </>
                      )}

                      {action === 'directions' && (
                        <>
                          <Form.Item
                            name="origin"
                            label="Origin"
                            help="Starting location"
                            rules={[{ required: true, message: 'Please enter origin' }]}>
                            <Input placeholder="{{startLocation}} or address" />
                          </Form.Item>
                          <Form.Item
                            name="destination"
                            label="Destination"
                            help="Ending location"
                            rules={[{ required: true, message: 'Please enter destination' }]}>
                            <Input placeholder="{{endLocation}} or address" />
                          </Form.Item>
                          <Form.Item
                            name="travelMode"
                            label="Travel Mode"
                            help="Mode of transportation"
                            initialValue="driving">
                            <Select>
                              <Select.Option value="driving">Driving</Select.Option>
                              <Select.Option value="walking">Walking</Select.Option>
                              <Select.Option value="bicycling">Bicycling</Select.Option>
                              <Select.Option value="transit">Transit</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}

                      {action === 'places_search' && (
                        <>
                          <Form.Item
                            name="query"
                            label="Search Query"
                            help="What to search for"
                            rules={[{ required: true, message: 'Please enter search query' }]}>
                            <Input placeholder="{{searchQuery}} or restaurants near me" />
                          </Form.Item>
                          <Form.Item name="latitude" label="Latitude (Optional)" help="Center latitude for search">
                            <Input placeholder="37.4224764" />
                          </Form.Item>
                          <Form.Item name="longitude" label="Longitude (Optional)" help="Center longitude for search">
                            <Input placeholder="-122.0842499" />
                          </Form.Item>
                          <Form.Item
                            name="radius"
                            label="Search Radius (meters)"
                            help="Search radius in meters"
                            initialValue={5000}>
                            <InputNumber min={1} max={50000} style={{ width: '100%' }} />
                          </Form.Item>
                          <Form.Item name="type" label="Place Type (Optional)" help="Filter by place type">
                            <Select allowClear>
                              <Select.Option value="restaurant">Restaurant</Select.Option>
                              <Select.Option value="gas_station">Gas Station</Select.Option>
                              <Select.Option value="hospital">Hospital</Select.Option>
                              <Select.Option value="pharmacy">Pharmacy</Select.Option>
                              <Select.Option value="bank">Bank</Select.Option>
                              <Select.Option value="atm">ATM</Select.Option>
                              <Select.Option value="shopping_mall">Shopping Mall</Select.Option>
                              <Select.Option value="tourist_attraction">Tourist Attraction</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}

                      {action === 'place_details' && (
                        <Form.Item
                          name="placeId"
                          label="Place ID"
                          help="Google Place ID to get details for"
                          rules={[{ required: true, message: 'Please enter place ID' }]}>
                          <Input placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4" />
                        </Form.Item>
                      )}

                      {action === 'distance_matrix' && (
                        <>
                          <Form.Item
                            name="origin"
                            label="Origins"
                            help="Starting locations (comma-separated for multiple)"
                            rules={[{ required: true, message: 'Please enter origins' }]}>
                            <TextArea rows={2} placeholder="Address 1, Address 2" />
                          </Form.Item>
                          <Form.Item
                            name="destination"
                            label="Destinations"
                            help="Ending locations (comma-separated for multiple)"
                            rules={[{ required: true, message: 'Please enter destinations' }]}>
                            <TextArea rows={2} placeholder="Address 3, Address 4" />
                          </Form.Item>
                          <Form.Item
                            name="travelMode"
                            label="Travel Mode"
                            help="Mode of transportation"
                            initialValue="driving">
                            <Select>
                              <Select.Option value="driving">Driving</Select.Option>
                              <Select.Option value="walking">Walking</Select.Option>
                              <Select.Option value="bicycling">Bicycling</Select.Option>
                              <Select.Option value="transit">Transit</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                    </Space>
                  );
                }}
              </Form.Item>
            ),
          },
        ]}
      />

      <Alert
        message="API Usage Note"
        description="Make sure your Google Maps API key has the required permissions enabled: Geocoding API, Directions API, Places API, etc. Check Google Cloud Console for quota and billing."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default GoogleMapNodeForm;
