import { MessageOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface MattermostNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const MattermostNodeForm: React.FC<MattermostNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Mattermost Node"
        description="Interact with Mattermost for team communication. Send messages, create channels, and manage team collaboration."
        type="info"
        showIcon
        icon={<MessageOutlined />}
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
                <LinkOutlined style={{ marginRight: 8 }} />
                Connection Settings
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="serverUrl"
                  label="Mattermost Server URL"
                  help="Your Mattermost server URL (e.g., https://mattermost.company.com)"
                  rules={[{ required: true, message: 'Please enter the server URL' }]}
                >
                  <Input placeholder="https://your-mattermost.com" />
                </Form.Item>

                <Form.Item
                  name="accessToken"
                  label="Access Token"
                  help="Personal access token or bot token for authentication"
                  rules={[{ required: true, message: 'Please enter the access token' }]}
                >
                  <Input.Password placeholder="Access token" />
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
                  </Select>
                </Form.Item>
              </Space>
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
                      {(action === 'send_message') && (
                        <>
                          <Form.Item
                            name="channelId"
                            label="Channel ID"
                            help="Mattermost channel ID to send message to"
                          >
                            <Input placeholder="Channel ID" />
                          </Form.Item>
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
                        </>
                      )}
                      
                      {action === 'create_channel' && (
                        <>
                          <Form.Item
                            name="teamId"
                            label="Team ID"
                            help="Team ID where the channel will be created"
                            rules={[{ required: true, message: 'Please enter team ID' }]}
                          >
                            <Input placeholder="Team ID" />
                          </Form.Item>
                          <Form.Item
                            name="channelName"
                            label="Channel Name"
                            help="Name for the new channel"
                            rules={[{ required: true, message: 'Please enter channel name' }]}
                          >
                            <Input placeholder="{{channelName}} or direct name" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_channels' && (
                        <Form.Item
                          name="teamId"
                          label="Team ID"
                          help="Team ID to get channels from"
                          rules={[{ required: true, message: 'Please enter team ID' }]}
                        >
                          <Input placeholder="Team ID" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_users' && (
                        <Alert
                          message="No additional parameters needed"
                          description="This action retrieves all users from the Mattermost server."
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

export default MattermostNodeForm;
