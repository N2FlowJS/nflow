import { InboxOutlined, SettingOutlined, DatabaseOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface CacheNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CacheNodeForm: React.FC<CacheNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('cacheNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<InboxOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['cache', 'config']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'cache',
            label: (
              <Text strong>
                <DatabaseOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="get"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="set">{t('setOperation')}</Select.Option>
                    <Select.Option value="get">{t('getOperation')}</Select.Option>
                    <Select.Option value="delete">{t('deleteOperation')}</Select.Option>
                    <Select.Option value="clear">{t('clearOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="cacheKey"
                  label={t('cacheKeyLabel')}
                  help={t('cacheKeyHelp')}
                  rules={[{ required: true, message: 'Please enter cache key' }]}
                >
                  <Input placeholder="dataKey_{{userId}}" />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'set' ? (
                      <Form.Item
                        name="cacheValue"
                        label={t('cacheValueLabel')}
                        help={t('cacheValueHelp')}
                        rules={[{ required: true, message: 'Please enter cache value' }]}
                      >
                        <Input placeholder="{{dataToCache}}" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'get' ? (
                      <Form.Item
                        name="defaultValue"
                        label={t('defaultValueLabel')}
                        help={t('defaultValueHelp')}
                      >
                        <Input placeholder="{}" />
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
                Cache Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'set' ? (
                      <Form.Item
                        name="ttl"
                        label={t('ttlLabel')}
                        help={t('ttlHelp')}
                        initialValue={3600}
                        rules={[{ required: true, type: 'number', min: 0 }]}
                      >
                        <InputNumber
                          min={0}
                          style={{ width: '100%' }}
                          placeholder="3600"
                          formatter={(value) => `${value} seconds`}
                          parser={(value) => value?.replace(' seconds', '') as any}
                        />
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
        message={t('examplesTitle')}
        description={
          <div>
            <p>{t('examplesDescription')}</p>
            <ul>
              <li>{t('example1')}</li>
              <li>{t('example2')}</li>
              <li>{t('example3')}</li>
              <li>{t('example4')}</li>
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

export default CacheNodeForm;
