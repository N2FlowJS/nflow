import { MailOutlined, SettingOutlined, CloudServerOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, InputNumber, Switch, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface SendMailNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SendMailNodeForm: React.FC<SendMailNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Send Mail Node"
        description="Send emails with dynamic content using SMTP configuration. Supports both plain text and HTML emails."
        type="info"
        showIcon
        icon={<MailOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['email', 'content', 'smtp']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'email',
            label: (
              <Text strong>
                <MailOutlined style={{ marginRight: 8 }} />
                Email Recipients
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="to"
                  label="To (Required)"
                  help="Recipient email addresses, separated by commas. Use variables like {{email}} for dynamic recipients."
                  rules={[
                    { required: true, message: 'Please enter recipient email addresses' },
                    { type: 'string', message: 'Please enter valid email format' }
                  ]}
                >
                  <Input placeholder="user@example.com, {{userEmail}}" />
                </Form.Item>

                <Form.Item
                  name="cc"
                  label="CC (Optional)"
                  help="Carbon copy recipients, separated by commas"
                >
                  <Input placeholder="manager@example.com" />
                </Form.Item>

                <Form.Item
                  name="bcc"
                  label="BCC (Optional)"
                  help="Blind carbon copy recipients, separated by commas"
                >
                  <Input placeholder="admin@example.com" />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'content',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Email Content
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="subject"
                  label="Subject"
                  help="Email subject line. Use variables like {{title}} for dynamic content."
                  rules={[{ required: true, message: 'Please enter email subject' }]}
                >
                  <Input placeholder="Notification: {{eventName}}" />
                </Form.Item>

                <Form.Item
                  name="body"
                  label="Email Body"
                  help="Email content. Use variables from previous nodes with {{variableName}} syntax."
                  rules={[{ required: true, message: 'Please enter email content' }]}
                >
                  <TextArea
                    rows={8}
                    placeholder={`Hello {{userName}},

This is an automated notification from your flow.

Details:
- Event: {{eventName}}
- Time: {{eventTime}}
- Status: {{status}}

Best regards,
Your Automation System`}
                  />
                </Form.Item>

                <Form.Item
                  name="isHtml"
                  label="HTML Format"
                  help="Enable HTML formatting for rich email content"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              </Space>
            ),
          },
          {
            key: 'smtp',
            label: (
              <Text strong>
                <CloudServerOutlined style={{ marginRight: 8 }} />
                SMTP Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="useSystemConfig"
                  label="Use System SMTP Configuration"
                  help="Use the default system SMTP settings instead of custom configuration"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>

                <Form.Item shouldUpdate>
                  {({ getFieldValue }) => {
                    const useSystemConfig = getFieldValue('useSystemConfig');
                    return !useSystemConfig ? (
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Form.Item
                          name="smtpHost"
                          label="SMTP Host"
                          rules={[{ required: !useSystemConfig, message: 'Please enter SMTP host' }]}
                        >
                          <Input placeholder="smtp.gmail.com" />
                        </Form.Item>

                        <Form.Item
                          name="smtpPort"
                          label="SMTP Port"
                          rules={[{ required: !useSystemConfig, message: 'Please enter SMTP port' }]}
                          initialValue={587}
                        >
                          <InputNumber
                            min={1}
                            max={65535}
                            style={{ width: '100%' }}
                            placeholder="587"
                          />
                        </Form.Item>

                        <Form.Item
                          name="smtpUser"
                          label="SMTP Username"
                          rules={[{ required: !useSystemConfig, message: 'Please enter SMTP username' }]}
                        >
                          <Input placeholder="your-email@gmail.com" />
                        </Form.Item>

                        <Form.Item
                          name="smtpPassword"
                          label="SMTP Password"
                          rules={[{ required: !useSystemConfig, message: 'Please enter SMTP password' }]}
                        >
                          <Input.Password placeholder="App password or email password" />
                        </Form.Item>

                        <Form.Item
                          name="smtpSecure"
                          label="Use TLS/SSL"
                          help="Enable secure connection (recommended for most providers)"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Switch />
                        </Form.Item>
                      </Space>
                    ) : null;
                  }}
                </Form.Item>
              </Space>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default SendMailNodeForm;
