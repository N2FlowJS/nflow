import { ReactFlowProvider } from "@xyflow/react";
import { Drawer, Skeleton, Spin, message } from "antd";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import FlowEditor from "../../../components/agent/canvas/canvas";
import ChatInterface from "../../../components/chat/ChatInterface";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../context/AuthContext";
import { useMobile } from "../../../hooks/useMobile";
import { fetchAgent } from "../../../services/agentService";

export default function FlowEditorPage() {
  const router = useRouter();
  const { agentId } = router.query as {
    agentId: string
  };
  const { user } = useAuth();
  const { isMobile } = useMobile()
  const [loading, setLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  const loadAgentData = React.useCallback(async () => {
    if (!agentId) return
    setLoading(true);
    try {
      const agentData = await fetchAgent(agentId);
      console.log(agentData, 'agentData');

      if (agentData) setAgent(agentData);

    } catch (error: unknown) {
      console.error("Error loading data:", error);
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [agentId]);



  useEffect(() => {

    loadAgentData();
  }, [loadAgentData]);

  // Chat handlers
  const handleConversationCreated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleConversationUpdated = (conversationId: string) => {
    setCurrentConversationId(conversationId);

    // Optional: Handle conversation updates
  };

  const handleNewChatStarted = () => {
    setCurrentConversationId(undefined);
  };

  if (loading) {
    return (
      <MainLayout title="Loading Flow Editor">
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }
  if (!agent?.id) {
    return <Skeleton />
  }

  return (
    <MainLayout title="Flow Editor">
      <ReactFlowProvider>
        <FlowEditor
          flowConfig={agent?.flowConfig}
          agentId={agent?.id}
          onStartConversation={() => setIsChatOpen(true)}
          activeConversationId={isChatOpen ? undefined: currentConversationId}
        />
      </ReactFlowProvider>
      <Drawer
        title="Test Chat"
        placement="right"
        width={isMobile ? '45%' : "80%"}
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}

      >
        <ChatInterface
          agentId={agent?.id}
          flowConfig={agent?.flowConfig}
          enableStreaming={true}
          id={currentConversationId}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={handleConversationUpdated}
          onNewChatStarted={handleNewChatStarted}
          variables={{
            agentName: agent?.name,
            userDisplayName: user?.name || 'User',
          }}
        />
      </Drawer>
    </MainLayout>
  );
}
