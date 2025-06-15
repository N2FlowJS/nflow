import { SearchOutlined, SettingOutlined, SecurityScanOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface DuckGoSearchNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DuckGoSearchNodeForm: React.FC<DuckGoSearchNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="DuckDuckGo Search Node"
        description="Privacy-focused search using DuckDuckGo's Instant Answer API. No API key required and no user tracking."
        type="info"
        showIcon
        icon={<SecurityScanOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['search', 'config', 'privacy']}
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
                    <Select.Option value="web">Web & Instant Answers</Select.Option>
                    <Select.Option value="images">Images (Limited)</Select.Option>
                    <Select.Option value="news">News (Limited)</Select.Option>
                    <Select.Option value="videos">Videos (Limited)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="maxResults"
                  label="Max Results"
                  help="Maximum number of results to return (1-30)"
                  initialValue={10}
                  rules={[{ required: true, type: 'number', min: 1, max: 30 }]}
                >
                  <InputNumber
                    min={1}
                    max={30}
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
                  name="region"
                  label="Region"
                  help="Region for localized results"
                  initialValue="us-en"
                >
                  <Select>
                    <Select.Option value="us-en">United States (English)</Select.Option>
                    <Select.Option value="uk-en">United Kingdom (English)</Select.Option>
                    <Select.Option value="ca-en">Canada (English)</Select.Option>
                    <Select.Option value="au-en">Australia (English)</Select.Option>
                    <Select.Option value="de-de">Germany (German)</Select.Option>
                    <Select.Option value="fr-fr">France (French)</Select.Option>
                    <Select.Option value="es-es">Spain (Spanish)</Select.Option>
                    <Select.Option value="it-it">Italy (Italian)</Select.Option>
                    <Select.Option value="jp-jp">Japan (Japanese)</Select.Option>
                    <Select.Option value="kr-kr">South Korea (Korean)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="noHTML"
                  label="No HTML"
                  help="Remove HTML tags from results"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="noRedirect"
                  label="No Redirect"
                  help="Skip redirect URL and return direct links"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'privacy',
            label: (
              <Text strong>
                <SecurityScanOutlined style={{ marginRight: 8 }} />
                Privacy Features
              </Text>
            ),
            children: (
              <div>
                <Alert
                  message="Privacy-First Search"
                  description={
                    <div>
                      <p>DuckDuckGo Search provides:</p>
                      <ul>
                        <li>No user tracking or profiling</li>
                        <li>No storage of personal information</li>
                        <li>No search history logging</li>
                        <li>No API key required</li>
                        <li>Built-in privacy protection</li>
                      </ul>
                    </div>
                  }
                  type="success"
                />
              </div>
            ),
          },
        ]}
      />

      <Alert
        message="Free API Usage"
        description="DuckDuckGo's Instant Answer API is free to use and doesn't require registration or API keys. Rate limiting may apply for excessive usage."
        type="info"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DuckGoSearchNodeForm;
