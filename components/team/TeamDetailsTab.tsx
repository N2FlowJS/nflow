import { CalendarOutlined, EditOutlined, InfoCircleOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Form, Input, Row, Space, Statistic, Tag, Typography } from 'antd';
import { format } from 'date-fns';
import React from 'react';

const { Title } = Typography;

interface TeamDetailsTabProps {
  team: any;
  form: any;
  onSubmit: () => void;
}

const TeamDetailsTab: React.FC<TeamDetailsTabProps> = ({ team, form, onSubmit }) => {
  const formatDate = (dateString: string) => {
    return dateString ? format(new Date(dateString), 'PPpp') : 'N/A';
  };

  return (
    <>
      <Card className="dashboard-card" style={{ marginBottom: '12px' }}>
        <Title level={4}>
          <Space>
            <EditOutlined />
            Team Details
          </Space>
        </Title>

        <Form form={form} layout="vertical" initialValues={team}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Status">
                <Tag color="green">Active</Tag>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter a description' }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={onSubmit}
              >
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card className="dashboard-card" style={{ marginBottom: '12px' }}>
        <Title level={4}>
          <Space>
            <InfoCircleOutlined />
            Team Information
          </Space>
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8}>
            <Statistic title="Created By" value={team?.createdBy?.name || 'Unknown'} prefix={<UserOutlined />} />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Created At"
              value={formatDate(team?.createdAt).split(',')[0]}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Last Updated"
              value={formatDate(team?.updatedAt).split(',')[0]}
              prefix={<CalendarOutlined />}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default TeamDetailsTab;
