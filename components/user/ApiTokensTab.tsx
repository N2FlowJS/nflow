import { DeleteOutlined, ExclamationCircleOutlined, KeyOutlined, PlusOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Empty,
    List,
    Modal,
    Popconfirm,
    Row,
    Space,
    Tag,
    Typography,
    message
} from 'antd';
import React, { useEffect, useState } from 'react';
import { createApiToken, fetchUserApiTokens, revokeApiToken } from '../../services/authUtils';
import ApiTokenForm from './ApiTokenForm';

const { Text, Paragraph, Title } = Typography;
const { confirm } = Modal;

interface ApiToken {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  status: string;
}

interface ApiTokensTabProps {
  userId: string;
  isCurrentUser: boolean;
}

const ApiTokensTab: React.FC<ApiTokensTabProps> = ({ userId, isCurrentUser }) => {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingToken, setCreatingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const loadTokens = React.useCallback(async () => {
    setLoading(true);
    try {
      const fetchedTokens = await fetchUserApiTokens(userId);
      setTokens(fetchedTokens);
    } catch (error) {
      console.error('Failed to load API tokens:', error);
      message.error('Failed to load API tokens');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadTokens();
    }
  }, [loadTokens, userId]);

  const handleCreateToken = async (values: any) => {
    setCreatingToken(true);
    try {
      const token = await createApiToken(userId, values);
      if (token) {
        message.success('API token created successfully');
        setNewToken(token.token);
        await loadTokens();
        setShowCreateForm(false);
      } else {
        message.error('Failed to create token');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      message.error('Failed to create token');
    } finally {
      setCreatingToken(false);
    }
  };

  const handleRevokeToken = async (tokenId: string) => {
    try {
      const success = await revokeApiToken(tokenId);
      if (success) {
        message.success('Token revoked successfully');
        loadTokens();
      } else {
        message.error('Failed to revoke token');
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      message.error('Failed to revoke token');
    }
  };

  const confirmRevoke = (tokenId: string, tokenName: string) => {
    confirm({
      title: 'Are you sure you want to revoke this token?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            You are about to revoke the token <strong>{tokenName}</strong>.
          </p>
          <p>This action cannot be undone and any applications using this token will lose access.</p>
        </div>
      ),
      onOk() {
        return handleRevokeToken(tokenId);
      },
    });
  };

  const copyToken = (token: string) => {
    navigator.clipboard
      .writeText(token)
      .then(() => message.success('Token copied to clipboard'))
      .catch(() => message.error('Failed to copy token'));
  };

  if (!isCurrentUser) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="You don't have permission to view API tokens for this user"
      />
    );
  }

  return (
    <div className="api-tokens-container">
      {newToken && (
        <Alert
          message="New API Token Created"
          description={
            <div>
              <p>
                <strong>Make sure to copy your new API token now. You won&apos;t be able to see it again!</strong>
              </p>
              <div className="token-display">
                <Text code copyable style={{ wordBreak: 'break-all' }}>
                  {newToken}
                </Text>
              </div>
              <Button type="primary" size="small" onClick={() => copyToken(newToken)} style={{ marginTop: 8 }}>
                Copy to Clipboard
              </Button>
            </div>
          }
          type="success"
          showIcon
          closable
          onClose={() => setNewToken(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="api-tokens-header" style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={5}>Personal API Tokens</Title>
            <Paragraph type="secondary">
              Tokens give applications access to the API with your permissions. Keep them secure!
            </Paragraph>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateForm(true)}
              disabled={showCreateForm}>
              Create Token
            </Button>
          </Col>
        </Row>
      </div>

      {showCreateForm && (
        <Card
          title="Create New API Token"
          style={{ marginBottom: 16 }}
          extra={
            <Button size="small" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
          }>
          <ApiTokenForm onSubmit={handleCreateToken} loading={creatingToken} />
        </Card>
      )}

      <List
        loading={loading}
        dataSource={tokens}
        locale={{ emptyText: 'No API tokens found' }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Popconfirm
                key="revoke"
                title="Are you sure you want to revoke this token?"
                onConfirm={() => confirmRevoke(item.id, item.name)}
                okText="Yes"
                cancelText="No">
                <Button danger icon={<DeleteOutlined />} disabled={item.status !== 'active'}>
                  Revoke
                </Button>
              </Popconfirm>,
            ]}>
            <List.Item.Meta
              avatar={<KeyOutlined style={{ fontSize: 24 }} />}
              title={
                <Space>
                  {item.name}
                  {item.status === 'active' ? <Tag color="green">Active</Tag> : <Tag color="red">Revoked</Tag>}
                  {item.expiresAt && new Date(item.expiresAt) < new Date() && <Tag color="orange">Expired</Tag>}
                </Space>
              }
              description={
                <div>
                  {item.description && <div>{item.description}</div>}
                  <div>
                    <Text type="secondary">Created: {new Date(item.createdAt).toLocaleString()}</Text>
                  </div>
                  {item.expiresAt && (
                    <div>
                      <Text type="secondary">Expires: {new Date(item.expiresAt).toLocaleString()}</Text>
                    </div>
                  )}
                  {item.lastUsedAt && (
                    <div>
                      <Text type="secondary">Last used: {new Date(item.lastUsedAt).toLocaleString()}</Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ApiTokensTab;
