import { CustomerServiceOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert, InputNumber } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface TikTokNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TikTokNodeForm: React.FC<TikTokNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="TikTok Node"
        description="Interact with TikTok for Developers API for video content, user data, and hashtag analytics."
        type="info"
        showIcon
        icon={<CustomerServiceOutlined />}
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
                name="accessToken"
                label="Access Token"
                rules={[{ required: true, message: 'Please enter TikTok access token' }]}
              >
                <Input.Password placeholder="Your TikTok for Developers access token" />
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
                help="Choose what TikTok operation to perform"
                initialValue="get_user_info"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="upload_video">Upload Video</Select.Option>
                  <Select.Option value="get_user_info">Get User Info</Select.Option>
                  <Select.Option value="get_videos">Get Videos</Select.Option>
                  <Select.Option value="get_hashtag_videos">Get Hashtag Videos</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <CustomerServiceOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'upload_video' && (
                        <>
                          <Form.Item
                            name="videoFile"
                            label="Video File Path"
                            help="Path to the video file to upload"
                            rules={[{ required: true, message: 'Please enter video file path' }]}
                          >
                            <Input placeholder="/path/to/video.mp4" />
                          </Form.Item>
                          <Form.Item
                            name="caption"
                            label="Caption"
                            help="Caption for the TikTok video"
                          >
                            <TextArea
                              rows={3}
                              placeholder="{{tikTokCaption}} or video caption..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="privacy"
                            label="Privacy Setting"
                            help="Who can see this video"
                            initialValue="public"
                          >
                            <Select>
                              <Select.Option value="public">Public</Select.Option>
                              <Select.Option value="friends">Friends Only</Select.Option>
                              <Select.Option value="private">Private</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_user_info' && (
                        <Form.Item
                          name="userId"
                          label="User ID"
                          help="TikTok user ID to get information about"
                          rules={[{ required: true, message: 'Please enter user ID' }]}
                        >
                          <Input placeholder="TikTok user ID" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_videos' && (
                        <Form.Item
                          name="maxResults"
                          label="Max Results"
                          help="Maximum number of videos to retrieve"
                          initialValue={10}
                        >
                          <InputNumber min={1} max={50} style={{ width: '100%' }} />
                        </Form.Item>
                      )}
                      
                      {action === 'get_hashtag_videos' && (
                        <>
                          <Form.Item
                            name="hashtag"
                            label="Hashtag"
                            help="Hashtag to search for (without #)"
                            rules={[{ required: true, message: 'Please enter hashtag' }]}
                          >
                            <Input placeholder="trending" />
                          </Form.Item>
                          <Form.Item
                            name="maxResults"
                            label="Max Results"
                            help="Maximum number of videos to retrieve"
                            initialValue={10}
                          >
                            <InputNumber min={1} max={50} style={{ width: '100%' }} />
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
        message="API Access Requirements"
        description="TikTok for Developers API requires app approval and has strict content policies. Make sure your use case complies with TikTok's terms of service."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default TikTokNodeForm;
