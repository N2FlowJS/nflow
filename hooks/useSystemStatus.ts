import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiUtils";

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

type CleanupWorkerStatus = {
  enabled: boolean;
  status: "running" | "stopped" | "error";
  lastRun?: string;
  lastDeleted?: number;
};

export function useSystemStatus(user: any) {
  const [dbStatus, setDbStatus] = useState<"connected" | "error" | "pending">("pending");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupAttempted, setSetupAttempted] = useState(false);
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>({
    enabled: false,
    status: "stopped",
    pendingTasks: 0,
    activeTasks: 0,
    maxWorkers: 0,
  });
  const [nbaseStatus, setNbaseStatus] = useState<"disabled" | "checking" | "running" | "error">("checking");
  const [nbaseTooltip, setNbaseTooltip] = useState("Checking Nbase status...");
  const [cleanupWorkerStatus, setCleanupWorkerStatus] = useState<CleanupWorkerStatus>({
    enabled: false,
    status: "stopped",
    lastRun: undefined,
    lastDeleted: undefined,
  });

  useEffect(() => {
    async function checkStatus() {
      try {
        const data = await apiRequest<StatusResponse>("/api/db-status", { method: 'get' });
        if (!data) {
          setDbStatus("error");
          setErrorMsg("Failed to fetch database status");
          return;
        }
        setDbStatus(data.status);
        setErrorMsg(data.error);
        setSetupAttempted(data.setupAttempted);
      } catch (error) {
        console.error("Error fetching DB status:", error);
        setDbStatus("error");
        setErrorMsg("Network error checking database status");
      }
    }

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
          setNbaseStatus("error");
          setNbaseTooltip(`Error checking Nbase: ${error.message}`);
        }
      } else {
        setNbaseStatus("disabled");
        setNbaseTooltip("Nbase is not enabled");
      }
    }

    async function checkCleanupWorkerStatus() {
      try {
        const data = await apiRequest<any>("/api/admin/cleanup-worker", { method: 'GET' });
        if (!data) {
          setCleanupWorkerStatus((prev) => ({ ...prev, status: "error" }));
          return;
        }
        setCleanupWorkerStatus({
          enabled: data.enabled,
          status: data.status,
          lastRun: data.lastRun,
          lastDeleted: data.lastDeleted,
        });
      } catch {
        setCleanupWorkerStatus((prev) => ({ ...prev, status: "error" }));
      }
    }

    let intervals: NodeJS.Timeout[] = [];
    
    if (user) {
      // Initial checks
      checkStatus();
      checkWorkerStatus();
      checkNbaseStatus();
      checkCleanupWorkerStatus();

      // Set up intervals
      intervals = [
        setInterval(checkStatus, 5000),
        setInterval(checkWorkerStatus, 5000),
        setInterval(checkNbaseStatus, 5000),
        setInterval(checkCleanupWorkerStatus, 5000)
      ];
    }

    return () => intervals.forEach(clearInterval);
  }, [user]);

  return {
    dbStatus,
    errorMsg,
    setupAttempted,
    workerStatus,
    nbaseStatus,
    nbaseTooltip,
    cleanupWorkerStatus
  };
}
