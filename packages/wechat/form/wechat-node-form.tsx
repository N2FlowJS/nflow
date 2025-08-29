import { WechatOutlined, SettingOutlined, LinkOutlined, MessageOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import DropdownField from '../../@input/DropdownField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { Text } = Typography;

interface WeChatNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WeChatNodeForm: React.FC<WeChatNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="WeChat Node"
        description="Interact with WeChat Official Account and Mini Program APIs for messaging, user management, and content distribution."
        type="info"
        showIcon
        icon={<WechatOutlined />}
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
                WeChat Configuration
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="appId"
                  label="App ID"
                  required
                  placeholder="wxxxxxxxxxxxxxxxxxxx"
                />
                <TextInputField
                  name="appSecret"
                  label="App Secret"
                  required
                  type="password"
                  placeholder="App Secret"
                />
                <TextInputField
                  name="accessToken"
                  label="Access Token (Optional)"
                  type="password"
                  placeholder="Access Token (optional)"
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
                label="WeChat Action"
                required
                options={[
                  { label: 'Send Message', value: 'send_message' },
                  { label: 'Send Template Message', value: 'send_template' },
                  { label: 'Get User Info', value: 'get_user_info' },
                  { label: 'Create Menu', value: 'create_menu' },
                  { label: 'Generate QR Code', value: 'get_qr_code' },
                  { label: 'Send Mini Program', value: 'send_mini_program' }
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
                  name="openId"
                  label="User OpenID"
                  placeholder="{{userOpenId}} or direct OpenID"
                />
                <TextAreaField
                  name="message"
                  label="Message Content"
                  rows={4}
                  placeholder="{{messageContent}} or direct message"
                />
                <TextInputField
                  name="templateId"
                  label="Template ID"
                  placeholder="Template ID"
                />
                <TextAreaField
                  name="menuData"
                  label="Menu JSON Data"
                  rows={6}
                  placeholder='{"button":[{"type":"click","name":"Menu Item","key":"V1001_MENU"}]}'
                />
                <TextInputField
                  name="scene"
                  label="QR Code Scene"
                  placeholder="{{qrScene}} or scene identifier"
                />
                <TextInputField
                  name="miniProgramAppId"
                  label="Mini Program App ID"
                  placeholder="Mini Program App ID"
                />
                <TextInputField
                  name="miniProgramPath"
                  label="Mini Program Path"
                  placeholder="pages/index/index"
                />
              </Space>
            ),
          },
        ]}
      />

      <Alert
        message="WeChat API Limitations"
        description="WeChat API requires valid App ID and Secret from WeChat Official Account. Template messages require pre-approved templates. QR codes have daily generation limits."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default WeChatNodeForm;
