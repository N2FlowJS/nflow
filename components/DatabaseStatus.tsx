import { useRouter } from "next/router";
import { Badge, Button, Popover, Space, Typography, Tooltip } from "antd";
import {
  SyncOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  DatabaseFilled,
  DatabaseOutlined,
  RobotOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useSystemStatus } from "../hooks/useSystemStatus";

const { Text } = Typography;

export default function DatabaseStatus() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    dbStatus,
    errorMsg,
    setupAttempted,
    workerStatus,
    nbaseStatus,
    nbaseTooltip,
    cleanupWorkerStatus
  } = useSystemStatus(user);

  if (!user) return null;

  // Generate detailed status content for popover
  const statusContent = (
    <div style={{ maxWidth: "300px" }}>
      <div>
        <Text strong><DatabaseOutlined style={{ marginRight: 8 }} />Database: </Text>
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
        {setupAttempted && <div>
          <Text type="secondary">
            <SyncOutlined style={{ marginRight: 4 }} />
            Setup {setupAttempted ? "has been" : "has not been"} attempted
          </Text>
        </div>}

      </div>

      <div style={{ marginTop: "8px" }}>
        <Text strong><DatabaseFilled style={{ marginRight: 8 }} />Nbase: </Text>
        <Tooltip title={nbaseTooltip}>
          <Badge
            status={
              nbaseStatus === "running"
                ? "success"
                : nbaseStatus === "checking"
                  ? "processing"
                  : "error"
            }
            text={
              nbaseStatus === "running"
                ? "Connected"
                : nbaseStatus === "checking"
                  ? "Connecting..."
                  : "Error"
            }
          />
        </Tooltip>
      </div>

      <div style={{ marginTop: "8px" }}>
        <Text strong><RobotOutlined style={{ marginRight: 8 }} />File Workers: </Text>
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
        <Typography.Text strong><DeleteOutlined style={{ marginRight: 8 }} />Cleanup Worker: </Typography.Text>
        <Badge
          status={
            !cleanupWorkerStatus.enabled
              ? "default"
              : cleanupWorkerStatus.status === "running"
                ? "success"
                : cleanupWorkerStatus.status === "stopped"
                  ? "warning"
                  : "error"
          }
          text={
            !cleanupWorkerStatus.enabled
              ? "Disabled"
              : cleanupWorkerStatus.status === "running"
                ? "Active"
                : cleanupWorkerStatus.status === "stopped"
                  ? "Idle"
                  : "Error"
          }
        />
        {cleanupWorkerStatus.enabled && (
          <div>
            {cleanupWorkerStatus.lastRun && (
              <div>
                <Typography.Text type="secondary">
                  Last run: {cleanupWorkerStatus.lastRun}
                </Typography.Text>
              </div>
            )}
            {typeof cleanupWorkerStatus.lastDeleted === "number" && (
              <div>
                <Typography.Text>
                  Last deleted: {cleanupWorkerStatus.lastDeleted} conversations
                </Typography.Text>
              </div>
            )}
          </div>
        )}
      </div>

      {["admin", "owner"].includes(user?.permission || "") && <div style={{ marginTop: "12px" }}>
        <Button
          type="primary"
          size="small"
          onClick={() => router.push("/admin/tasks")}
        >
          View Task Monitor
        </Button>
      </div>}


    </div>
  );

  // If everything is connected, show only an indicator in the corner
  if (
    user &&
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
