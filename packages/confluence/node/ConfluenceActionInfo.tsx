import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, FileSearchOutlined, SearchOutlined, CommentOutlined, AppstoreOutlined } from '@ant-design/icons';

interface ConfluenceActionInfoProps {
  action: string;
  spaceKey?: string;
  pageId?: string;
}

const ConfluenceActionInfo: React.FC<ConfluenceActionInfoProps> = ({ action, spaceKey, pageId }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'create_page': return <PlusOutlined />;
      case 'update_page': return <EditOutlined />;
      case 'get_page': return <FileSearchOutlined />;
      case 'search_pages': return <SearchOutlined />;
      case 'add_comment': return <CommentOutlined />;
      case 'get_spaces': return <AppstoreOutlined />;
      default: return <PlusOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'create_page': return 'green';
      case 'update_page': return 'blue';
      case 'get_page': return 'orange';
      case 'search_pages': return 'purple';
      case 'add_comment': return 'cyan';
      case 'get_spaces': return 'magenta';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'create_page': return 'Create Page';
      case 'update_page': return 'Update Page';
      case 'get_page': return 'Get Page';
      case 'search_pages': return 'Search Pages';
      case 'add_comment': return 'Add Comment';
      case 'get_spaces': return 'Get Spaces';
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
      
      {((action === 'create_page' || action === 'update_page' || action === 'search_pages') && spaceKey) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Space: {spaceKey}
        </Typography.Text>
      )}
      
      {((action === 'update_page' || action === 'get_page' || action === 'add_comment') && pageId) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Page: {pageId.length > 15 ? `${pageId.substring(0, 15)}...` : pageId}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default ConfluenceActionInfo;
