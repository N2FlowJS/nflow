import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { Badge, Button, Empty, List, Space } from 'antd';
import React from 'react';


interface Agent {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  ownerType: string;
  createdAt: string;
  updatedAt: string;
}

interface UserAgentsTabProps {
  isCurrentUser: boolean;
  agents: Agent[];
  onShowCreateAgent: () => void;
}

const UserAgentsTab: React.FC<UserAgentsTabProps> = ({
  isCurrentUser,
  agents,
  onShowCreateAgent
}) => {
  return (
    <div className="agents-container">
      {agents?.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span>
              {isCurrentUser ? 
                "You haven't created any agents yet" : 
                "This user hasn't created any agents"}
            </span>
          }
        >
          {isCurrentUser && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onShowCreateAgent}
            >
              Create Agent
            </Button>
          )}
        </Empty>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={agents}
          renderItem={(agent) => (
            <List.Item
              className="agent-list-item"
              actions={[
                <Button 
                  key="view" 
                  type="link"
                  onClick={() => window.location.href = `/agent/${agent.id}`}
                >
                  Open Agent
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="agent-avatar">
                    <RobotOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
                  </div>
                }
                title={
                  <Space>
                    <span className="agent-name">{agent.name}</span>
                    <Badge 
                      status={agent.isActive ? "success" : "default"} 
                      text={agent.isActive ? "Active" : "Inactive"} 
                    />
                  </Space>
                }
                description={agent.description}
              />
            </List.Item>
          )}
        />
      )}

      <style jsx global>{`
        .agents-container {
          padding: 0;
        }
        .agent-list-item {
          padding: 12px;
          border-radius: 6px;
          transition: all 0.3s;
          margin-bottom: 8px;
        }
        .agent-list-item:hover {
          background-color: #e6fffb;
        }
        .agent-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #e6fffb;
        }
        .agent-name {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default UserAgentsTab;
