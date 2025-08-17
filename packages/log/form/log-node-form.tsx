import { FileSearchOutlined, SettingOutlined, MessageOutlined, BugOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface LogNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LogNodeForm: React.FC<LogNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('logNode');

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
        defaultActiveKey={['log', 'settings']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'log',
            label: (
              <Text strong>
                <MessageOutlined style={{ marginRight: 8 }} />
                {t('configurationLabel')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="logLevel"
                  label={t('logLevelLabel')}
                  help={t('logLevelHelp')}
                  initialValue="info"
                  rules={[{ required: true, message: 'Please select a log level' }]}
                >
                  <Select>
                    <Select.Option value="debug">{t('debugLevel')}</Select.Option>
                    <Select.Option value="info">{t('infoLevel')}</Select.Option>
                    <Select.Option value="warn">{t('warnLevel')}</Select.Option>
                    <Select.Option value="error">{t('errorLevel')}</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="message"
                  label={t('messageLabel')}
                  help={t('messageHelp')}
                  rules={[{ required: true, message: 'Please enter a log message' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder={t('messagePlaceholder')}
                  />
                </Form.Item>

                <Form.Item
                  name="includeData"
                  label={t('includeDataLabel')}
                  help={t('includeDataHelp')}
                >
                  <TextArea
                    rows={3}
                    placeholder="{{additionalData}}"
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
                Log Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="includeTimestamp"
                  label={t('includeTimestampLabel')}
                  help={t('includeTimestampHelp')}
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="includeNodeInfo"
                  label={t('includeNodeInfoLabel')}
                  help={t('includeNodeInfoHelp')}
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

      <Alert
        message="Logging Levels"
        description={
          <div>
            <p><strong>Debug:</strong> Detailed information for diagnosing problems</p>
            <p><strong>Info:</strong> General information about flow execution</p>
            <p><strong>Warn:</strong> Warning messages about potential issues</p>
            <p><strong>Error:</strong> Error conditions that should be addressed</p>
          </div>
        }
        type="warning"
        showIcon
        icon={<BugOutlined />}
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default LogNodeForm;
