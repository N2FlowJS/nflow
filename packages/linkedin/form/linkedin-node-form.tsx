import { LinkedinOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface LinkedInNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LinkedInNodeForm: React.FC<LinkedInNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="LinkedIn Node"
        description="Interact with LinkedIn API for professional networking, posts, and company data. Requires LinkedIn API access."
        type="info"
        showIcon
        icon={<LinkedinOutlined />}
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
                rules={[{ required: true, message: 'Please enter LinkedIn access token' }]}
              >
                <Input.Password placeholder="Your LinkedIn API access token" />
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
                help="Choose what LinkedIn operation to perform"
                initialValue="create_post"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_post">Create Post</Select.Option>
                  <Select.Option value="get_profile">Get Profile</Select.Option>
                  <Select.Option value="get_company_info">Get Company Info</Select.Option>
                  <Select.Option value="create_article">Create Article</Select.Option>
                  <Select.Option value="get_connections">Get Connections</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <LinkedinOutlined style={{ marginRight: 8 }} />
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
                            name="postText"
                            label="Post Content"
                            help="Content of the LinkedIn post"
                            rules={[{ required: true, message: 'Please enter post content' }]}
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{linkedinPost}} or your post content..."
                            />
                          </Form.Item>
                          <Form.Item
                            name="visibility"
                            label="Post Visibility"
                            help="Who can see this post"
                            initialValue="public"
                          >
                            <Select>
                              <Select.Option value="public">Public</Select.Option>
                              <Select.Option value="connections">Connections Only</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="mediaUrl"
                            label="Media URL (Optional)"
                            help="URL of image or video to include"
                          >
                            <Input placeholder="https://example.com/image.jpg" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'create_article' && (
                        <>
                          <Form.Item
                            name="articleTitle"
                            label="Article Title"
                            help="Title of the LinkedIn article"
                            rules={[{ required: true, message: 'Please enter article title' }]}
                          >
                            <Input placeholder="{{articleTitle}} or article title" />
                          </Form.Item>
                          <Form.Item
                            name="articleContent"
                            label="Article Content"
                            help="Main content of the article"
                            rules={[{ required: true, message: 'Please enter article content' }]}
                          >
                            <TextArea
                              rows={6}
                              placeholder="{{articleContent}} or article content..."
                            />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_company_info' && (
                        <Form.Item
                          name="companyId"
                          label="Company ID"
                          help="LinkedIn company ID to get information about"
                          rules={[{ required: true, message: 'Please enter company ID' }]}
                        >
                          <Input placeholder="12345678" />
                        </Form.Item>
                      )}
                      
                      {action === 'get_profile' && (
                        <Form.Item
                          name="personId"
                          label="Person ID (Optional)"
                          help="LinkedIn person ID, leave empty for current user"
                        >
                          <Input placeholder="LinkedIn person ID" />
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
        message="API Access Note"
        description="LinkedIn API requires application approval and specific permissions. Make sure your app has the required scopes for the operations you want to perform."
        type="warning"
        style={{ marginTop: 16, marginBottom: 16 }}
      />

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default LinkedInNodeForm;
