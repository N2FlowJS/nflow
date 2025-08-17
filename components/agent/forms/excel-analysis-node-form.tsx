import { FileExcelOutlined, SettingOutlined, TableOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

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
                <Form.Item
                  name="filePath"
                  label={t('filePathLabel')}
                  help={t('filePathHelp')}
                  rules={[{ required: true, message: 'Please enter Excel file path' }]}
                >
                  <Input placeholder="/path/to/spreadsheet.xlsx or {{excelPath}}" />
                </Form.Item>

                <Form.Item
                  name="operation"
                  label={t('operationLabel')}
                  help={t('operationHelp')}
                  initialValue="read_sheets"
                  rules={[{ required: true, message: 'Please select an operation' }]}
                >
                  <Select>
                    <Select.Option value="read_sheets">{t('readSheetsOperation')}</Select.Option>
                    <Select.Option value="analyze_data">{t('analyzeDataOperation')}</Select.Option>
                    <Select.Option value="pivot_table">{t('pivotTableOperation')}</Select.Option>
                    <Select.Option value="chart_data">{t('chartDataOperation')}</Select.Option>
                    <Select.Option value="validate_formulas">{t('validateFormulasOperation')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="sheetName"
                  label={t('sheetNameLabel')}
                  help={t('sheetNameHelp')}
                >
                  <Input placeholder="Sheet1 or leave empty for all sheets" />
                </Form.Item>

                <Form.Item
                  name="cellRange"
                  label={t('cellRangeLabel')}
                  help={t('cellRangeHelp')}
                >
                  <Input placeholder="A1:C10 or leave empty for entire sheet" />
                </Form.Item>
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
