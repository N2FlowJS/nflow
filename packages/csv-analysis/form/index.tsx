import { TableOutlined, SettingOutlined, FileTextOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
import { TextInputField, DropdownField } from '../../../packages/@input';

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
                <TextInputField
                  name="filePath"
                  label={t('filePathLabel')}
                  placeholder="/path/to/data.csv or {{csvFile}}"
                  required
                />

                <DropdownField
                  name="operation"
                  label={t('operationLabel')}
                  options={[
                    { value: 'analyze', label: t('analyzeOperation') },
                    { value: 'validate', label: t('validateOperation') },
                    { value: 'transform', label: t('transformOperation') },
                    { value: 'filter', label: t('filterOperation') },
                    { value: 'aggregate', label: t('aggregateOperation') }
                  ]}
                  required
                />

                <DropdownField
                  name="delimiter"
                  label={t('delimiterLabel')}
                  options={[
                    { value: ',', label: t('commaDelimiter') },
                    { value: ';', label: t('semicolonDelimiter') },
                    { value: '\t', label: t('tabDelimiter') },
                    { value: '|', label: t('pipeDelimiter') }
                  ]}
                />

                <Form.Item
                  name="hasHeader"
                  label={t('hasHeaderLabel')}
                  help={t('hasHeaderHelp')}
                  valuePropName="checked"
                  initialValue={true}>
                  <Switch />
                </Form.Item>

                <DropdownField
                  name="encoding"
                  label={t('encodingLabel')}
                  options={[
                    { value: 'utf8', label: 'UTF-8' },
                    { value: 'ascii', label: 'ASCII' },
                    { value: 'latin1', label: 'Latin-1' }
                  ]}
                />
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
                      <TextInputField
                        name="filterCondition"
                        label={t('filterConditionLabel')}
                        placeholder="Search term or condition"
                      />
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const operation = getFieldValue('operation');

                    return operation === 'aggregate' ? (
                      <>
                        <TextInputField
                          name="groupBy"
                          label={t('groupByLabel')}
                          placeholder="Column name to group by"
                        />
                        <DropdownField
                          name="aggregateFunction"
                          label={t('aggregateFunctionLabel')}
                          options={[
                            { value: 'count', label: 'Count' },
                            { value: 'sum', label: 'Sum' },
                            { value: 'avg', label: 'Average' },
                            { value: 'min', label: 'Minimum' },
                            { value: 'max', label: 'Maximum' }
                          ]}
                        />
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
