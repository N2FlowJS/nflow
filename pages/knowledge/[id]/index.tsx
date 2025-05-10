import {
  CalendarOutlined,
  FileOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Grid,
  List,
  message,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import FileConfigModal from '../../../components/knowledge/FileConfigModal';
import KnowledgeConfigForm from '../../../components/knowledge/KnowledgeConfigForm';
import KnowledgeDetailForm from '../../../components/knowledge/KnowledgeDetailForm';
import KnowledgeFileList from '../../../components/knowledge/KnowledgeFileList';
import KnowledgeModelForm from '../../../components/knowledge/KnowledgeModelForm';
import RetrievalTestingPanel from '../../../components/knowledge/RetrievalTestingPanel';
import MainLayout from '../../../components/layout/MainLayout';
import UploadFileModal from '../../../components/upload/UploadFileModal';
import { useAuth } from '../../../context/AuthContext';
import { useLocale } from '../../../locale/index';
import { updateFileConfig } from '../../../services/fileService';
import { fetchKnowledgeById, updateKnowledge } from '../../../services/knowledgeService';
import { IKnowledge } from '../../../models/IKnowledge';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function KnowledgeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [knowledge, setKnowledge] = useState<IKnowledge>();
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { isAuthenticated } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFileForConfig, setSelectedFileForConfig] = useState<any>();
  const [fileConfigModalVisible, setFileConfigModalVisible] = useState(false);
  const [savingFileConfig, setSavingFileConfig] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { messages } = useLocale();

  const fetchKnowledgeDetail = React.useCallback(async () => {
    if (!id || typeof id !== 'string') return;

    setLoading(true);
    try {
      const data = await fetchKnowledgeById(id);
      if (data) {
        setKnowledge(data);

        // Set form values including config
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          config: data.config || { tokenChunk: 128, chunkSeparator: ['\n', '\n'] },
          modelId: data.modelId,
        });
      } else {
        message.error(messages.knowledgeDetail.fetchKnowledgeFailed);
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, form, messages]);

  useEffect(() => {
    fetchKnowledgeDetail();
  }, [fetchKnowledgeDetail]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!id || typeof id !== 'string') return;

      const dataToSubmit = {
        name: values.name,
        modelId: values.modelId,
        description: values.description,
        updateKnowledge: values.updateKnowledge,
        config: values.config,
      };

      const updated = await updateKnowledge(id, dataToSubmit);
      if (updated) {
        message.success('Knowledge updated successfully');
        fetchKnowledgeDetail();
      } else {
        message.error('Failed to update knowledge');
      }
    } catch (error: unknown) {
      console.error('Form validation error:', error);
    }
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const openFileConfigModal = (file: any) => {
    setSelectedFileForConfig(file);
    setFileConfigModalVisible(true);
  };

  const handleSaveFileConfig = async (config: any) => {
    if (!selectedFileForConfig) return;

    setSavingFileConfig(true);
    try {
      await updateFileConfig(selectedFileForConfig.id, config);
      message.success(messages.knowledgeDetail.fileConfigUpdated);
      setFileConfigModalVisible(false);
      fetchKnowledgeDetail();
    } catch (error: unknown) {
      console.error('Error saving file config:', error);
      message.error(messages.knowledgeDetail.fileConfigUpdateFailed);
    } finally {
      setSavingFileConfig(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
  };

  // Create dashboard-style info content
  const renderInfoContent = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          {/* Creator Information Card */}
          <Card
            title={
              <Space>
                <UserOutlined />
                {messages.knowledgeDetail.creatorInformation}
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
            className="dashboard-card"
            style={{ height: '100%' }}>
            {knowledge?.createdBy ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  textAlign: isMobile ? 'center' : 'left',
                }}>
                <Avatar size={isMobile ? 48 : 64} icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
                <div
                  style={{
                    marginLeft: isMobile ? 0 : 16,
                    marginTop: isMobile ? 12 : 0,
                  }}>
                  <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
                    {knowledge.createdBy.name}
                  </Text>
                  <div>
                    <Text type="secondary" style={{ fontSize: isMobile ? 12 : 14 }}>
                      {knowledge.createdBy.email}
                    </Text>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Tag color="blue">{knowledge.createdBy.permission || 'User'}</Tag>
                  </div>
                </div>
              </div>
            ) : (
              <Text type="secondary">{messages.knowledgeDetail.creatorInfoNotAvailable}</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          {/* Dates Card */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                {messages.knowledgeDetail.dates}
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
            className="dashboard-card"
            style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">{messages.knowledgeDetail.created}:</Text>
                <div>
                  <CalendarOutlined /> {formatDate(knowledge?.createdAt)}
                </div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">{messages.knowledgeDetail.lastUpdated}:</Text>
                <div>
                  <CalendarOutlined /> {formatDate(knowledge?.updatedAt)}
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Associated Users Card */}
          <Card
            title={
              <Space>
                <UserOutlined />
                {messages.knowledgeDetail.associatedUsers}
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
            className="dashboard-card"
            style={{ height: '100%' }}>
            {knowledge?.users && knowledge.users.length > 0 ? (
              <List
                size="small"
                dataSource={knowledge.users}
                renderItem={(user) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} size={isMobile ? 'small' : 'default'} />}
                      title={user.name || 'Unknown User'}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={messages.knowledgeDetail.noUsersAssociated} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Associated Teams Card */}
          <Card
            title={
              <Space>
                <TeamOutlined />
                {messages.knowledgeDetail.associatedTeams}
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
            className="dashboard-card"
            style={{ height: '100%' }}>
            {knowledge?.teams && knowledge.teams.length > 0 ? (
              <List
                size="small"
                dataSource={knowledge.teams}
                renderItem={(team) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<TeamOutlined />}
                          style={{ backgroundColor: '#722ed1' }}
                          size={isMobile ? 'small' : 'default'}
                        />
                      }
                      title={team.name}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={messages.knowledgeDetail.noTeamsAssociated} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        <Col xs={24} md={8}>
          {/* Stats Card */}
          <Card
            title={
              <Space>
                <InfoCircleOutlined />
                {messages.knowledgeDetail.statistics}
              </Space>
            }
            size={isMobile ? 'small' : 'default'}
            className="dashboard-card"
            style={{ height: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title={messages.knowledgeDetail.files}
                  value={knowledge?.files?.length || 0}
                  prefix={<FileOutlined />}
                  valueStyle={{ fontSize: isMobile ? 20 : 24 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={messages.knowledgeDetail.users}
                  value={knowledge?.users?.length || 0}
                  prefix={<UserOutlined />}
                  valueStyle={{ fontSize: isMobile ? 20 : 24 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title={messages.knowledgeDetail.teams}
                  value={knowledge?.teams?.length || 0}
                  prefix={<TeamOutlined />}
                  valueStyle={{ fontSize: isMobile ? 20 : 24 }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <MainLayout title={messages.knowledgeDetail.loadingKnowledge}>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!knowledge && !loading) {
    return (
      <MainLayout title={messages.knowledgeDetail.knowledgeNotFound}>
        <div style={{ padding: '24px' }}>
          <Title level={4}>{messages.knowledgeDetail.knowledgeNotFound}</Title>
          <Button type="primary" onClick={() => router.push('/knowledge')}>
            {messages.knowledgeDetail.backToKnowledgeList}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={knowledge?.name || messages.knowledgeDetail.knowledgeDetail}>
      {/* Breadcrumb and Header */}
      <div className="dashboard-container" style={{ padding: isMobile ? '12px' : '24px' }}>
        <Row gutter={[16, 16]}>
          {/* Statistics Cards Row */}
          <Col xs={24} sm={8}>
            <Card className="statistic-card" bordered={false}>
              <Statistic
                title={
                  <>
                    <FileOutlined /> {messages.knowledgeDetail.files}
                  </>
                }
                value={knowledge?.files?.length || 0}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="statistic-card" bordered={false}>
              <Statistic
                title={
                  <>
                    <UserOutlined /> {messages.knowledgeDetail.users}
                  </>
                }
                value={knowledge?.users?.length || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="statistic-card" bordered={false}>
              <Statistic
                title={
                  <>
                    <SettingOutlined /> {messages.knowledgeDetail.config}
                  </>
                }
                value={knowledge?.files?.filter((f) => f.parsingStatus === 'completed').length || 0}
                suffix={`/ ${knowledge?.files?.length || 0}`}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>

          {/* Main Content Area */}
          {/* Left Column: Data Files */}
          <Col xs={24} lg={14}>
            <KnowledgeFileList
              knowledge={knowledge!}
              isAuthenticated={isAuthenticated}
              handleOpenUploadModal={handleOpenUploadModal}
              openFileConfigModal={openFileConfigModal}
            />
          </Col>

          {/* Right Column: Configuration and Testing */}
          <Col xs={24} lg={10}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              {/* Configuration Card */}
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    {messages.knowledgeDetail.description}
                  </Space>
                }
                className="dashboard-card">
                <Form form={form} layout="vertical">
                  <KnowledgeDetailForm form={form} />
                </Form>
              </Card>

              {/* Embedding Configuration */}
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    Embedding Configuration
                  </Space>
                }
                className="dashboard-card">
                <Form form={form} layout="vertical">
                  <KnowledgeModelForm />
                </Form>
              </Card>

              {/* Chunking Configuration */}
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    Chunking Configuration
                  </Space>
                }
                className="dashboard-card">
                <Form form={form} layout="vertical">
                  <KnowledgeConfigForm form={form} />
                </Form>
              </Card>

              {/* Save Button for Configuration */}
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                block
                size={isMobile ? 'middle' : 'large'}
                disabled={!isAuthenticated}>
                {messages.knowledgeDetail.saveChanges}
              </Button>
            </Space>
          </Col>

          {/* Retrieval Testing Panel (Full Width) */}
          <Col span={24}>{id && typeof id === 'string' && <RetrievalTestingPanel knowledgeId={id} />}</Col>

          {/* Knowledge Info Section (Full Width) */}
          <Col span={24}>
            <Card
              title={
                <Space>
                  <InfoCircleOutlined />
                  {messages.knowledgeDetail.info}
                </Space>
              }
              className="dashboard-card">
              {renderInfoContent()}
            </Card>
          </Col>
        </Row>

        {id && typeof id === 'string' && (
          <UploadFileModal
            knowledgeId={id}
            isOpen={isUploadModalOpen}
            onClose={handleCloseUploadModal}
            onUploadComplete={fetchKnowledgeDetail}
            isAuthenticated={isAuthenticated}
          />
        )}

        {selectedFileForConfig && (
          <FileConfigModal
            visible={fileConfigModalVisible}
            onClose={() => setFileConfigModalVisible(false)}
            onSave={handleSaveFileConfig}
            fileId={selectedFileForConfig.id}
            fileName={selectedFileForConfig.originalName}
            fileConfig={selectedFileForConfig.config ? JSON.parse(selectedFileForConfig.config) : null}
            loading={savingFileConfig}
          />
        )}
      </div>
    </MainLayout>
  );
}
