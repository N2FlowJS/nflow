import { SlackOutlined, SettingOutlined, MessageOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface SlackNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SlackNodeForm: React.FC<SlackNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Slack Node"
        description="Interact with Slack for team communication. Send messages, create channels, upload files, and manage workspace."
        type="info"
        showIcon
        icon={<SlackOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Collapse
        defaultActiveKey={['connection', 'action', 'parameters']}
        bordered={false}
        expandIconPosition="end"
        items={[
          {
            key: 'connection',
            label: (
              <Text strong>
                <SlackOutlined style={{ marginRight: 8 }} />
                Connection Settings
              </Text>
            ),
            children: (
              <Form.Item
                name="botToken"
                label="Bot Token"
                help="Slack bot token starting with 'xoxb-'"
                rules={[{ required: true, message: 'Please enter the bot token' }]}
              >
                <Input.Password placeholder="xoxb-your-bot-token" />
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
                help="Choose what action to perform"
                initialValue="send_message"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="send_message">Send Message</Select.Option>
                  <Select.Option value="create_channel">Create Channel</Select.Option>
                  <Select.Option value="get_channels">Get Channels List</Select.Option>
                  <Select.Option value="get_users">Get Users List</Select.Option>
                  <Select.Option value="upload_file">Upload File</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <MessageOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'send_message' || action === 'upload_file') && (
                        <>
                          <Form.Item
                            name="channelId"
                            label="Channel ID"
                            help="Slack channel ID (e.g., C1234567890) or channel name (e.g., #general)"
                          >
                            <Input placeholder="#general or C1234567890" />
                          </Form.Item>
                          {action === 'send_message' && (
                            <Form.Item
                              name="message"
                              label="Message Content"
                              help="Message to send. Use {{variableName}} to reference variables."
                              rules={[{ required: true, message: 'Please enter message content' }]}
                            >
                              <TextArea
                                rows={4}
                                placeholder="{{messageContent}} or direct message"
                              />
                            </Form.Item>
                          )}
                          {action === 'upload_file' && (
                            <>
                              <Form.Item
                                name="filePath"
                                label="File Path"
                                help="Path to the file to upload"
                                rules={[{ required: true, message: 'Please enter file path' }]}
                              >
                                <Input placeholder="{{filePath}} or /path/to/file.txt" />
                              </Form.Item>
                              <Form.Item
                                name="fileName"
                                label="File Name"
                                help="Optional file name for the upload"
                              >
                                <Input placeholder="Optional file name" />
                              </Form.Item>
                            </>
                          )}
                        </>
                      )}
                      
                      {action === 'create_channel' && (
                        <Form.Item
                          name="channelName"
                          label="Channel Name"
                          help="Name for the new channel (without #)"
                          rules={[{ required: true, message: 'Please enter channel name' }]}
                        >
                          <Input placeholder="{{channelName}} or channel-name" />
                        </Form.Item>
                      )}
                      
                      {(action === 'get_channels' || action === 'get_users') && (
                        <Alert
                          message="No additional parameters needed"
                          description={`This action retrieves all ${action === 'get_channels' ? 'channels' : 'users'} from the Slack workspace.`}
                          type="info"
                        />
                      )}
                    </Space>
                  );
                }}
              </Form.Item>
            ),
          },
        ]}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default SlackNodeForm;
