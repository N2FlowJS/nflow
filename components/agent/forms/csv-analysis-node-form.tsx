import { TableOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, InputNumber, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';
import { useLocale } from '../../../locale';

const { Text } = Typography;

interface CsvAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CsvAnalysisNodeForm: React.FC<CsvAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('csvAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<TableOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['csv', 'operation']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'csv',
            label: (
              <Text strong>
                <FileTextOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="filePath"
                  label={t('filePathLabel')}
                  help={t('filePathHelp')}
                  rules={[{ required: true, message: 'Please enter CSV file path' }]}
                >
                  <Input placeholder="/path/to/data.csv or {{csvFile}}" />
                </Form.Item>

                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="analyze"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="analyze">{t('analyzeOperation')}</Select.Option>
                    <Select.Option value="validate">{t('validateOperation')}</Select.Option>
                    <Select.Option value="transform">{t('transformOperation')}</Select.Option>
                    <Select.Option value="filter">{t('filterOperation')}</Select.Option>
                    <Select.Option value="aggregate">{t('aggregateOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="delimiter"
                  label={t('delimiterLabel')}
                  help={t('delimiterHelp')}
                  initialValue=","
                >
                  <Select>
                    <Select.Option value=",">{t('commaDelimiter')}</Select.Option>
                    <Select.Option value=";">{t('semicolonDelimiter')}</Select.Option>
                    <Select.Option value="\t">{t('tabDelimiter')}</Select.Option>
                    <Select.Option value="|">{t('pipeDelimiter')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="hasHeader"
                  label={t('hasHeaderLabel')}
                  help={t('hasHeaderHelp')}
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="encoding"
                  label={t('encodingLabel')}
                  help={t('encodingHelp')}
                  initialValue="utf8"
                >
                  <Select>
                    <Select.Option value="utf8">UTF-8</Select.Option>
                    <Select.Option value="ascii">ASCII</Select.Option>
                    <Select.Option value="latin1">Latin-1</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'operation',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Operation Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'filter' ? (
                      <Form.Item
                        name="filterCondition"
                        label={t('filterConditionLabel')}
                        help={t('filterConditionHelp')}
                      >
                        <Input placeholder="Search term or condition" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');
                    
                    return operation === 'aggregate' ? (
                      <>
                        <Form.Item
                          name="groupBy"
                          label={t('groupByLabel')}
                          help={t('groupByHelp')}
                        >
                          <Input placeholder="Column name to group by" />
                        </Form.Item>
                        <Form.Item
                          name="aggregateFunction"
                          label={t('aggregateFunctionLabel')}
                          help={t('aggregateFunctionHelp')}
                          initialValue="count"
                        >
                          <Select>
                            <Select.Option value="count">Count</Select.Option>
                            <Select.Option value="sum">Sum</Select.Option>
                            <Select.Option value="avg">Average</Select.Option>
                            <Select.Option value="min">Minimum</Select.Option>
                            <Select.Option value="max">Maximum</Select.Option>
                          </Select>
                        </Form.Item>
                      </>
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

export default CsvAnalysisNodeForm;
