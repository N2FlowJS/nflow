import { PhoneOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface TelegramNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TelegramNodeForm: React.FC<TelegramNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Telegram Node"
        description="Interact with Telegram Bot API for messaging, media sharing, and bot operations."
        type="info"
        showIcon
        icon={<PhoneOutlined />}
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
              <Form.Item
                name="botToken"
                label="Bot Token"
                rules={[{ required: true, message: 'Please enter Telegram bot token' }]}
              >
                <Input.Password placeholder="Your Telegram bot token from @BotFather" />
              </Form.Item>
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
                help="Choose what Telegram operation to perform"
                initialValue="send_message"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="send_message">Send Message</Select.Option>
                  <Select.Option value="send_photo">Send Photo</Select.Option>
                  <Select.Option value="send_document">Send Document</Select.Option>
                  <Select.Option value="get_updates">Get Updates</Select.Option>
                  <Select.Option value="create_poll">Create Poll</Select.Option>
                  <Select.Option value="send_location">Send Location</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <PhoneOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'send_message' || action === 'send_photo' || action === 'send_document' || action === 'create_poll' || action === 'send_location') && (
                        <Form.Item
                          name="chatId"
                          label="Chat ID"
                          help="Telegram chat ID to send to"
                          rules={[{ required: true, message: 'Please enter chat ID' }]}
                        >
                          <Input placeholder="123456789 or @channel_name" />
                        </Form.Item>
                      )}
                      
                      {action === 'send_message' && (
                        <>
                          <Form.Item
                            name="message"
                            label="Message"
                            help="Message content to send"
                            rules={[{ required: true, message: 'Please enter message' }]}
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{telegramMessage}} or your message..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="parseMode"
                            label="Parse Mode"
                            help="Message formatting style"
                            initialValue="Markdown"
                          >
                            <Select>
                              <Select.Option value="Markdown">Markdown</Select.Option>
                              <Select.Option value="HTML">HTML</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'send_photo' && (
                        <Form.Item
                          name="photoUrl"
                          label="Photo URL"
                          help="URL of the photo to send"
                          rules={[{ required: true, message: 'Please enter photo URL' }]}
                        >
                          <Input placeholder="https://example.com/photo.jpg" />
                        </Form.Item>
                      )}
                      
                      {action === 'send_document' && (
                        <Form.Item
                          name="documentUrl"
                          label="Document URL"
                          help="URL of the document to send"
                          rules={[{ required: true, message: 'Please enter document URL' }]}
                        >
                          <Input placeholder="https://example.com/document.pdf" />
                        </Form.Item>
                      )}
                      
                      {action === 'create_poll' && (
                        <>
                          <Form.Item
                            name="pollQuestion"
                            label="Poll Question"
                            help="Question for the poll"
                            rules={[{ required: true, message: 'Please enter poll question' }]}
                          >
                            <Input placeholder="{{pollQuestion}} or your question" />
                          </Form.Item>
                          <Form.List name="pollOptions">
                            {(fields, { add, remove }) => (
                              <>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                      {...restField}
                                      name={name}
                                      rules={[{ required: true, message: 'Missing option' }]}
                                    >
                                      <Input placeholder="Poll option" />
                                    </Form.Item>
                                    <a onClick={() => remove(name)}>Remove</a>
                                  </Space>
                                ))}
                                <Form.Item>
                                  <a onClick={() => add()}>Add Poll Option</a>
                                </Form.Item>
                              </>
                            )}
                          </Form.List>
                        </>
                      )}
                      
                      {action === 'send_location' && (
                        <>
                          <Form.Item
                            name="latitude"
                            label="Latitude"
                            help="Location latitude"
                            rules={[{ required: true, message: 'Please enter latitude' }]}
                          >
                            <Input placeholder="37.4224764" />
                          </Form.Item>
                          <Form.Item
                            name="longitude"
                            label="Longitude"
                            help="Location longitude"
                            rules={[{ required: true, message: 'Please enter longitude' }]}
                          >
                            <Input placeholder="-122.0842499" />
                          </Form.Item>
                        </>
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
        message="Bot Setup Note"
        description="Create a bot via @BotFather on Telegram to get a bot token. Make sure the bot has necessary permissions in groups/channels."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TelegramNodeForm;
