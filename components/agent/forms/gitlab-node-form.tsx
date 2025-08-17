import { GitlabOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface GitLabNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GitLabNodeForm: React.FC<GitLabNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="GitLab Node"
        description="Interact with GitLab for project management. Create issues, merge requests, manage projects, and collaborate on code."
        type="info"
        showIcon
        icon={<GitlabOutlined />}
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
                  label="GitLab Server URL"
                  help="Your GitLab server URL (e.g., https://gitlab.com or your self-hosted instance)"
                  rules={[{ required: true, message: 'Please enter the server URL' }]}
                >
                  <Input placeholder="https://gitlab.com" />
                </Form.Item>

                <Form.Item
                  name="accessToken"
                  label="Access Token"
                  help="Personal access token for authentication"
                  rules={[{ required: true, message: 'Please enter the access token' }]}
                >
                  <Input.Password placeholder="Personal access token" />
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
                initialValue="create_issue"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_issue">Create Issue</Select.Option>
                  <Select.Option value="create_merge_request">Create Merge Request</Select.Option>
                  <Select.Option value="get_project">Get Project Info</Select.Option>
                  <Select.Option value="get_issues">Get Issues</Select.Option>
                  <Select.Option value="create_comment">Add Comment</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <GitlabOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'create_issue' || action === 'create_merge_request' || action === 'get_project' || action === 'get_issues') && (
                        <Form.Item
                          name="projectId"
                          label="Project ID"
                          help="GitLab project ID or path (e.g., 123 or group/project)"
                          rules={[{ required: true, message: 'Please enter project ID' }]}
                        >
                          <Input placeholder="123 or group/project-name" />
                        </Form.Item>
                      )}
                      
                      {(action === 'create_issue' || action === 'create_merge_request') && (
                        <>
                          <Form.Item
                            name="title"
                            label="Title"
                            help="Title for the issue or merge request"
                            rules={[{ required: true, message: 'Please enter title' }]}
                          >
                            <Input placeholder="{{issueTitle}} or direct title" />
                          </Form.Item>
                          <Form.Item
                            name="description"
                            label="Description"
                            help="Detailed description"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{description}} or direct description"
                            />
                          </Form.Item>
                          <Form.Item
                            name="assigneeId"
                            label="Assignee ID"
                            help="User ID to assign to (optional)"
                          >
                            <Input placeholder="User ID" />
                          </Form.Item>
                          <Form.Item
                            name="labels"
                            label="Labels"
                            help="Comma-separated list of labels"
                          >
                            <Input placeholder="bug,enhancement,priority::high" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'create_merge_request' && (
                        <>
                          <Form.Item
                            name="sourceBranch"
                            label="Source Branch"
                            help="Branch to merge from"
                            rules={[{ required: true, message: 'Please enter source branch' }]}
                          >
                            <Input placeholder="feature-branch" />
                          </Form.Item>
                          <Form.Item
                            name="targetBranch"
                            label="Target Branch"
                            help="Branch to merge into"
                            rules={[{ required: true, message: 'Please enter target branch' }]}
                          >
                            <Input placeholder="main" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'create_comment' && (
                        <>
                          <Form.Item
                            name="projectId"
                            label="Project ID"
                            help="Project ID containing the issue"
                            rules={[{ required: true, message: 'Please enter project ID' }]}
                          >
                            <Input placeholder="123" />
                          </Form.Item>
                          <Form.Item
                            name="issueIid"
                            label="Issue IID"
                            help="Internal ID of the issue"
                            rules={[{ required: true, message: 'Please enter issue IID' }]}
                          >
                            <Input placeholder="42" />
                          </Form.Item>
                          <Form.Item
                            name="comment"
                            label="Comment"
                            help="Comment to add"
                            rules={[{ required: true, message: 'Please enter comment' }]}
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{commentText}} or direct comment"
                            />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'get_project' && (
                        <Alert
                          message="Project Information"
                          description="This action retrieves detailed information about the specified project."
                          type="info"
                        />
                      )}
                      
                      {action === 'get_issues' && (
                        <Alert
                          message="Project Issues"
                          description="This action retrieves all issues from the specified project."
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

export default GitLabNodeForm;
