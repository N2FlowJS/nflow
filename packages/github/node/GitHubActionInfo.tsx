import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { PlusOutlined, BranchesOutlined, InfoCircleOutlined, FileSearchOutlined, CommentOutlined, MergeOutlined } from '@ant-design/icons';

interface GitHubActionInfoProps {
  action: string;
  issueNumber?: string;
  pullNumber?: string;
}

const GitHubActionInfo: React.FC<GitHubActionInfoProps> = ({ action, issueNumber, pullNumber }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'create_issue': return <PlusOutlined />;
      case 'create_pull_request': return <BranchesOutlined />;
      case 'get_repository': return <InfoCircleOutlined />;
      case 'get_issues': return <FileSearchOutlined />;
      case 'get_pull_requests': return <BranchesOutlined />;
      case 'add_comment': return <CommentOutlined />;
      case 'merge_pull_request': return <MergeOutlined />;
      default: return <PlusOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'create_issue': return 'green';
      case 'create_pull_request': return 'blue';
      case 'get_repository': return 'orange';
      case 'get_issues': return 'purple';
      case 'get_pull_requests': return 'cyan';
      case 'add_comment': return 'geekblue';
      case 'merge_pull_request': return 'volcano';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'create_issue': return 'Create Issue';
      case 'create_pull_request': return 'Create PR';
      case 'get_repository': return 'Get Repo';
      case 'get_issues': return 'Get Issues';
      case 'get_pull_requests': return 'Get PRs';
      case 'add_comment': return 'Add Comment';
      case 'merge_pull_request': return 'Merge PR';
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

      {(action === 'add_comment' && issueNumber) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Issue/PR: #{issueNumber}
        </Typography.Text>
      )}

      {(action === 'merge_pull_request' && pullNumber) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          PR: #{pullNumber}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default GitHubActionInfo;
