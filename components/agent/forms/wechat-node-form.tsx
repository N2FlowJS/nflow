import { WechatOutlined, SettingOutlined, LinkOutlined, MessageOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from './shared/InputReferences';
import RoleSelector from './shared/RoleSelector';

const { TextArea } = Input;
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
                <Form.Item
                  name="appId"
                  label="App ID"
                  help="WeChat Official Account App ID"
                  rules={[{ required: true, message: 'Please enter the App ID' }]}
                >
                  <Input placeholder="wxxxxxxxxxxxxxxxxxxx" />
                </Form.Item>

                <Form.Item
                  name="appSecret"
                  label="App Secret"
                  help="WeChat Official Account App Secret"
                  rules={[{ required: true, message: 'Please enter the App Secret' }]}
                >
                  <Input.Password placeholder="App Secret" />
                </Form.Item>

                <Form.Item
                  name="accessToken"
                  label="Access Token (Optional)"
                  help="If not provided, will be automatically generated using App ID and Secret"
                >
                  <Input.Password placeholder="Access Token (optional)" />
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
                label="WeChat Action"
                help="Choose what action to perform"
                initialValue="send_message"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="send_message">Send Message</Select.Option>
                  <Select.Option value="send_template">Send Template Message</Select.Option>
                  <Select.Option value="get_user_info">Get User Info</Select.Option>
                  <Select.Option value="create_menu">Create Menu</Select.Option>
                  <Select.Option value="get_qr_code">Generate QR Code</Select.Option>
                  <Select.Option value="send_mini_program">Send Mini Program</Select.Option>
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
                      {(action === 'send_message' || action === 'send_template' || action === 'get_user_info' || action === 'send_mini_program') && (
                        <Form.Item
                          name="openId"
                          label="User OpenID"
                          help="WeChat user's OpenID"
                          rules={[{ required: true, message: 'Please enter user OpenID' }]}
                        >
                          <Input placeholder="{{userOpenId}} or direct OpenID" />
                        </Form.Item>
                      )}
                      
                      {action === 'send_message' && (
                        <Form.Item
                          name="message"
                          label="Message Content"
                          help="Text message to send to user"
                          rules={[{ required: true, message: 'Please enter message content' }]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="{{messageContent}} or direct message"
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'send_template' && (
                        <Form.Item
                          name="templateId"
                          label="Template ID"
                          help="WeChat template message ID"
                          rules={[{ required: true, message: 'Please enter template ID' }]}
                        >
                          <Input placeholder="Template ID" />
                        </Form.Item>
                      )}
                      
                      {action === 'create_menu' && (
                        <Form.Item
                          name="menuData"
                          label="Menu JSON Data"
                          help="JSON structure for WeChat menu"
                          rules={[{ required: true, message: 'Please enter menu data' }]}
                        >
                          <TextArea
                            rows={6}
                            placeholder='{"button":[{"type":"click","name":"Menu Item","key":"V1001_MENU"}]}'
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'get_qr_code' && (
                        <Form.Item
                          name="scene"
                          label="QR Code Scene"
                          help="Scene identifier for the QR code"
                        >
                          <Input placeholder="{{qrScene}} or scene identifier" />
                        </Form.Item>
                      )}
                      
                      {action === 'send_mini_program' && (
                        <>
                          <Form.Item
                            name="miniProgramAppId"
                            label="Mini Program App ID"
                            help="App ID of the Mini Program"
                            rules={[{ required: true, message: 'Please enter Mini Program App ID' }]}
                          >
                            <Input placeholder="Mini Program App ID" />
                          </Form.Item>
                          <Form.Item
                            name="miniProgramPath"
                            label="Mini Program Path"
                            help="Path within the Mini Program (optional)"
                          >
                            <Input placeholder="pages/index/index" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_user_info' && (
                        <Alert
                          message="User Information"
                          description="This action retrieves user profile information including nickname, avatar, and subscription status."
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
