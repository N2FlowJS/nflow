import React from 'react';
import { Typography, Space, Button } from 'antd';
import { TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title } = Typography;

interface TeamProfileHeaderProps {
  teamName: string;
}

const TeamProfileHeader: React.FC<TeamProfileHeaderProps> = ({
  teamName
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
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push('/team')}
        >
          Back to List
        </Button>
      </Space>
    </div>
  );
};

export default TeamProfileHeader;
