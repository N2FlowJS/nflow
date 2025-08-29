import { WhatsAppOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

// ...existing code...
const { Text } = Typography;

interface WhatsAppNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WhatsAppNodeForm: React.FC<WhatsAppNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="WhatsApp Node"
        description="Interact with WhatsApp Business API for business messaging, media sharing, and customer communication."
        type="info"
        showIcon
        icon={<WhatsAppOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['api', 'action', 'parameters']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'api',
            label: (
              <Text strong>
                <KeyOutlined style={{ marginRight: 8 }} />
                API Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="accessToken"
                  label="Access Token"
                  required
                  type="password"
                  placeholder="Your WhatsApp Business API access token"
                />
                <TextInputField
                  name="phoneNumberId"
                  label="Phone Number ID"
                  required
                  placeholder="WhatsApp Business phone number ID"
                />
              </Space>
            ),
          },
          {
            key: 'action',
            label: (
              <Text strong>
                <SettingOutlined style={{ marginRight: 8 }} />
                Action Configuration
              </Text>
            ),
            children: (
              <DropdownField
                name="action"
                label="Action Type"
                required
                options={[
                  { label: 'Send Message', value: 'send_message' },
                  { label: 'Send Media', value: 'send_media' },
                  { label: 'Send Template', value: 'send_template' },
                  { label: 'Get Media', value: 'get_media' },
                  { label: 'Mark as Read', value: 'mark_read' }
                ]}
              />
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <WhatsAppOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="recipientPhone"
                  label="Recipient Phone"
                  placeholder="1234567890"
                />
                <TextAreaField
                  name="message"
                  label="Message"
                  rows={4}
                  placeholder="{{whatsappMessage}} or your message..."
                />
                <DropdownField
                  name="mediaType"
                  label="Media Type"
                  options={[
                    { label: 'Image', value: 'image' },
                    { label: 'Video', value: 'video' },
                    { label: 'Audio', value: 'audio' },
                    { label: 'Document', value: 'document' }
                  ]}
                />
                <TextInputField
                  name="mediaUrl"
                  label="Media URL"
                  placeholder="https://example.com/media.jpg"
                />
                <TextInputField
                  name="mediaId"
                  label="Media ID (Alternative)"
                  placeholder="Media ID from WhatsApp"
                />
                <TextInputField
                  name="templateName"
                  label="Template Name"
                  placeholder="hello_world"
                />
                <TextInputField
                  name="templateLanguage"
                  label="Template Language"
                  placeholder="en_US"
                />
                <TextInputField
                  name="templateParameter"
                  label="Template Parameter"
                  placeholder="Template parameter value"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="Business API Requirements"
        description="WhatsApp Business API requires a verified business account and approved message templates for marketing messages. Make sure you comply with WhatsApp's messaging policies."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default WhatsAppNodeForm;
