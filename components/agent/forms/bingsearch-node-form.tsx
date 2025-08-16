import { SearchOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface BingSearchNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const BingSearchNodeForm: React.FC<BingSearchNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Bing Search Node"
        description="Search the web using Microsoft Bing Search API. Supports web, image, news, and video search with advanced filtering options."
        type="info"
        showIcon
        icon={<SearchOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['search', 'config', 'api']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'search',
            label: (
              <Text strong>
                <SearchOutlined style={{ marginRight: 8 }} />
                Search Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="query"
                  label="Search Query"
                  help="Use {{variableName}} to insert dynamic content"
                  rules={[{ required: true, message: 'Please enter a search query' }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="{{searchTerm}} OR your search query..."
                  />
                </Form.Item>

                <Form.Item
                  name="searchType"
                  label="Search Type"
                  help="Type of content to search for"
                  initialValue="web"
                  rules={[{ required: true, message: 'Please select search type' }]}
                >
                  <Select>
                    <Select.Option value="web">Web Pages</Select.Option>
                    <Select.Option value="images">Images</Select.Option>
                    <Select.Option value="news">News</Select.Option>
                    <Select.Option value="videos">Videos</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="maxResults"
                  label="Max Results"
                  help="Maximum number of results to return (1-50)"
                  initialValue={10}
                  rules={[{ required: true, type: 'number', min: 1, max: 50 }]}
                >
                  <InputNumber
                    min={1}
                    max={50}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Search Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="safeSearch"
                  label="Safe Search"
                  help="Filter adult content from search results"
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
                  label="Language"
                  help="Language for search interface and results"
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
                  </Select>
                </Form.Item>

                <Form.Item
                  name="country"
                  label="Country/Region"
                  help="Country or region for localized results"
                  initialValue="us"
                >
                  <Select>
                    <Select.Option value="us">United States</Select.Option>
                    <Select.Option value="gb">United Kingdom</Select.Option>
                    <Select.Option value="ca">Canada</Select.Option>
                    <Select.Option value="au">Australia</Select.Option>
                    <Select.Option value="de">Germany</Select.Option>
                    <Select.Option value="fr">France</Select.Option>
                    <Select.Option value="jp">Japan</Select.Option>
                    <Select.Option value="kr">South Korea</Select.Option>
                    <Select.Option value="cn">China</Select.Option>
                  </Select>
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
                        label="Bing Search API Key"
                        help="Your Microsoft Bing Search API subscription key"
                        rules={[{ required: true, message: 'Please enter your Bing API key' }]}
                      >
                        <Input.Password placeholder="Enter your Bing Search API key" />
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
        description="Bing Search requires a Microsoft Azure Cognitive Services subscription. Set up your API key in system configuration or provide it directly in the form."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default BingSearchNodeForm;
