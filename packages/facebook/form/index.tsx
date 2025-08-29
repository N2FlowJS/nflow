import { FlowNode } from '../../../models/flowTypes';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';
import { Form, Input, Select, Collapse, Space, Typography, Alert, Switch, DatePicker } from 'antd';
import { FacebookOutlined, LinkOutlined, SettingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface FacebookNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FacebookNodeForm: React.FC<FacebookNodeFormProps> = (props) => {
  const { selectedNode } = props;
  const { t } = useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Facebook Node"
        description="Interact with Facebook for social media management. Create posts, manage pages, upload photos and engage with your audience."
        type="info"
        showIcon
        icon={<FacebookOutlined />}
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
                {t('facebook.connectionSettings')}
              </Text>
            ),
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Form.Item
                  name="accessToken"
                  label="Facebook Access Token"
                  help="Facebook page access token for API authentication"
                  rules={[{ required: true, message: 'Please enter Facebook access token' }]}
                >
                  <Input.Password placeholder="Facebook Page Access Token" />
                </Form.Item>

                <Form.Item
                  name="pageId"
                  label="Page ID (Optional)"
                  help="Facebook page ID for page-specific operations"
                >
                  <Input placeholder="Facebook Page ID" />
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
                help="Choose what action to perform"
                initialValue="create_post"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_post">Create Post</Select.Option>
                  <Select.Option value="get_page_info">Get Page Info</Select.Option>
                  <Select.Option value="get_posts">Get Posts</Select.Option>
                  <Select.Option value="create_comment">Create Comment</Select.Option>
                  <Select.Option value="get_page_insights">Get Page Insights</Select.Option>
                  <Select.Option value="upload_photo">Upload Photo</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <FacebookOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');

                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'create_post' || action === 'upload_photo') && (
                        <>
                          <Form.Item
                            name="message"
                            label="Post Message"
                            help="Content for the post"
                            rules={[{ required: true, message: 'Please enter post message' }]}
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{postContent}} or direct message"
                            />
                          </Form.Item>

                          {action === 'create_post' && (
                            <Form.Item
                              name="link"
                              label="Link (Optional)"
                              help="URL to include with the post"
                            >
                              <Input placeholder="https://example.com" />
                            </Form.Item>
                          )}

                          {action === 'upload_photo' && (
                            <Form.Item
                              name="photoUrl"
                              label="Photo URL"
                              help="URL of the photo to upload"
                              rules={[{ required: true, message: 'Please enter photo URL' }]}
                            >
                              <Input placeholder="https://example.com/photo.jpg" />
                            </Form.Item>
                          )}

                          <Form.Item
                            name="scheduled"
                            label="Schedule Post"
                            help="Schedule the post for later"
                            valuePropName="checked"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item shouldUpdate>
                            {({ getFieldValue }) => {
                              const scheduled = getFieldValue('scheduled');
                              return scheduled ? (
                                <Form.Item
                                  name="scheduledTime"
                                  label="Scheduled Time"
                                  help="When to publish the post (must be in the future)"
                                  rules={[{ required: true, message: 'Please select scheduled time' }]}
                                >
                                  <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    style={{ width: '100%' }}
                                  />
                                </Form.Item>
                              ) : null;
                            }}
                          </Form.Item>
                        </>
                      )}

                      {action === 'create_comment' && (
                        <>
                          <Form.Item
                            name="postId"
                            label="Post ID"
                            help="ID of the post to comment on"
                            rules={[{ required: true, message: 'Please enter post ID' }]}
                          >
                            <Input placeholder="Post ID" />
                          </Form.Item>
                          <Form.Item
                            name="comment"
                            label="Comment"
                            help="Comment to add to the post"
                            rules={[{ required: true, message: 'Please enter comment' }]}
                          >
                            <TextArea
                              rows={3}
                              placeholder="{{commentText}} or direct comment"
                            />
                          </Form.Item>
                        </>
                      )}

                      {(action === 'get_page_info' || action === 'get_posts' || action === 'get_page_insights') && (
                        <Alert
                          message="No additional parameters needed"
                          description={`This action retrieves ${
                            action === 'get_page_info' ? 'page information' :
                            action === 'get_posts' ? 'recent posts' : 'page insights and analytics'
                          } from the specified Facebook page.`}
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

export default FacebookNodeForm;
