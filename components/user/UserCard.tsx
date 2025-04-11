import React from 'react';
import { Card, Avatar, Typography, Divider, Space, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { User } from '../../types/auth';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

interface UserCardProps {
  user: User;
  showActions?: boolean;
}

export default function UserCard({ user, showActions = true }: UserCardProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const isSelf = true; // This would be determined by comparing with current user

  return (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Avatar
          size={64}
          icon={<UserOutlined />}
          style={{ backgroundColor: "#1677ff" }}
        />
        <div style={{ marginLeft: 16 }}>
          <Title level={3}>{user.name}</Title>
          <Text>{user.email}</Text>
          <Paragraph>
            <Text strong>User Code:</Text> {user.code}
          </Paragraph>
          {user.description && (
            <Paragraph>
              <Text strong>Description:</Text> {user.description}
            </Paragraph>
          )}
        </div>
      </div>

      {showActions && (
        <>
          <Divider />
          <Space>
            <Button
              type="primary"
              onClick={() => router.push(`/user/${user.id}`)}
            >
              View Profile
            </Button>
            {isSelf && (
              <Button danger onClick={logout}>
                Logout
              </Button>
            )}
          </Space>
        </>
      )}
    </Card>
  );
}
