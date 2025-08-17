import { EyeOutlined, SettingOutlined, FormatPainterOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface DisplayNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DisplayNodeForm: React.FC<DisplayNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('displayNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<EyeOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['display', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'display',
            label: (
              <Text strong>
                <FormatPainterOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="content"
                  label="Content"
                  help="Content to display (use {{variableName}} for dynamic content)"
                  rules={[{ required: true, message: 'Please enter content to display' }]}
                >
                  <TextArea 
                    rows={6}
                    placeholder="Enter content to display... Use {{variableName}} for dynamic values."
                  />
                </Form.Item>

                <Form.Item
                  name="outputFormat"
                  label={t('outputFormatLabel')}
                  help={t('outputFormatHelp')}
                  initialValue="text"
                >
                  <Select>
                    <Select.Option value="text">{t('textFormat')}</Select.Option>
                    <Select.Option value="markdown">{t('markdownFormat')}</Select.Option>
                    <Select.Option value="html">{t('htmlFormat')}</Select.Option>
                    <Select.Option value="json">{t('jsonFormat')}</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Display Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="showAsModal"
                  label={t('showAsModalLabel')}
                  help={t('showAsModalHelp')}
                  valuePropName="checked"
                  initialValue={false}
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

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DisplayNodeForm;
