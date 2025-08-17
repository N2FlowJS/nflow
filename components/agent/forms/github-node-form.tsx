import { GithubOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';
import { useLocale } from '../../../locale';

const { TextArea } = Input;
const { Text } = Typography;

interface GitHubNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GitHubNodeForm: React.FC<GitHubNodeFormProps> = (props) => {
  const { selectedNode } = props;
  useLocale('form.nodeForm');

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="GitHub Node"
        description="Interact with GitHub for repository management. Create issues, pull requests, manage repositories and collaborate on code."
        type="info"
        showIcon
        icon={<GithubOutlined />}
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
                  name="token"
                  label="GitHub Token"
                  help="Personal access token for GitHub API authentication"
                  rules={[{ required: true, message: 'Please enter GitHub token' }]}
                >
                  <Input.Password placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" />
                </Form.Item>

                <Form.Item
                  name="owner"
                  label="Repository Owner"
                  help="GitHub username or organization name"
                  rules={[{ required: true, message: 'Please enter repository owner' }]}
                >
                  <Input placeholder="username or organization" />
                </Form.Item>

                <Form.Item
                  name="repository"
                  label="Repository Name"
                  help="Name of the GitHub repository"
                  rules={[{ required: true, message: 'Please enter repository name' }]}
                >
                  <Input placeholder="repository-name" />
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
                  <Select.Option value="create_pull_request">Create Pull Request</Select.Option>
                  <Select.Option value="get_repository">Get Repository Info</Select.Option>
                  <Select.Option value="get_issues">Get Issues</Select.Option>
                  <Select.Option value="get_pull_requests">Get Pull Requests</Select.Option>
                  <Select.Option value="add_comment">Add Comment</Select.Option>
                  <Select.Option value="merge_pull_request">Merge Pull Request</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <GithubOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {(action === 'create_issue' || action === 'create_pull_request') && (
                        <>
                          <Form.Item
                            name="title"
                            label="Title"
                            help="Title for the issue or pull request"
                            rules={[{ required: true, message: 'Please enter title' }]}
                          >
                            <Input placeholder="{{issueTitle}} or direct title" />
                          </Form.Item>
                          <Form.Item
                            name="body"
                            label="Description"
                            help="Detailed description or body content"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{description}} or direct description"
                            />
                          </Form.Item>
                          <Form.Item
                            name="labels"
                            label="Labels"
                            help="Comma-separated list of labels"
                          >
                            <Input placeholder="bug,enhancement,priority:high" />
                          </Form.Item>
                          <Form.Item
                            name="assignees"
                            label="Assignees"
                            help="Comma-separated list of usernames to assign"
                          >
                            <Input placeholder="username1,username2" />
                          </Form.Item>
                        </>
                      )}
                      
                      {action === 'create_pull_request' && (
                        <>
                          <Form.Item
                            name="head"
                            label="Head Branch"
                            help="Branch containing the changes"
                            rules={[{ required: true, message: 'Please enter head branch' }]}
                          >
                            <Input placeholder="feature-branch" />
                          </Form.Item>
                          <Form.Item
                            name="base"
                            label="Base Branch"
                            help="Branch to merge into"
                            rules={[{ required: true, message: 'Please enter base branch' }]}
                          >
                            <Input placeholder="main" />
                          </Form.Item>
                        </>
                      )}
                      
                      {(action === 'add_comment') && (
                        <>
                          <Form.Item
                            name="issueNumber"
                            label="Issue/PR Number"
                            help="Issue or Pull Request number to comment on"
                            rules={[{ required: true, message: 'Please enter issue/PR number' }]}
                          >
                            <Input placeholder="123" />
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
                      
                      {action === 'merge_pull_request' && (
                        <Form.Item
                          name="pullNumber"
                          label="Pull Request Number"
                          help="Pull request number to merge"
                          rules={[{ required: true, message: 'Please enter pull request number' }]}
                        >
                          <Input placeholder="123" />
                        </Form.Item>
                      )}
                      
                      {(action === 'get_repository' || action === 'get_issues' || action === 'get_pull_requests') && (
                        <Alert
                          message="No additional parameters needed"
                          description={`This action retrieves ${
                            action === 'get_repository' ? 'repository information' : 
                            action === 'get_issues' ? 'all issues' : 'all pull requests'
                          } from the specified repository.`}
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

export default GitHubNodeForm;
