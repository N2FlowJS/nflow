import { FileTextOutlined, SettingOutlined, FormatPainterOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface TemplateNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TemplateNodeForm: React.FC<TemplateNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('templateNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<FileTextOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['template', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'template',
            label: (
              <Text strong>
                <FormatPainterOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="templateEngine"
                  label={t('templateEngineLabel')}
                  help={t('templateEngineHelp')}
                  initialValue="simple"
                  rules={[{ required: true, message: 'Please select a template engine' }]}
                >
                  <Select>
                    <Select.Option value="simple">{t('simpleEngine')}</Select.Option>
                    <Select.Option value="handlebars">{t('handlebarsEngine')}</Select.Option>
                    <Select.Option value="mustache">{t('mustacheEngine')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="templateContent"
                  label={t('templateContentLabel')}
                  help={t('templateContentHelp')}
                  rules={[{ required: true, message: 'Please enter template content' }]}
                >
                  <TextArea
                    rows={8}
                    placeholder={t('templateContentPlaceholder')}
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
                Output Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="outputFormat"
                  label={t('outputFormatLabel')}
                  help={t('outputFormatHelp')}
                  initialValue="text"
                >
                  <Select>
                    <Select.Option value="text">Plain Text</Select.Option>
                    <Select.Option value="html">HTML</Select.Option>
                    <Select.Option value="json">JSON</Select.Option>
                  </Select>
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

export default TemplateNodeForm;
