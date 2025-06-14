import React from 'react';
import { Flex, Typography, Tag } from 'antd';
import { MessageOutlined, PlusOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

interface MattermostActionInfoProps {
  action: string;
  channelId?: string;
  teamId?: string;
}

const MattermostActionInfo: React.FC<MattermostActionInfoProps> = ({ action, channelId, teamId }) => {
  const getActionIcon = (act: string) => {
    switch (act) {
      case 'send_message': return <MessageOutlined />;
      case 'create_channel': return <PlusOutlined />;
      case 'get_channels': return <TeamOutlined />;
      case 'get_users': return <UserOutlined />;
      default: return <MessageOutlined />;
    }
  };

  const getActionColor = (act: string) => {
    switch (act) {
      case 'send_message': return 'blue';
      case 'create_channel': return 'green';
      case 'get_channels': return 'orange';
      case 'get_users': return 'purple';
      default: return 'default';
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'send_message': return 'Send Message';
      case 'create_channel': return 'Create Channel';
      case 'get_channels': return 'Get Channels';
      case 'get_users': return 'Get Users';
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
      
      {(action === 'send_message' && channelId) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Channel: {channelId.length > 15 ? `${channelId.substring(0, 15)}...` : channelId}
        </Typography.Text>
      )}
      
      {((action === 'create_channel' || action === 'get_channels') && teamId) && (
        <Typography.Text style={{ fontSize: '11px', color: '#666' }}>
          Team: {teamId.length > 15 ? `${teamId.substring(0, 15)}...` : teamId}
        </Typography.Text>
      )}
    </Flex>
  );
};

export default MattermostActionInfo;
