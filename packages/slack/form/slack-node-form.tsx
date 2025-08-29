import { SlackOutlined, SettingOutlined, MessageOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
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
              <TextInputField
                name="botToken"
                label="Bot Token"
                required
                type="password"
                placeholder="xoxb-your-bot-token"
              />
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
                  { label: 'Create Channel', value: 'create_channel' },
                  { label: 'Get Channels List', value: 'get_channels' },
                  { label: 'Get Users List', value: 'get_users' },
                  { label: 'Upload File', value: 'upload_file' }
                ]}
              />
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="channelId"
                  label="Channel ID"
                  placeholder="#general or C1234567890"
                />
                <TextAreaField
                  name="message"
                  label="Message Content"
                  rows={4}
                  placeholder="{{messageContent}} or direct message"
                />
                <TextInputField
                  name="filePath"
                  label="File Path"
                  placeholder="{{filePath}} or /path/to/file.txt"
                />
                <TextInputField
                  name="fileName"
                  label="File Name"
                  placeholder="Optional file name"
                />
                <TextInputField
                  name="channelName"
                  label="Channel Name"
                  placeholder="{{channelName}} or channel-name"
                />
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

export default SlackNodeForm;
