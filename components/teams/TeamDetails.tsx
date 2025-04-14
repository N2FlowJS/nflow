import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Button, 
  Space,
  Spin,
  Modal,
  Form,
  Input,
  message
} from 'antd';
import { 
  EditOutlined, 
  TeamOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { format } from 'date-fns';
import { updateTeam } from '../../services/teamService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface TeamDetailsProps {
  team: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
      id: string;
      name: string;
    };
  };
}

export default function TeamDetails({ team }: TeamDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'PPpp') : 'N/A';
  };

  const handleEdit = () => {
    form.setFieldsValue({
      name: team.name,
      description: team.description,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await updateTeam(team.id, values);
      
      message.success('Team details updated successfully');
      setIsEditing(false);
      
      // Refresh page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating team:', error);
      message.error('Failed to update team details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>
          <Space>
            <TeamOutlined />
            Team Details
          </Space>
        </Title>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={handleEdit}
        >
          Edit Details
        </Button>
      </div>

      <Descriptions column={{ xs: 1, sm: 2 }} bordered>
        <Descriptions.Item label="Team Name">
          {team.name}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          <Space>
            <CalendarOutlined />
            {formatDate(team.createdAt)}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={2}>
          <Text>{team.description || 'No description provided'}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Modal
        title="Edit Team Details"
        open={isEditing}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            Save Changes
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: team.name,
            description: team.description,
          }}
        >
          <Form.Item
            name="name"
            label="Team Name"
            rules={[
              { required: true, message: 'Please enter team name' },
              { max: 50, message: 'Name cannot be longer than 50 characters' }
            ]}
          >
            <Input placeholder="Enter team name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'Description cannot be longer than 500 characters' }
            ]}
          >
            <TextArea 
              placeholder="Enter team description" 
              rows={4} 
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
