import { ReloadOutlined, SettingOutlined, FunctionOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface LoopNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoopNodeForm: React.FC<LoopNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('loopNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<ReloadOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['loop', 'config']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'loop',
            label: (
              <Text strong>
                <FunctionOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="loopType"
                  label={t('loopTypeLabel')}
                  help={t('loopTypeHelp')}
                  initialValue="array"
                  rules={[{ required: true, message: 'Please select a loop type' }]}
                >
                  <Select>
                    <Select.Option value="array">{t('arrayLoop')}</Select.Option>
                    <Select.Option value="object">{t('objectLoop')}</Select.Option>
                    <Select.Option value="range">{t('rangeLoop')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const loopType = getFieldValue('loopType');
                    
                    return loopType !== 'range' ? (
                      <Form.Item
                        name="inputData"
                        label={t('inputDataLabel')}
                        help={t('inputDataHelp')}
                        rules={[{ required: true, message: 'Please enter input data' }]}
                      >
                        <Input placeholder={t('inputDataPlaceholder')} />
                      </Form.Item>
                    ) : (
                      <>
                        <Form.Item
                          name="startIndex"
                          label={t('startIndexLabel')}
                          initialValue={0}
                          rules={[{ required: true, type: 'number' }]}
                        >
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          name="endIndex"
                          label={t('endIndexLabel')}
                          initialValue={10}
                          rules={[{ required: true, type: 'number' }]}
                        >
                          <InputNumber style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                          name="stepSize"
                          label={t('stepSizeLabel')}
                          initialValue={1}
                          rules={[{ required: true, type: 'number', min: 1 }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </>
                    );
                  }}
                </Form.Item>

                <Form.Item
                  name="currentItemVariable"
                  label={t('currentItemVariableLabel')}
                  help={t('currentItemVariableHelp')}
                  initialValue="currentItem"
                  rules={[{ required: true, message: 'Please enter variable name' }]}
                >
                  <Input placeholder="currentItem" />
                </Form.Item>

                <Form.Item
                  name="currentIndexVariable"
                  label={t('currentIndexVariableLabel')}
                  help={t('currentIndexVariableHelp')}
                  initialValue="currentIndex"
                  rules={[{ required: true, message: 'Please enter variable name' }]}
                >
                  <Input placeholder="currentIndex" />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'config',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Loop Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="maxIterations"
                  label={t('maxIterationsLabel')}
                  help={t('maxIterationsHelp')}
                  initialValue={100}
                  rules={[{ required: true, type: 'number', min: 1, max: 1000 }]}
                >
                  <InputNumber
                    min={1}
                    max={1000}
                    style={{ width: '100%' }}
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

export default LoopNodeForm;
