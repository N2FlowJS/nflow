import { SearchOutlined, SettingOutlined, SafetyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface GoogleSearchNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GoogleSearchNodeForm: React.FC<GoogleSearchNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Google Search Node"
        description="Search Google for information and return results with titles, descriptions, and URLs."
        type="info"
        showIcon
        icon={<SearchOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['query', 'settings', 'api']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'query',
            label: (
              <Text strong>
                <SearchOutlined style={{ marginRight: 8 }} />
                Search Query
              </Text>
            ),
            children: (
              <Form.Item
                name="query"
                label="Search Query"
                help="Enter the search term. Use {{variableName}} syntax to reference variables from previous nodes."
                rules={[{ required: true, message: 'Please enter a search query' }]}
              >
                <Input placeholder="{{searchTerm}} or direct search query" />
              </Form.Item>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Search Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="maxResults"
                  label="Maximum Results"
                  help="Maximum number of search results to return (1-10)"
                  initialValue={10}
                >
                  <InputNumber
                    min={1}
                    max={10}
                    style={{ width: '100%' }}
                    placeholder="10"
                  />
                </Form.Item>

                <Form.Item
                  name="safeSearch"
                  label="Safe Search"
                  help="Filter level for adult content"
                  initialValue="moderate"
                >
                  <Select>
                    <Select.Option value="off">Off</Select.Option>
                    <Select.Option value="moderate">Moderate</Select.Option>
                    <Select.Option value="strict">Strict</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="language"
                  label="Search Language"
                  help="Restrict results to a specific language"
                  initialValue="en"
                >
                  <Select>
                    <Select.Option value="en">English</Select.Option>
                    <Select.Option value="es">Spanish</Select.Option>
                    <Select.Option value="fr">French</Select.Option>
                    <Select.Option value="de">German</Select.Option>
                    <Select.Option value="it">Italian</Select.Option>
                    <Select.Option value="pt">Portuguese</Select.Option>
                    <Select.Option value="ru">Russian</Select.Option>
                    <Select.Option value="ja">Japanese</Select.Option>
                    <Select.Option value="zh">Chinese</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="country"
                  label="Country"
                  help="Restrict results to a specific country"
                  initialValue="us"
                >
                  <Select>
                    <Select.Option value="us">United States</Select.Option>
                    <Select.Option value="uk">United Kingdom</Select.Option>
                    <Select.Option value="ca">Canada</Select.Option>
                    <Select.Option value="au">Australia</Select.Option>
                    <Select.Option value="de">Germany</Select.Option>
                    <Select.Option value="fr">France</Select.Option>
                    <Select.Option value="es">Spain</Select.Option>
                    <Select.Option value="it">Italy</Select.Option>
                    <Select.Option value="jp">Japan</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'api',
            label: (
              <Text strong>
                <SafetyOutlined style={{ marginRight: 8 }} />
                API Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="useSystemConfig"
                  label="Use System Configuration"
                  help="Use the default system Google API settings instead of custom configuration"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const useSystemConfig = getFieldValue('useSystemConfig');
                    return !useSystemConfig ? (
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Form.Item
                          name="apiKey"
                          label="Google API Key"
                          rules={[{ required: !useSystemConfig, message: 'Please enter Google API key' }]}
                        >
                          <Input.Password placeholder="Your Google Custom Search API key" />
                        </Form.Item>

                        <Form.Item
                          name="searchEngineId"
                          label="Search Engine ID"
                          rules={[{ required: !useSystemConfig, message: 'Please enter Search Engine ID' }]}
                        >
                          <Input placeholder="Your Google Custom Search Engine ID" />
                        </Form.Item>
                      </Space>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default GoogleSearchNodeForm;
