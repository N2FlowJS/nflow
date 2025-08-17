import { PictureOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface ImageAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ImageAnalysisNodeForm: React.FC<ImageAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('imageAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<PictureOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['image', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'image',
            label: (
              <Text strong>
                <EyeOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="imagePath"
                  label={t('imagePathLabel')}
                  help={t('imagePathHelp')}
                  rules={[{ required: true, message: 'Please enter image file path' }]}
                >
                  <Input placeholder="/path/to/image.jpg or {{imagePath}}" />
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
                    <Select.Option value="dimensions">{t('dimensionsAnalysis')}</Select.Option>
                    <Select.Option value="colors">{t('colorsAnalysis')}</Select.Option>
                    <Select.Option value="text_recognition">{t('textRecognition')}</Select.Option>
                    <Select.Option value="object_detection">{t('objectDetection')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const analysisType = getFieldValue('analysisType');
                    
                    return analysisType === 'text_recognition' ? (
                      <Form.Item
                        name="ocrLanguage"
                        label={t('ocrLanguageLabel')}
                        help={t('ocrLanguageHelp')}
                        initialValue="eng"
                      >
                        <Select>
                          <Select.Option value="eng">English</Select.Option>
                          <Select.Option value="vie">Vietnamese</Select.Option>
                          <Select.Option value="fra">French</Select.Option>
                          <Select.Option value="deu">German</Select.Option>
                          <Select.Option value="spa">Spanish</Select.Option>
                        </Select>
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const analysisType = getFieldValue('analysisType');
                    
                    return analysisType === 'colors' ? (
                      <Form.Item
                        name="colorPalette"
                        label={t('colorPaletteLabel')}
                        help={t('colorPaletteHelp')}
                        initialValue={5}
                      >
                        <InputNumber min={1} max={20} style={{ width: '100%' }} />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Analysis Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="outputDetails"
                  label={t('outputDetailsLabel')}
                  help={t('outputDetailsHelp')}
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

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default ImageAnalysisNodeForm;
