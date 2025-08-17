import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { PlusOutlined, BranchesOutlined, ProjectOutlined, FileSearchOutlined, CommentOutlined } from '@ant-design/icons';

interface GitLabActionInfoProps {
  action: string;
  projectId?: string;
  title?: string;
}

const GitLabActionInfo: React.FC<GitLabActionInfoProps> = ({ action, projectId, title }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'create_issue': return <PlusOutlined />;
      case 'create_merge_request': return <BranchesOutlined />;
      case 'get_project': return <ProjectOutlined />;
      case 'get_issues': return <FileSearchOutlined />;
      case 'create_comment': return <CommentOutlined />;
      default: return <PlusOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'create_issue': return 'green';
      case 'create_merge_request': return 'blue';
      case 'get_project': return 'orange';
      case 'get_issues': return 'purple';
      case 'create_comment': return 'cyan';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'create_issue': return 'Create Issue';
      case 'create_merge_request': return 'Create MR';
      case 'get_project': return 'Get Project';
      case 'get_issues': return 'Get Issues';
      case 'create_comment': return 'Add Comment';
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
      
      {projectId && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Project: {projectId.length > 15 ? `${projectId.substring(0, 15)}...` : projectId}
        </Typography.Text>
      )}
      
      {((action === 'create_issue' || action === 'create_merge_request') && title) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Title: {title.length > 20 ? `${title.substring(0, 20)}...` : title}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default GitLabActionInfo;
