import { NumberOutlined, SettingOutlined, FunctionOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface CounterNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CounterNodeForm: React.FC<CounterNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('counterNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<NumberOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['counter', 'config']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'counter',
            label: (
              <Text strong>
                <FunctionOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="counterName"
                  label={t('counterNameLabel')}
                  help={t('counterNameHelp')}
                  rules={[{ required: true, message: 'Please enter counter name' }]}
                >
                  <Input placeholder="myCounter" />
                </Form.Item>

                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="increment"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="increment">{t('incrementOperation')}</Select.Option>
                    <Select.Option value="decrement">{t('decrementOperation')}</Select.Option>
                    <Select.Option value="reset">{t('resetOperation')}</Select.Option>
                    <Select.Option value="set">{t('setOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return ['increment', 'decrement'].includes(operation) ? (
                      <Form.Item
                        name="stepValue"
                        label={t('stepValueLabel')}
                        help={t('stepValueHelp')}
                        initialValue={1}
                        rules={[{ required: true, type: 'number', min: 1 }]}
                      >
                        <InputNumber
                          min={1}
                          style={{ width: '100%' }}
                          placeholder="1"
                        />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item
                  name="initialValue"
                  label={t('initialValueLabel')}
                  help={t('initialValueHelp')}
                  initialValue={0}
                  rules={[{ required: true, type: 'number' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0"
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
                {t('settingsLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="maxValue"
                  label={t('maxValueLabel')}
                  help={t('maxValueHelp')}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="No limit"
                  />
                </Form.Item>

                <Form.Item
                  name="minValue"
                  label={t('minValueLabel')}
                  help={t('minValueHelp')}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="No limit"
                  />
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

export default CounterNodeForm;
