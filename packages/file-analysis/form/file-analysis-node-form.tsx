import { FileSearchOutlined, SettingOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert, Tag } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface FileAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileAnalysisNodeForm: React.FC<FileAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('fileAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<FileSearchOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['analysis', 'options']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'analysis',
            label: (
              <Text strong>
                <FolderOpenOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="filePath"
                  label={t('filePathLabel')}
                  help={t('filePathHelp')}
                  rules={[{ required: true, message: 'Please enter file or directory path' }]}
                >
                  <Input placeholder="/path/to/file.txt or {{filePath}}" />
                </Form.Item>

                <Form.Item
                  name="analysisType"
                  label={t('analysisTypeLabel')}
                  help={t('analysisTypeHelp')}
                  initialValue="metadata"
                  rules={[{ required: true, message: 'Please select analysis type' }]}
                >
                  <Select>
                    <Select.Option value="metadata">{t('metadataAnalysis')}</Select.Option>
                    <Select.Option value="content">{t('contentAnalysis')}</Select.Option>
                    <Select.Option value="structure">{t('structureAnalysis')}</Select.Option>
                    <Select.Option value="security">{t('securityAnalysis')}</Select.Option>
                    <Select.Option value="quality">{t('qualityAnalysis')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="outputFormat"
                  label={t('outputFormatLabel')}
                  help={t('outputFormatHelp')}
                  initialValue="json"
                >
                  <Select>
                    <Select.Option value="json">JSON</Select.Option>
                    <Select.Option value="csv">CSV</Select.Option>
                    <Select.Option value="xml">XML</Select.Option>
                    <Select.Option value="text">Text</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'options',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Analysis Options
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="includeHidden"
                  label={t('includeHiddenLabel')}
                  help={t('includeHiddenHelp')}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="recursive"
                  label={t('recursiveLabel')}
                  help={t('recursiveHelp')}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="fileTypes"
                  label={t('fileTypesLabel')}
                  help={t('fileTypesHelp')}
                >
                  <Select mode="tags" placeholder="Leave empty for all types">
                    <Select.Option value=".txt">Text Files (.txt)</Select.Option>
                    <Select.Option value=".pdf">PDF Files (.pdf)</Select.Option>
                    <Select.Option value=".jpg">Image Files (.jpg)</Select.Option>
                    <Select.Option value=".csv">CSV Files (.csv)</Select.Option>
                    <Select.Option value=".json">JSON Files (.json)</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message={t('analysisTypesTitle')}
        description={
          <div>
            <p>{t('analysisTypesDescription')}</p>
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">Metadata</Tag> - File properties, size, dates
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="green">Content</Tag> - Text analysis, line count, preview
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="orange">Structure</Tag> - Directory tree, file organization
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="red">Security</Tag> - Risk assessment, suspicious patterns
            </div>
            <div style={{ marginTop: 4 }}>
              <Tag color="purple">Quality</Tag> - Naming conventions, best practices
            </div>
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

export default FileAnalysisNodeForm;
