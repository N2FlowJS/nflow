import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, FileSearchOutlined, SearchOutlined, CommentOutlined } from '@ant-design/icons';

interface JiraActionInfoProps {
  action: string;
  projectKey?: string;
  issueKey?: string;
}

const JiraActionInfo: React.FC<JiraActionInfoProps> = ({ action, projectKey, issueKey }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'create_issue': return <PlusOutlined />;
      case 'update_issue': return <EditOutlined />;
      case 'get_issue': return <FileSearchOutlined />;
      case 'search_issues': return <SearchOutlined />;
      case 'add_comment': return <CommentOutlined />;
      default: return <PlusOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'create_issue': return 'green';
      case 'update_issue': return 'blue';
      case 'get_issue': return 'orange';
      case 'search_issues': return 'purple';
      case 'add_comment': return 'cyan';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'create_issue': return 'Create Issue';
      case 'update_issue': return 'Update Issue';
      case 'get_issue': return 'Get Issue';
      case 'search_issues': return 'Search Issues';
      case 'add_comment': return 'Add Comment';
      default: return act;
    }
  };

  return (
    <Flex vertical gap={4}>
      <Flex align="center" gap={4}>
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          Action:
        </Typography.Text>
        <Tag color={getActionColor(action)} style={{ fontSize: '11px' }}>
          {getActionIcon(action)}
          <span style={{ marginLeft: 4 }}>{getActionLabel(action)}</span>
        </Tag>
      </Flex>
      
      {(action === 'create_issue' && projectKey) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Project: {projectKey}
        </Typography.Text>
      )}
      
      {((action === 'update_issue' || action === 'get_issue' || action === 'add_comment') && issueKey) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Issue: {issueKey}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default JiraActionInfo;
