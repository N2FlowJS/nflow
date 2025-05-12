import { Empty, Spin, Typography } from 'antd';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import ChatInterface from '../../../components/chat/ChatInterface';
import MainLayout from '../../../components/layout/MainLayout';
import { useAuth } from '../../../context/AuthContext';
import { useLocale } from '../../../locale/index';
import { IAgent } from '../../../models/IAgent';
import { fetchAgent } from '../../../services/agentService';

const { Text } = Typography;

export default function ChatPage() {
  const router = useRouter();
  const { id: queryAgentId } = router.query;
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null);
  const [flowConfig, setFlowConfig] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [flowLoading, setFlowLoading] = useState(false);
  const { t } = useLocale('chat');
  const { user } = useAuth();

  // Streaming and conversation state
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  // Load agent and its flow config
  const loadAgentAndConfig = useCallback(async (agentId: string) => {
    if (!agentId) return;

    setLoading(true);
    setFlowLoading(true);

    try {
      // Load agent details
      const agentData = await fetchAgent(agentId);
      setSelectedAgent(agentData);

      setFlowConfig(agentData.flowConfig);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
      setFlowLoading(false);
    }
  }, []);

  // Handle agent ID from query params
  useEffect(() => {
    if (queryAgentId && typeof queryAgentId === 'string') {
      loadAgentAndConfig(queryAgentId);
    } else {
      setLoading(false);
    }
  }, [queryAgentId, loadAgentAndConfig]);

  // Handle conversation events
  const handleConversationCreated = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  const handleNewChatStarted = useCallback(() => {
    setCurrentConversationId(undefined);
  }, []);

  return (
    <MainLayout title={t('chatWithAgent')}>
      <div className="chat-page-container" style={{ padding: '24px' }}>
        {!selectedAgent ? (
          <Empty
            style={{ margin: '100px auto' }}
            description={t('noAgentSelected')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : loading || flowLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <Spin size="large" />
            <Text style={{ marginTop: 16 }}>{t('loadingAgent')}</Text>
          </div>
        ) : !flowConfig ? (
          <Empty
            style={{ margin: '100px auto' }}
            description={t('noFlowConfigFound')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <ChatInterface
              agentId={selectedAgent.id}
              flowConfig={flowConfig}
              id={currentConversationId}
              onConversationCreated={handleConversationCreated}
              onNewChatStarted={handleNewChatStarted}
              variables={{
                agentName: selectedAgent.name,
                userDisplayName: user?.name || 'User',
              }}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
