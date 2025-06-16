import { CodeOutlined, SettingOutlined, FunctionOutlined, BugOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface CodeNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CodeNodeForm: React.FC<CodeNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('codeNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<CodeOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['code', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'code',
            label: (
              <Text strong>
                <FunctionOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="code"
                  label={t('codeLabel')}
                  help={t('codeHelp')}
                  rules={[{ required: true, message: 'Please enter JavaScript code' }]}
                >
                  <TextArea
                    rows={12}
                    placeholder={t('codePlaceholder')}
                    style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                  />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                {t('settingsLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="timeout"
                  label={t('timeoutLabel')}
                  help={t('timeoutHelp')}
                  initialValue={5000}
                  rules={[{ required: true, type: 'number', min: 1000, max: 30000 }]}
                >
                  <InputNumber
                    min={1000}
                    max={30000}
                    step={1000}
                    style={{ width: '100%' }}
                    formatter={(value) => `${value} ms`}
                    parser={(value) => {
                      const num = Number((value || '').replace(' ms', ''));
                      if (num <= 1000) return 1000;
                      if (num >= 30000) return 30000;
                      return num as 1000 | 30000;
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="allowConsole"
                  label={t('allowConsoleLabel')}
                  help={t('allowConsoleHelp')}
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

      <Alert
        message="Security Notice"
        description="Code execution is sandboxed with limited access to system resources. Available variables: inputs, console, Math, JSON, Date, Array, Object, String, Number."
        type="warning"
        showIcon
        icon={<BugOutlined />}
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default CodeNodeForm;
