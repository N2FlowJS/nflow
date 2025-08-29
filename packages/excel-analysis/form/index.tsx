import { FileExcelOutlined, SettingOutlined, TableOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
import { TextInputField, DropdownField } from '../../../packages/@input';

const { Text } = Typography;

interface ExcelAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ExcelAnalysisNodeForm: React.FC<ExcelAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('excelAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<FileExcelOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['excel', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'excel',
            label: (
              <Text strong>
                <TableOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="filePath"
                  label={t('filePathLabel')}
                  placeholder="/path/to/spreadsheet.xlsx or {{excelPath}}"
                  required
                />

                <DropdownField
                  name="operation"
                  label={t('operationLabel')}
                  options={[
                    { value: 'read_sheets', label: t('readSheetsOperation') },
                    { value: 'analyze_data', label: t('analyzeDataOperation') },
                    { value: 'pivot_table', label: t('pivotTableOperation') },
                    { value: 'chart_data', label: t('chartDataOperation') },
                    { value: 'validate_formulas', label: t('validateFormulasOperation') }
                  ]}
                  required
                />

                <TextInputField
                  name="sheetName"
                  label={t('sheetNameLabel')}
                  placeholder="Sheet1 or leave empty for all sheets"
                />

                <TextInputField
                  name="cellRange"
                  label={t('cellRangeLabel')}
                  placeholder="A1:C10 or leave empty for entire sheet"
                />
              </Space>
            ),
          },
          {
            key: 'settings',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Processing Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="includeFormulas"
                  label={t('includeFormulasLabel')}
                  help={t('includeFormulasHelp')}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="skipEmptyRows"
                  label={t('skipEmptyRowsLabel')}
                  help={t('skipEmptyRowsHelp')}
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

export default ExcelAnalysisNodeForm;
