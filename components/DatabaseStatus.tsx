import { useEffect, useState } from "react";
import { Badge, Button, Popover, Space, Typography, Tooltip } from "antd";
import {
  SyncOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DatabaseFilled,
} from "@ant-design/icons";
import { useRouter } from "next/router";

const { Text } = Typography;

type StatusResponse = {
  status: "connected" | "error" | "pending";
  error: string | null;
  lastChecked: number;
  setupAttempted: boolean;
};

type WorkerStatus = {
  enabled: boolean;
  status: "running" | "stopped" | "error";
  pendingTasks: number;
  activeTasks: number;
  maxWorkers: number;
};

// This component only runs on client-side
export default function DatabaseStatus() {
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "pending">(
    "pending"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupAttempted, setSetupAttempted] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>({
    enabled: false,
    status: "stopped",
    pendingTasks: 0,
    activeTasks: 0,
    maxWorkers: 0,
  });
  const [nbaseStatus, setNbaseStatus] = useState<
    "disabled" | "checking" | "running" | "error"
  >("checking");
  const [nbaseTooltip, setNbaseTooltip] = useState("Checking Nbase status...");
  const router = useRouter();

  useEffect(() => {
    // Function to fetch the database status
    async function checkStatus() {
      try {
        const res = await fetch("/api/db-status");
        if (!res.ok) {
          setDbStatus("error");
          setErrorMsg("Failed to fetch database status");
          return;
        }

        const data: StatusResponse = await res.json();
        setDbStatus(data.status);
        setErrorMsg(data.error);
        setSetupAttempted(data.setupAttempted);
      } catch (error) {
        console.error("Error fetching DB status:", error);
        setDbStatus("error");
        setErrorMsg("Network error checking database status");
      }
    }

    // Check worker status
    async function checkWorkerStatus() {
      try {
        const res = await fetch("/api/admin/workers");
        if (!res.ok) {
          setWorkerStatus((prev) => ({ ...prev, status: "error" }));
          return;
        }

        const data = await res.json();
        setWorkerStatus({
          enabled: data.workerConfig.enabled,
          status: data.taskStats.processing > 0 ? "running" : "stopped",
          pendingTasks: data.taskStats.pending,
          activeTasks: data.taskStats.processing,
          maxWorkers: data.workerConfig.maxWorkers,
        });
      } catch (error) {
        console.error("Error fetching worker status:", error);
        setWorkerStatus((prev) => ({ ...prev, status: "error" }));
      }
    }

    // Check Nbase status if enabled
    async function checkNbaseStatus() {
      if (process.env.NBASE_ENABLED === "true") {
        try {
          const res = await fetch("/api/nbase-status");
          if (!res.ok) {
            setNbaseStatus("error");
            setNbaseTooltip("Failed to fetch Nbase status");
            return;
          }

          const data = await res.json();
          setNbaseStatus(data.status === "running" ? "running" : "error");
          setNbaseTooltip(data.message || "Nbase status unknown");
        } catch (error: any) {
          console.error("Error fetching Nbase status:", error);
          setNbaseStatus("error");
          setNbaseTooltip(`Error checking Nbase: ${error.message}`);
        }
      } else {
        setNbaseStatus("disabled");
        setNbaseTooltip("Nbase is not enabled");
      }
    }

    // Check immediately
    checkStatus();
    checkWorkerStatus();
    checkNbaseStatus();

    // Then poll every 5 seconds
    const dbInterval = setInterval(checkStatus, 5000);
    const workerInterval = setInterval(checkWorkerStatus, 5000);
    const nbaseInterval = setInterval(checkNbaseStatus, 5000);

    return () => {
      clearInterval(dbInterval);
      clearInterval(workerInterval);
      clearInterval(nbaseInterval);
    };
  }, []);

  // Generate detailed status content for popover
  const statusContent = (
    <div style={{ maxWidth: "300px" }}>
      <div>
        <Text strong>Database: </Text>
        <Badge
          status={
            dbStatus === "connected"
              ? "success"
              : dbStatus === "pending"
              ? "processing"
              : "error"
          }
          text={
            dbStatus === "connected"
              ? "Connected"
              : dbStatus === "pending"
              ? "Connecting..."
              : "Error"
          }
        />
        {errorMsg && (
          <div>
            <Text type="danger">{errorMsg}</Text>
          </div>
        )}
      </div>

      <div style={{ marginTop: "8px" }}>
        <Text strong>File Workers: </Text>
        <Badge
          status={
            !workerStatus.enabled
              ? "default"
              : workerStatus.status === "running"
              ? "success"
              : workerStatus.status === "stopped"
              ? "warning"
              : "error"
          }
          text={
            !workerStatus.enabled
              ? "Disabled"
              : workerStatus.status === "running"
              ? "Active"
              : workerStatus.status === "stopped"
              ? "Idle"
              : "Error"
          }
        />
        {workerStatus.enabled && (
          <div>
            <Text>
              Workers: {workerStatus.activeTasks}/{workerStatus.maxWorkers}
            </Text>
            <div>
              <Text>Pending tasks: {workerStatus.pendingTasks}</Text>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "8px" }}>
        <Text strong>Nbase: </Text>
        <Tooltip title={nbaseTooltip}>
          <Badge
            status={
              nbaseStatus === "running"
                ? "success"
                : nbaseStatus === "checking"
                ? "processing"
                : "error"
            }
            text={<DatabaseFilled />}
          />
        </Tooltip>
      </div>

      <div style={{ marginTop: "12px" }}>
        <Button
          type="primary"
          size="small"
          onClick={() => router.push("/admin/tasks")}
        >
          View Task Monitor
        </Button>
      </div>
    </div>
  );

  // If everything is connected, show only an indicator in the corner
  if (
    dbStatus === "connected" &&
    workerStatus.status !== "error" &&
    nbaseStatus !== "error"
  ) {
    return (
      <Popover
        content={statusContent}
        title="System Status"
        trigger="click"
        placement="bottomRight"
      >
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          {workerStatus.status === "running" ? (
            <Badge count={workerStatus.activeTasks} overflowCount={99}>
              <SyncOutlined
                spin
                style={{ fontSize: "24px", color: "#1890ff" }}
              />
            </Badge>
          ) : (
            <CheckCircleOutlined
              style={{ fontSize: "24px", color: "#52c41a" }}
            />
          )}
        </div>
      </Popover>
    );
  }

  // For errors or pending status, show a banner
  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          padding: "10px",
          backgroundColor:
            dbStatus === "error" || nbaseStatus === "error"
              ? "#f44336"
              : "#ff9800",
          color: "white",
          textAlign: "center",
          zIndex: 9999,
        }}
      >
        <Space>
          {dbStatus === "error" || nbaseStatus === "error" ? (
            <>
              <CloseCircleOutlined />
              <span>System error detected!</span>
            </>
          ) : dbStatus === "pending" || nbaseStatus === "checking" ? (
            <>
              <SyncOutlined spin />
              <span>Checking system status...</span>
            </>
          ) : (
            <>
              <WarningOutlined />
              <span>Worker system error!</span>
            </>
          )}
          <Button
            type="primary"
            size="small"
            ghost
            onClick={() => router.push("/admin/tasks")}
          >
            View Details
          </Button>
        </Space>
      </div>

      {/* Add padding to prevent content from being hidden under the banner */}
      <div style={{ height: "50px" }} />
    </div>
  );
}
