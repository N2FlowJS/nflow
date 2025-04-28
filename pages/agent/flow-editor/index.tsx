import { Spin, message, Button, Drawer } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import FlowEditorHeader from "./header";
import { fetchAgent } from "@/services/agentService";
import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "@/components/agent/flow-editor";
import ChatInterface from "@/components/chat/ChatInterface";

export default function FlowEditorPage() {
  const router = useRouter();
  const { agentId } = router.query;
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [agent, setAgent] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadAgentData = async () => {
      setLoading(true);
      try {
        if (agentId && typeof agentId === "string") {
          const agentData = await fetchAgent(agentId);
          setAgent(agentData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadAgentData();
  }, [agentId, user]);

  // Chat handlers
  const handleConversationCreated = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleConversationUpdated = (conversationId: string) => {
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

  return (
    <MainLayout title="Flow Editor">
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <FlowEditorHeader agent={agent} />
        <div style={{ flex: 1, position: "relative" }}>
          {agent ? (
            <ReactFlowProvider>
              <FlowEditor
                flowConfig={agent.flowConfig || "{}"}
                agentId={agent.id}
                onStartConversation={() => setIsChatOpen(true)}
              />
           
              <Drawer
                title="Test Chat"
                placement="right"
                width={450}
                open={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                styles={{
                  body: {
                    padding: 0,
                    height: 'calc(100% - 55px)',
                    overflow: 'hidden',
                  },
                }}
              >
                <ChatInterface
                  agentId={agent.id}
                  flowConfig={agent.flowConfig || "{}"}
                  enableStreaming={true}
                  id={currentConversationId}
                  onConversationCreated={handleConversationCreated}
                  onConversationUpdated={handleConversationUpdated}
                  onNewChatStarted={handleNewChatStarted}
                  variables={{
                    agentName: agent.name,
                    userDisplayName: user?.name || 'User',
                  }}
                />
              </Drawer>
            </ReactFlowProvider>
          ) : (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <p>No agent selected. Please select an agent to edit its flow.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
