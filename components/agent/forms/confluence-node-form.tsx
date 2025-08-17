import { FileTextOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface ConfluenceNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ConfluenceNodeForm: React.FC<ConfluenceNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Confluence Node"
        description="Interact with Confluence for content management. Create pages, update documentation, and manage knowledge base content."
        type="info"
        showIcon
        icon={<FileTextOutlined />}
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
                  label="Confluence Server URL"
                  help="Your Confluence server URL (e.g., https://company.atlassian.net)"
                  rules={[{ required: true, message: 'Please enter the server URL' }]}
                >
                  <Input placeholder="https://your-domain.atlassian.net" />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Username/Email"
                  help="Your Confluence username or email address"
                  rules={[{ required: true, message: 'Please enter your username' }]}
                >
                  <Input placeholder="user@company.com" />
                </Form.Item>

                <Form.Item
                  name="apiToken"
                  label="API Token"
                  help="API token for authentication (generate from Confluence settings)"
                  rules={[{ required: true, message: 'Please enter the API token' }]}
                >
                  <Input.Password placeholder="API token" />
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
                initialValue="create_page"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_page">Create Page</Select.Option>
                  <Select.Option value="update_page">Update Page</Select.Option>
                  <Select.Option value="get_page">Get Page</Select.Option>
                  <Select.Option value="search_pages">Search Pages</Select.Option>
                  <Select.Option value="add_comment">Add Comment</Select.Option>
                  <Select.Option value="get_spaces">Get Spaces</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'create_page' || action === 'update_page' || action === 'get_page' || action === 'search_pages') && (
                        <Form.Item
                          name="spaceKey"
                          label="Space Key"
                          help="Confluence space key (e.g., DOCS, TEAM)"
                          rules={action !== 'get_spaces' ? [{ required: true, message: 'Please enter space key' }] : []}
                        >
                          <Input placeholder="DOCS" />
                        </Form.Item>
                      )}
                      
                      {(action === 'create_page' || action === 'update_page') && (
                        <>
                          <Form.Item
                            name="title"
                            label="Page Title"
                            help="Title for the page"
                            rules={[{ required: true, message: 'Please enter page title' }]}
                          >
                            <Input placeholder="{{pageTitle}} or direct title" />
                          </Form.Item>
                          <Form.Item
                            name="content"
                            label="Page Content"
                            help="Content for the page (supports Confluence storage format)"
                            rules={[{ required: true, message: 'Please enter page content' }]}
                          >
                            <TextArea
                              rows={6}
                              placeholder="{{pageContent}} or direct content"
                            />
                          </Form.Item>
                          {action === 'create_page' && (
                            <Form.Item
                              name="parentPageId"
                              label="Parent Page ID"
                              help="Optional parent page ID for creating child pages"
                            >
                              <Input placeholder="Parent page ID (optional)" />
                            </Form.Item>
                          )}
                        </>
                      )}
                      
                      {(action === 'update_page' || action === 'get_page' || action === 'add_comment') && (
                        <Form.Item
                          name="pageId"
                          label="Page ID"
                          help="Confluence page ID"
                          rules={[{ required: true, message: 'Please enter page ID' }]}
                        >
                          <Input placeholder="Page ID" />
                        </Form.Item>
                      )}
                      
                      {action === 'search_pages' && (
                        <Form.Item
                          name="searchQuery"
                          label="Search Query"
                          help="CQL (Confluence Query Language) search query"
                          rules={[{ required: true, message: 'Please enter search query' }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="title ~ &quot;search term&quot; AND space = DOCS"
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'add_comment' && (
                        <Form.Item
                          name="comment"
                          label="Comment"
                          help="Comment to add to the page"
                          rules={[{ required: true, message: 'Please enter comment' }]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="{{commentText}} or direct comment"
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'get_spaces' && (
                        <Alert
                          message="No additional parameters needed"
                          description="This action retrieves all available Confluence spaces."
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

export default ConfluenceNodeForm;
