import { BugOutlined, SettingOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Form, Input, Select, Collapse, Space, Typography, Alert } from 'antd';
import React from 'react';
import BaseNodeForm from '../../../packages/@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

const { TextArea } = Input;
const { Text } = Typography;

interface JiraNodeFormProps {
  form: any;
  selectedNode: FlowNode;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const JiraNodeForm: React.FC<JiraNodeFormProps> = (props) => {
  const { selectedNode } = props;

  return (
    <BaseNodeForm {...props}>
      <Alert
        message="Jira Node"
        description="Interact with Jira for issue management. Create issues, update tickets, search with JQL, and manage project workflows."
        type="info"
        showIcon
        icon={<BugOutlined />}
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
                  label="Jira Server URL"
                  help="Your Jira server URL (e.g., https://company.atlassian.net)"
                  rules={[{ required: true, message: 'Please enter the server URL' }]}
                >
                  <Input placeholder="https://your-domain.atlassian.net" />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Username/Email"
                  help="Your Jira username or email address"
                  rules={[{ required: true, message: 'Please enter your username' }]}
                >
                  <Input placeholder="user@company.com" />
                </Form.Item>

                <Form.Item
                  name="apiToken"
                  label="API Token"
                  help="API token for authentication (generate from Jira settings)"
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
                initialValue="create_issue"
                rules={[{ required: true, message: 'Please select an action' }]}
              >
                <Select>
                  <Select.Option value="create_issue">Create Issue</Select.Option>
                  <Select.Option value="update_issue">Update Issue</Select.Option>
                  <Select.Option value="get_issue">Get Issue</Select.Option>
                  <Select.Option value="search_issues">Search Issues (JQL)</Select.Option>
                  <Select.Option value="add_comment">Add Comment</Select.Option>
                </Select>
              </Form.Item>
            ),
          },
          {
            key: 'parameters',
            label: (
              <Text strong>
                <BugOutlined style={{ marginRight: 8 }} />
                Action Parameters
              </Text>
            ),
            children: (
              <Form.Item shouldUpdate>
                {({ getFieldValue }) => {
                  const action = getFieldValue('action');
                  
                  return (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      {action === 'create_issue' && (
                        <>
                          <Form.Item
                            name="projectKey"
                            label="Project Key"
                            help="Jira project key (e.g., PROJ)"
                            rules={[{ required: true, message: 'Please enter project key' }]}
                          >
                            <Input placeholder="PROJ" />
                          </Form.Item>
                          <Form.Item
                            name="issueType"
                            label="Issue Type"
                            help="Type of issue to create"
                            rules={[{ required: true, message: 'Please enter issue type' }]}
                          >
                            <Select>
                              <Select.Option value="Bug">Bug</Select.Option>
                              <Select.Option value="Task">Task</Select.Option>
                              <Select.Option value="Story">Story</Select.Option>
                              <Select.Option value="Epic">Epic</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item
                            name="summary"
                            label="Summary"
                            help="Issue title/summary"
                            rules={[{ required: true, message: 'Please enter summary' }]}
                          >
                            <Input placeholder="{{issueTitle}} or direct title" />
                          </Form.Item>
                          <Form.Item
                            name="description"
                            label="Description"
                            help="Detailed description of the issue"
                          >
                            <TextArea
                              rows={4}
                              placeholder="{{issueDescription}} or direct description"
                            />
                          </Form.Item>
                          <Form.Item
                            name="assignee"
                            label="Assignee"
                            help="Username to assign the issue to"
                          >
                            <Input placeholder="username" />
                          </Form.Item>
                          <Form.Item
                            name="priority"
                            label="Priority"
                            help="Issue priority level"
                          >
                            <Select>
                              <Select.Option value="Highest">Highest</Select.Option>
                              <Select.Option value="High">High</Select.Option>
                              <Select.Option value="Medium">Medium</Select.Option>
                              <Select.Option value="Low">Low</Select.Option>
                              <Select.Option value="Lowest">Lowest</Select.Option>
                            </Select>
                          </Form.Item>
                        </>
                      )}
                      
                      {(action === 'update_issue' || action === 'get_issue' || action === 'add_comment') && (
                        <Form.Item
                          name="issueKey"
                          label="Issue Key"
                          help="Jira issue key (e.g., PROJ-123)"
                          rules={[{ required: true, message: 'Please enter issue key' }]}
                        >
                          <Input placeholder="PROJ-123" />
                        </Form.Item>
                      )}
                      
                      {action === 'add_comment' && (
                        <Form.Item
                          name="comment"
                          label="Comment"
                          help="Comment to add to the issue"
                          rules={[{ required: true, message: 'Please enter comment' }]}
                        >
                          <TextArea
                            rows={4}
                            placeholder="{{commentText}} or direct comment"
                          />
                        </Form.Item>
                      )}
                      
                      {action === 'search_issues' && (
                        <Form.Item
                          name="jql"
                          label="JQL Query"
                          help="Jira Query Language (JQL) for searching issues"
                          rules={[{ required: true, message: 'Please enter JQL query' }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="project = PROJ AND status = 'To Do'"
                          />
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

      <RoleSelector />
      <InputReferences form={props.form} nodeid={selectedNode.id} />
    </BaseNodeForm>
  );
};

export default JiraNodeForm;
