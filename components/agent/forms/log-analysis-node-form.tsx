import { BugOutlined, SettingOutlined, FileSearchOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface LogAnalysisNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LogAnalysisNodeForm: React.FC<LogAnalysisNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('logAnalysisNode');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message={t('title')}
        description={t('description')}
        type="info"
        showIcon
        icon={<BugOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['log', 'analysis']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'log',
            label: (
              <Text strong>
                <FileSearchOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="logPath"
                  label={t('logPathLabel')}
                  help={t('logPathHelp')}
                  rules={[{ required: true, message: 'Please enter log file path' }]}
                >
                  <Input placeholder="/path/to/logfile.log or {{logPath}}" />
                </Form.Item>

                <Form.Item
                  name="logFormat"
                  label={t('logFormatLabel')}
                  help={t('logFormatHelp')}
                  initialValue="apache"
                  rules={[{ required: true, message: 'Please select log format' }]}
                >
                  <Select>
                    <Select.Option value="apache">{t('apacheFormat')}</Select.Option>
                    <Select.Option value="nginx">{t('nginxFormat')}</Select.Option>
                    <Select.Option value="json">{t('jsonFormat')}</Select.Option>
                    <Select.Option value="csv">{t('csvFormat')}</Select.Option>
                    <Select.Option value="custom">{t('customFormat')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const logFormat = getFieldValue('logFormat');
                    
                    return logFormat === 'custom' ? (
                      <Form.Item
                        name="customPattern"
                        label={t('customPatternLabel')}
                        help={t('customPatternHelp')}
                        rules={[{ required: true, message: 'Please enter custom pattern' }]}
                      >
                        <TextArea rows={3} placeholder="Regular expression pattern" />
                      </Form.Item>
                    ) : null;
                  }}
                </Form.Item>

                <Form.Item
                  name="analysisType"
                  label={t('analysisTypeLabel')}
                  help={t('analysisTypeHelp')}
                  initialValue="summary"
                  rules={[{ required: true, message: 'Please select analysis type' }]}
                >
                  <Select>
                    <Select.Option value="summary">{t('summaryAnalysis')}</Select.Option>
                    <Select.Option value="errors">{t('errorsAnalysis')}</Select.Option>
                    <Select.Option value="performance">{t('performanceAnalysis')}</Select.Option>
                    <Select.Option value="security">{t('securityAnalysis')}</Select.Option>
                    <Select.Option value="trends">{t('trendsAnalysis')}</Select.Option>
                  </Select>
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'analysis',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Analysis Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="timeRange"
                  label={t('timeRangeLabel')}
                  help={t('timeRangeHelp')}
                >
                  <Input placeholder="24h, 7d, 1w, 1m" />
                </Form.Item>

                <Form.Item
                  name="filterLevel"
                  label={t('filterLevelLabel')}
                  help={t('filterLevelHelp')}
                  initialValue="info"
                >
                  <Select>
                    <Select.Option value="debug">Debug</Select.Option>
                    <Select.Option value="info">Info</Select.Option>
                    <Select.Option value="warn">Warning</Select.Option>
                    <Select.Option value="error">Error</Select.Option>
                    <Select.Option value="fatal">Fatal</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const analysisType = getFieldValue('analysisType');
                    
                    return analysisType === 'trends' ? (
                      <Form.Item
                        name="groupBy"
                        label={t('groupByLabel')}
                        help={t('groupByHelp')}
                        initialValue="hour"
                      >
                        <Select>
                          <Select.Option value="hour">Hour</Select.Option>
                          <Select.Option value="day">Day</Select.Option>
                          <Select.Option value="week">Week</Select.Option>
                          <Select.Option value="month">Month</Select.Option>
                        </Select>
                      </Form.Item>
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

export default LogAnalysisNodeForm;
