import { SettingOutlined, EditOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface VariableNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const VariableNodeForm: React.FC<VariableNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('variableNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<SettingOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['variable']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'variable',
            label: (
              <Text strong>
                <EditOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="set"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="set">{t('setOperation')}</Select.Option>
                    <Select.Option value="get">{t('getOperation')}</Select.Option>
                    <Select.Option value="delete">{t('deleteOperation')}</Select.Option>
                    <Select.Option value="append">{t('appendOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="variableName"
                  label={t('variableNameLabel')}
                  help={t('variableNameHelp')}
                  rules={[{ required: true, message: 'Please enter variable name' }]}
                >
                  <Input placeholder="myVariable" />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['set', 'append'].includes(operation) ? (
                      <Form.Item
                        name="variableValue"
                        label={t('variableValueLabel')}
                        help={t('variableValueHelp')}
                        rules={[{ required: true, message: 'Please enter variable value' }]}
                      >
                        <Input placeholder="{{inputValue}}" />
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
                        <Input placeholder="Default value if variable doesn't exist" />
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

export default VariableNodeForm;
