import { RobotOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface DiscordNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DiscordNodeForm: React.FC<DiscordNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Discord Node"
        description="Interact with Discord API for bot operations, server management, and community engagement."
        type="info"
        showIcon
        icon={<RobotOutlined />}
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
                rules={[{ required: true, message: 'Please enter Discord bot token' }]}
              >
                <Input.Password placeholder="Your Discord bot token" />
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
                help="Choose what Discord operation to perform"
                initialValue="send_message"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="send_message">Send Message</Select.Option>
                  <Select.Option value="create_channel">Create Channel</Select.Option>
                  <Select.Option value="get_messages">Get Messages</Select.Option>
                  <Select.Option value="send_embed">Send Embed</Select.Option>
                  <Select.Option value="manage_roles">Manage Roles</Select.Option>
                  <Select.Option value="get_guild_info">Get Guild Info</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <RobotOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');

                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'send_message' && (
                        <>
                          <Form.Item
                            name="channelId"
                            label="Channel ID"
                            help="Discord channel ID to send message to"
                            rules={[{ required: true, message: 'Please enter channel ID' }]}
                          >
                            <Input placeholder="123456789012345678" />
                          </Form.Item>
                          <Form.Item
                            name="message"
                            label="Message"
                            help="Message content to send"
                            rules={[{ required: true, message: 'Please enter message' }]}
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{discordMessage}} or your message..."
                            />
                          </Form.Item>
                        </>
                      )}

                      {action === 'send_embed' && (
                        <>
                          <Form.Item
                            name="channelId"
                            label="Channel ID"
                            help="Discord channel ID to send embed to"
                            rules={[{ required: true, message: 'Please enter channel ID' }]}
                          >
                            <Input placeholder="123456789012345678" />
                          </Form.Item>
                          <Form.Item
                            name="embedTitle"
                            label="Embed Title"
                            help="Title of the embed message"
                            rules={[{ required: true, message: 'Please enter embed title' }]}
                          >
                            <Input placeholder="{{embedTitle}} or embed title" />
                          </Form.Item>
                          <Form.Item
                            name="embedDescription"
                            label="Embed Description"
                            help="Description content of the embed"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{embedDescription}} or embed description..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="embedColor"
                            label="Embed Color"
                            help="Hex color code for the embed"
                            initialValue="#0099ff"
                          >
                            <Input placeholder="#0099ff" />
                          </Form.Item>
                        </>
                      )}

                      {(action === 'create_channel' || action === 'get_guild_info') && (
                        <Form.Item
                          name="guildId"
                          label="Guild (Server) ID"
                          help="Discord guild/server ID"
                          rules={[{ required: true, message: 'Please enter guild ID' }]}
                        >
                          <Input placeholder="123456789012345678" />
                        </Form.Item>
                      )}

                      {action === 'get_messages' && (
                        <Form.Item
                          name="channelId"
                          label="Channel ID"
                          help="Discord channel ID to get messages from"
                          rules={[{ required: true, message: 'Please enter channel ID' }]}
                        >
                          <Input placeholder="123456789012345678" />
                        </Form.Item>
                      )}

                      {action === 'manage_roles' && (
                        <>
                          <Form.Item
                            name="guildId"
                            label="Guild (Server) ID"
                            help="Discord guild/server ID"
                            rules={[{ required: true, message: 'Please enter guild ID' }]}
                          >
                            <Input placeholder="123456789012345678" />
                          </Form.Item>
                          <Form.Item
                            name="userId"
                            label="User ID"
                            help="Discord user ID to manage roles for"
                            rules={[{ required: true, message: 'Please enter user ID' }]}
                          >
                            <Input placeholder="123456789012345678" />
                          </Form.Item>
                          <Form.Item
                            name="roleId"
                            label="Role ID"
                            help="Discord role ID to assign/remove"
                            rules={[{ required: true, message: 'Please enter role ID' }]}
                          >
                            <Input placeholder="123456789012345678" />
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
        message="Bot Permissions"
        description="Make sure your Discord bot has the necessary permissions in the server for the operations you want to perform (Send Messages, Manage Channels, etc.)."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default DiscordNodeForm;
