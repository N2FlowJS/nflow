import { CodeOutlined, SettingOutlined, FunctionOutlined, BugOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React, { useMemo } from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface CodeNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CodeNodeFormComponent: React.FC<CodeNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('codeNode');

  // Memoize collapse panel content to avoid recreation every render.
  const collapseItems = useMemo(() => [
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
                const raw = Number((value || '').toString().replace(/\s*ms$/i, ''));
                if (Number.isNaN(raw)) return 5000 as any;
                const clamped = Math.min(30000, Math.max(1000, raw));
                return clamped as any; // allow any number inside range
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
  ], [t]);

  const examplesContent = useMemo(() => (
    <div>
      <p>{t('examplesDescription')}</p>
      <ul>
        <li>{t('example1')}</li>
        <li>{t('example2')}</li>
        <li>{t('example3')}</li>
        <li>{t('example4')}</li>
      </ul>
    </div>
  ), [t]);

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
        items={collapseItems}
      />

      <Alert
        message={t('examplesTitle')}
        description={examplesContent}
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

// Memoize to prevent unnecessary re-renders when ancestor state changes but props stay same
const CodeNodeForm = React.memo(CodeNodeFormComponent, (prev, next) => (
  prev.selectedNode?.id === next.selectedNode?.id && prev.form === next.form && prev.setIsDrawerOpen === next.setIsDrawerOpen
));

export default CodeNodeForm;
