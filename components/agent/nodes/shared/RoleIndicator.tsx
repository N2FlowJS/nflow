import { CodeOutlined, RobotOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import React from 'react';

interface RoleIndicatorProps {
  role: 'developer' | 'assistant' | 'system' | 'user';
  showLabel?: boolean;
}

const RoleIndicator: React.FC<RoleIndicatorProps> = ({ role, showLabel = false }) => {
  // Define role configurations
  const roleConfigs = {
    system: {
      color: 'purple',
      icon: <SettingOutlined />,
      label: 'System',
      tooltip: 'System message (instructions & context)'
    },
    user: {
      color: 'blue',
      icon: <UserOutlined />,
      label: 'User',
      tooltip: 'User message (human input)'
    },
    assistant: {
      color: 'green',
      icon: <RobotOutlined />,
      label: 'Assistant',
      tooltip: 'Assistant message (AI response)'
    },
    developer: {
      color: 'gold',
      icon: <CodeOutlined />,
      label: 'Developer',
      tooltip: 'Developer message (technical context)'
    }
  };

  const config = roleConfigs[role];

  return (
    <Tooltip title={config.tooltip}>
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{ display: 'flex', alignItems: 'center', marginRight: 0 }}
      >
        {showLabel && config.label}
      </Tag>
    </Tooltip>
  );
};

export default RoleIndicator;
