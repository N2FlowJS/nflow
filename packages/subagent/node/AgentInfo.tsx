import { TeamOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Typography } from 'antd';
import React from 'react';

interface AgentInfoProps {
  agentId: string;
  agentName: string;
}

const AgentInfo: React.FC<AgentInfoProps> = ({ agentId, agentName }) => {
  const hasAgent = agentId && agentId.trim().length > 0;
  
  return (
    <Card
      size="small"
      title={
        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
          <TeamOutlined style={{ marginRight: 4 }} />
          Target Agent
        </Typography.Text>
      }
      style={{
        width: '100%',
        borderColor: hasAgent ? '#91caff' : '#ffccc7',
      }}
    >
      {hasAgent ? (
        <div>
          <Typography.Text 
            strong 
            style={{ 
              fontSize: '12px',
              display: 'block',
              marginBottom: 4
            }}
          >
            {agentName || 'Unnamed Agent'}
          </Typography.Text>
          <Typography.Text 
            type="secondary" 
            style={{ 
              fontSize: '11px',
              fontFamily: 'monospace'
            }}
          >
            ID: {agentId.substring(0, 8)}...
          </Typography.Text>
        </div>
      ) : (
        <Typography.Text type="warning" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
          <WarningOutlined style={{ marginRight: 4 }} />
          No agent selected
        </Typography.Text>
      )}
    </Card>
  );
};

export default AgentInfo;
