import { Button, Spin, message } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useAuth } from "../../../context/AuthContext";
import FlowEditorHeader from "./header";
import { fetchAgent, fetchUserAgents } from "../../../services/agentService"; // Use services
import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from "../../../components/agent/flow-editor";

export default function FlowEditorPage() {
  const router = useRouter();
  const { agentId } = router.query;
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [agent, setAgent] = useState<any | null>(null);

  useEffect(() => {
    const loadAgentData = async () => {
      setLoading(true);
      try {
        if (agentId && typeof agentId === "string") {
          const agentData = await fetchAgent(agentId);
          setAgent(agentData);
        } else if (user) {
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

  const handleAgentChange = (id: string) => {
    router.push(`/agent/flow-editor?agentId=${id}`);
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
              />
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
