import { CalculatorOutlined, SettingOutlined, FunctionOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface MathNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MathNodeForm: React.FC<MathNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('mathNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<CalculatorOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['math', 'config']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'math',
            label: (
              <Text strong>
                <FunctionOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="add"
                  rules={[{ required: true, message: t('operationRequired') }]}
                >
                  <Select>
                    <Select.Option value="add">{t('addOperation')}</Select.Option>
                    <Select.Option value="subtract">{t('subtractOperation')}</Select.Option>
                    <Select.Option value="multiply">{t('multiplyOperation')}</Select.Option>
                    <Select.Option value="divide">{t('divideOperation')}</Select.Option>
                    <Select.Option value="power">{t('powerOperation')}</Select.Option>
                    <Select.Option value="sqrt">{t('sqrtOperation')}</Select.Option>
                    <Select.Option value="abs">{t('absOperation')}</Select.Option>
                    <Select.Option value="round">{t('roundOperation')}</Select.Option>
                    <Select.Option value="min">{t('minOperation')}</Select.Option>
                    <Select.Option value="max">{t('maxOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="value1"
                  label={t('value1Label')}
                  help={t('value1Help')}
                  rules={[{ required: true, message: t('value1Required') }]}
                >
                  <Input placeholder={t('value1Placeholder')} />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    const requiresSecondValue = ['add', 'subtract', 'multiply', 'divide', 'power', 'min', 'max'].includes(operation);
                    
                    return requiresSecondValue ? (
                      <Form.Item
                        name="value2"
                        label={t('value2Label')}
                        help={t('value2Help')}
                        rules={[{ required: true, message: t('value2Required') }]}
                      >
                        <Input placeholder={t('value2Placeholder')} />
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
                {t('settingsLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="precision"
                  label={t('precisionLabel')}
                  help={t('precisionHelp')}
                  initialValue={2}
                  rules={[{ required: true, type: 'number', min: 0, max: 10 }]}
                >
                  <InputNumber
                    min={0}
                    max={10}
                    style={{ width: '100%' }}
                    placeholder={t('precisionPlaceholder')}
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

export default MathNodeForm;
