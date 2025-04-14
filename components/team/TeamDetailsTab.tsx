import React from 'react';
import { Card, Form, Input, Typography, Space, Descriptions, Divider, Tag } from 'antd';
import { TeamOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Title, Text } = Typography;

interface TeamDetailsTabProps {
  team: any;
  isEditing: boolean;
  form: any;
}

const TeamDetailsTab: React.FC<TeamDetailsTabProps> = ({
  team,
  isEditing,
  form
}) => {
  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'PPpp') : 'N/A';
  };

  return (
    <Card>
      <Title level={4}>
        <Space>
          <TeamOutlined />
          Team Details
        </Space>
      </Title>
      
      {isEditing ? (
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          {team?.createdBy && (
            <Form.Item label="Created by">
              <Input 
                disabled
                value={team.createdBy.name}
                prefix={<UserOutlined />}
              />
            </Form.Item>
          )}
        </Form>
      ) : (
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Team Name" span={2}>
            <Text strong>{team?.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            <Space>
              <CalendarOutlined />
              {formatDate(team?.createdAt)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            <Space>
              <CalendarOutlined />
              {formatDate(team?.updatedAt)}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            <Space>
              <UserOutlined />
              {team?.createdBy?.name || 'Unknown'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="green">Active</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            <Text>{team?.description || 'No description provided'}</Text>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Card>
  );
};

export default TeamDetailsTab;
