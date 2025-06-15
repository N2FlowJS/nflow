import { WhatsAppOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';

const { TextArea } = Input;
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
                <Form.Item
                  name="accessToken"
                  label="Access Token"
                  rules={[{ required: true, message: 'Please enter WhatsApp access token' }]}
                >
                  <Input.Password placeholder="Your WhatsApp Business API access token" />
                </Form.Item>
                <Form.Item
                  name="phoneNumberId"
                  label="Phone Number ID"
                  rules={[{ required: true, message: 'Please enter phone number ID' }]}
                >
                  <Input placeholder="WhatsApp Business phone number ID" />
                </Form.Item>
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
              <Form.Item
                name="action"
                label="Action Type"
                help="Choose what WhatsApp operation to perform"
                initialValue="send_message"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="send_message">Send Message</Select.Option>
                  <Select.Option value="send_media">Send Media</Select.Option>
                  <Select.Option value="send_template">Send Template</Select.Option>
                  <Select.Option value="get_media">Get Media</Select.Option>
                  <Select.Option value="mark_read">Mark as Read</Select.Option>
                </Select>
              </Form.Item>
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
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'send_message' || action === 'send_media' || action === 'send_template' || action === 'mark_read') && (
                        <Form.Item
                          name="recipientPhone"
                          label="Recipient Phone"
                          help="Phone number in international format (without +)"
                          rules={[{ required: true, message: 'Please enter recipient phone number' }]}
                        >
                          <Input placeholder="1234567890" />
                        </Form.Item>
                      )}
                      
                      {action === 'send_message' && (
                        <Form.Item
                          name="message"
                          label="Message"
                          help="Message content to send"
                          rules={[{ required: true, message: 'Please enter message' }]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="{{whatsappMessage}} or your message..."
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'send_media' && (
                        <>
                          <Form.Item
                            name="mediaType"
                            label="Media Type"
                            help="Type of media to send"
                            initialValue="image"
                            rules={[{ required: true, message: 'Please select media type' }]}
                          >
                            <Select>
                              <Select.Option value="image">Image</Select.Option>
                              <Select.Option value="video">Video</Select.Option>
                              <Select.Option value="audio">Audio</Select.Option>
                              <Select.Option value="document">Document</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="mediaUrl"
                            label="Media URL"
                            help="URL of the media file to send"
                          >
                            <Input placeholder="https://example.com/media.jpg" />
                          </Form.Item>
                          <Form.Item
                            name="mediaId"
                            label="Media ID (Alternative)"
                            help="WhatsApp media ID if already uploaded"
                          >
                            <Input placeholder="Media ID from WhatsApp" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'send_template' && (
                        <>
                          <Form.Item
                            name="templateName"
                            label="Template Name"
                            help="Name of the approved message template"
                            rules={[{ required: true, message: 'Please enter template name' }]}
                          >
                            <Input placeholder="hello_world" />
                          </Form.Item>
                          <Form.Item
                            name="templateLanguage"
                            label="Template Language"
                            help="Language code for the template"
                            initialValue="en_US"
                            rules={[{ required: true, message: 'Please enter template language' }]}
                          >
                            <Input placeholder="en_US" />
                          </Form.Item>
                          <Form.List name="templateParameters">
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                      {...restField}
                                      name={name}
                                      rules={[{ required: true, message: 'Missing parameter' }]}
                                    >
                                      <Input placeholder="Template parameter value" />
                                    </Form.Item>
                                    <a onClick={() => remove(name)}>Remove</a>
                                  </Space>
                                ))}
                                <Form.Item>
                                  <a onClick={() => add()}>Add Template Parameter</a>
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </>
                      )}
                      
                      {action === 'get_media' && (
                        <Form.Item
                          name="mediaId"
                          label="Media ID"
                          help="WhatsApp media ID to retrieve"
                          rules={[{ required: true, message: 'Please enter media ID' }]}
                        >
                          <Input placeholder="Media ID from WhatsApp" />
                        </Form.Item>
                      )}
                    </Space>
                  );
                }}
              </Form.Item>
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
