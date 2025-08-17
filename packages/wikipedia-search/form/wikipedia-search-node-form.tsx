import { GlobalOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface WikipediaSearchNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WikipediaSearchNodeForm: React.FC<WikipediaSearchNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Wikipedia Search Node"
        description="Search Wikipedia for information and return articles with summaries and URLs."
        type="info"
        showIcon
        icon={<GlobalOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['query', 'settings']}
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
                  help="Maximum number of Wikipedia articles to return"
                  initialValue={5}
                >
                  <InputNumber
                    min={1}
                    max={20}
                    style={{ width: '100%' }}
                    placeholder="5"
                  />
                </Form.Item>

                <Form.Item
                  name="language"
                  label="Wikipedia Language"
                  help="Language code for Wikipedia (e.g., en, es, fr, de)"
                  initialValue="en"
                >
                  <Select>
                    <Select.Option value="en">English (en)</Select.Option>
                    <Select.Option value="es">Spanish (es)</Select.Option>
                    <Select.Option value="fr">French (fr)</Select.Option>
                    <Select.Option value="de">German (de)</Select.Option>
                    <Select.Option value="it">Italian (it)</Select.Option>
                    <Select.Option value="pt">Portuguese (pt)</Select.Option>
                    <Select.Option value="ru">Russian (ru)</Select.Option>
                    <Select.Option value="ja">Japanese (ja)</Select.Option>
                    <Select.Option value="zh">Chinese (zh)</Select.Option>
                    <Select.Option value="ar">Arabic (ar)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="summaryOnly"
                  label="Summary Only"
                  help="Return only article summaries instead of full content"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
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

export default WikipediaSearchNodeForm;
