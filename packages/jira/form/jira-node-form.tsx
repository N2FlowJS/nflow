import { BugOutlined, LinkOutlined } from '@ant-design/icons';
import { FlowNode } from '../../../models/flowTypes';
import { Collapse, Space, Typography, Alert } from 'antd';
import TextInputField from '../../@input/TextInputField';
import TextAreaField from '../../@input/TextAreaField';
import React from 'react';
import BaseNodeForm from '../../@flow/form';
import InputReferences from '@n2flowjs/flow/share/InputReferences';
import RoleSelector from '@n2flowjs/flow/share/RoleSelector';

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
        description="Integrate with Jira for issue management, project tracking, and workflow automation."
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
                <TextInputField
                  name="host"
                  label="Jira Host"
                  required
                  placeholder="your-domain.atlassian.net"
                />
                <TextInputField
                  name="email"
                  label="Email"
                  required
                  placeholder="your@email.com"
                />
                <TextInputField
                  name="apiToken"
                  label="API Token"
                  required
                  type="password"
                  placeholder="your-api-token"
                />
              </Space>
            ),
          },
          {
            key: 'action',
            label: (
              <Text strong>
                Action Configuration
              </Text>
            ),
            children: (
              <TextInputField
                name="action"
                label="Action Type"
                required
                placeholder="create_issue | update_issue | get_issue | search_issues | add_comment"
              />
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
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <TextInputField
                  name="projectKey"
                  label="Project Key"
                  required
                  placeholder="PROJ"
                />
                <TextInputField
                  name="issueType"
                  label="Issue Type"
                  required
                  placeholder="Bug | Task | Story | Epic"
                />
                <TextInputField
                  name="summary"
                  label="Summary"
                  required
                  placeholder="{{issueTitle}} or direct title"
                />
                <TextAreaField
                  name="description"
                  label="Description"
                  placeholder="{{issueDescription}} or direct description"
                  rows={4}
                />
                <TextInputField
                  name="assignee"
                  label="Assignee"
                  placeholder="username"
                />
                <TextInputField
                  name="priority"
                  label="Priority"
                  placeholder="Highest | High | Medium | Low | Lowest"
                />
                <TextInputField
                  name="issueKey"
                  label="Issue Key"
                  placeholder="PROJ-123"
                />
                <TextAreaField
                  name="comment"
                  label="Comment"
                  placeholder="{{commentText}} or direct comment"
                  rows={4}
                />
                <TextAreaField
                  name="jql"
                  label="JQL Query"
                  placeholder="project = PROJ AND status = 'To Do'"
                  rows={3}
                />
              </Space>
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
