import React from 'react';
import { Typography, Space, Button } from 'antd';
import { TeamOutlined, ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title } = Typography;

interface TeamProfileHeaderProps {
  teamName: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: () => void;
  canEdit: boolean;
}

const TeamProfileHeader: React.FC<TeamProfileHeaderProps> = ({
  teamName,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
  canEdit
}) => {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Title level={2}>
        <Space>
          <TeamOutlined />
          {teamName}
        </Space>
      </Title>
      <Space>
        {isEditing ? (
          <>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={onSubmit}
            >
              Save
            </Button>
          </>
        ) : (
          <>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push('/team')}
            >
              Back to List
            </Button>
            {canEdit && (
              <Button 
                type="primary" 
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
          </>
        )}
      </Space>
    </div>
  );
};

export default TeamProfileHeader;
