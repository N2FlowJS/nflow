import { InstagramOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from './base-node-form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface InstagramNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const InstagramNodeForm: React.FC<InstagramNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Instagram Node"
        description="Interact with Instagram Graph API for posts, stories, and business insights. Requires Instagram Business account and access token."
        type="info"
        showIcon
        icon={<InstagramOutlined />}
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
                rules={[{ required: true, message: 'Please enter Instagram access token' }]}
              >
                <Input.Password placeholder="Your Instagram Graph API access token" />
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
                help="Choose what Instagram operation to perform"
                initialValue="create_post"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_post">Create Post</Select.Option>
                  <Select.Option value="get_posts">Get Posts</Select.Option>
                  <Select.Option value="get_user_info">Get User Info</Select.Option>
                  <Select.Option value="get_media">Get Media</Select.Option>
                  <Select.Option value="create_story">Create Story</Select.Option>
                  <Select.Option value="get_insights">Get Insights</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <InstagramOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'create_post' && (
                        <>
                          <Form.Item
                            name="caption"
                            label="Caption"
                            help="Post caption (optional)"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{postCaption}} or your caption..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="mediaUrl"
                            label="Media URL"
                            help="URL of the image or video to post"
                            rules={[{ required: true, message: 'Please enter media URL' }]}
                          >
                            <Input placeholder="https://example.com/image.jpg" />
                          </Form.Item>
                          <Form.Item
                            name="mediaType"
                            label="Media Type"
                            help="Type of media content"
                            initialValue="image"
                          >
                            <Select>
                              <Select.Option value="image">Image</Select.Option>
                              <Select.Option value="video">Video</Select.Option>
                              <Select.Option value="carousel">Carousel</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'create_story' && (
                        <Form.Item
                          name="storyMediaUrl"
                          label="Story Media URL"
                          help="URL of the image or video for story"
                          rules={[{ required: true, message: 'Please enter story media URL' }]}
                        >
                          <Input placeholder="https://example.com/story.jpg" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_user_info' && (
                        <Form.Item
                          name="userId"
                          label="User ID (Optional)"
                          help="Instagram user ID, leave empty for current user"
                        >
                          <Input placeholder="Instagram user ID" />
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
        message="API Requirements"
        description="Instagram Graph API requires a Facebook App with Instagram Basic Display or Instagram Graph API permissions. Make sure your access token has the required scopes."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default InstagramNodeForm;
