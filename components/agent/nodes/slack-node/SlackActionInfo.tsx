import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { MessageOutlined, PlusOutlined, TeamOutlined, UserOutlined, FileOutlined } from '@ant-design/icons';

interface SlackActionInfoProps {
  action: string;
  channelId?: string;
  fileName?: string;
}

const SlackActionInfo: React.FC<SlackActionInfoProps> = ({ action, channelId, fileName }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'send_message': return <MessageOutlined />;
      case 'create_channel': return <PlusOutlined />;
      case 'get_channels': return <TeamOutlined />;
      case 'get_users': return <UserOutlined />;
      case 'upload_file': return <FileOutlined />;
      default: return <MessageOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'send_message': return 'blue';
      case 'create_channel': return 'green';
      case 'get_channels': return 'orange';
      case 'get_users': return 'purple';
      case 'upload_file': return 'cyan';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'send_message': return 'Send Message';
      case 'create_channel': return 'Create Channel';
      case 'get_channels': return 'Get Channels';
      case 'get_users': return 'Get Users';
      case 'upload_file': return 'Upload File';
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
      
      {((action === 'send_message' || action === 'upload_file') && channelId) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Channel: {channelId.length > 15 ? `${channelId.substring(0, 15)}...` : channelId}
        </Typography.Text>
      )}
      
      {(action === 'upload_file' && fileName) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          File: {fileName.length > 15 ? `${fileName.substring(0, 15)}...` : fileName}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default SlackActionInfo;
