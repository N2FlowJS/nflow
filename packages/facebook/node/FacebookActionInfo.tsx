import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { PlusOutlined, InfoCircleOutlined, FileSearchOutlined, CommentOutlined, BarChartOutlined, PictureOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface FacebookActionInfoProps {
  action: string;
  postId?: string;
  scheduled?: boolean;
}

const FacebookActionInfo: React.FC<FacebookActionInfoProps> = ({ action, postId, scheduled }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'create_post': return <PlusOutlined />;
      case 'get_page_info': return <InfoCircleOutlined />;
      case 'get_posts': return <FileSearchOutlined />;
      case 'create_comment': return <CommentOutlined />;
      case 'get_page_insights': return <BarChartOutlined />;
      case 'upload_photo': return <PictureOutlined />;
      default: return <PlusOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'create_post': return 'blue';
      case 'get_page_info': return 'orange';
      case 'get_posts': return 'purple';
      case 'create_comment': return 'cyan';
      case 'get_page_insights': return 'green';
      case 'upload_photo': return 'magenta';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'create_post': return 'Create Post';
      case 'get_page_info': return 'Page Info';
      case 'get_posts': return 'Get Posts';
      case 'create_comment': return 'Add Comment';
      case 'get_page_insights': return 'Page Insights';
      case 'upload_photo': return 'Upload Photo';
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
      
      {(action === 'create_comment' && postId) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Post: {postId.length > 15 ? `${postId.substring(0, 15)}...` : postId}
        </Typography.Text>
      )}
      
      {((action === 'create_post' || action === 'upload_photo') && scheduled) && (
        <Tag color="gold" style={{ fontSize: '11px' }}>
          <ClockCircleOutlined style={{ marginRight: 2 }} />
          Scheduled
        </Tag>
      )}
    </Flex>
  );
};

export default FacebookActionInfo;
