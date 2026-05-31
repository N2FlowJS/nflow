import { useState, useCallback, useRef, useEffect } from 'react';
import { Node, Edge } from '@xyflow/react';
import type { 
  RuntimeStatus, 
  PlaygroundMessage, 
  LogEntry, 
  PlaygroundWorkerOutput,
  FlowExecutionState
} from '../../types/editor';
import { 
  FlowValidationIssue, 
  ValidationLocale,
  validateFlowGraph
} from "../../../back-end/flow-validation";

export const INITIAL_PLAYGROUND_MESSAGES: PlaygroundMessage[] = [
  {
    role: "assistant",
    text: "Protocol initialized. Ready to test the workflow. How can I assist?",
  },
];

interface UseFlowExecutionOptions {
  getNodes: () => Node[];
  getEdges: () => Edge[];
  getGlobalVariables: () => any[];
  getFlowId: () => string | null;
  runtimeStatus: RuntimeStatus;
  setRuntimeStatus: (status: RuntimeStatus) => void;
  setNodes: (updater: (nds: Node[]) => Node[]) => void;
  setIsPlaygroundOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveDockTab: (tab: any) => void;
  setIsLogsOpenExclusive: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFlowExecution = ({
  getNodes,
  getEdges,
  getGlobalVariables,
  getFlowId,
  runtimeStatus,
  setRuntimeStatus,
  setNodes,
  setIsPlaygroundOpen,
  setActiveDockTab,
  setIsLogsOpenExclusive,
}: UseFlowExecutionOptions): FlowExecutionState => {
  const [playgroundMessages, setPlaygroundMessages] = useState<PlaygroundMessage[]>(INITIAL_PLAYGROUND_MESSAGES);
  const messagesRef = useRef(playgroundMessages);
  useEffect(() => {
    messagesRef.current = playgroundMessages;
  }, [playgroundMessages]);
  const [isPlaygroundTyping, setIsPlaygroundTyping] = useState(false);
  const [playgroundError, setPlaygroundError] = useState<string | null>(null);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [flowIssues, setFlowIssues] = useState<FlowValidationIssue[]>([]);
  const [validationLocale, setValidationLocale] = useState<string>(
    () => typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en"
  );

  const executionAbortRef = useRef<AbortController | null>(null);
  const isSilentExecutionRunningRef = useRef(false);

  const appendAssistantOutput = useCallback((output: PlaygroundWorkerOutput) => {
    const text = typeof output === 'string' ? output : output.text || '';
    if (!text) return;
    
    setPlaygroundMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'assistant') {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
      }
      return [...prev, { role: 'assistant', text }];
    });
  }, []);

  const onValidateFlow = useCallback((openDock: boolean = true) => {
    const errors = validateFlowGraph(getNodes(), getEdges());
    setFlowIssues(errors);
    
    if (errors.length > 0) {
      if (openDock) {
        setActiveDockTab("validation");
      }
    } else {
      setPlaygroundError(null);
    }
    return errors.length === 0;
  }, [getNodes, getEdges, setActiveDockTab]);

  const executeFlow = useCallback(
    async (
      inputMessage?: string,
      isSilent: boolean = false,
      options?: { showLogs?: boolean },
    ) => {
      if (isSilent && isSilentExecutionRunningRef.current) return null;

      const runtimeBaseUrl = (import.meta as any).env?.VITE_RUNTIME_URL || "http://localhost:8787";

      if (!isSilent) {
        executionAbortRef.current?.abort();
      }

      const controller = new AbortController();
      executionAbortRef.current = controller;
      
      if (isSilent) {
        isSilentExecutionRunningRef.current = true;
      } else {
        setRuntimeStatus("running");
        setPlaygroundError(null);
        setExecutionLogs([]);
        if (options?.showLogs !== false) {
          setIsLogsOpenExclusive(true);
        }
      }

      const addLog = (text: string) => {
        if (!isSilent) {
          setPlaygroundMessages((prev) => [...prev, { role: "system", text }]);
        }
      };

      try {
        const historyToSend = [...messagesRef.current.filter(m => m.role !== 'system')];
        // If we have an input message that isn't the last user message in history, add it
        if (inputMessage && (!historyToSend.length || historyToSend[historyToSend.length - 1].text !== inputMessage)) {
          historyToSend.push({ role: 'user', text: inputMessage });
        }

        const serverResponse = await fetch(
          `${runtimeBaseUrl}/api/flow/execute/stream`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              nodes: getNodes(),
              edges: getEdges(),
              flowId: getFlowId(),
              inputMessage,
              chatHistory: historyToSend,
              isSilent,
              globalVariables: getGlobalVariables(),
            }),
          },
        );

        if (!serverResponse.ok || !serverResponse.body) {
          const payload = await serverResponse.json().catch(() => ({}));
          throw new Error(payload?.error || `Server error: ${serverResponse.status}`);
        }

        const reader = serverResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalResultText = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const raw = line.trim();
            if (!raw) continue;
            try {
              const event = JSON.parse(raw);
              const { type, message, nodeId, data, chunk, output } = event;

              if (type === "log" || type === "error" || type === "nodeUpdate") {
                setExecutionLogs((prev) => [
                  {
                    id: Math.random().toString(36).substr(2, 9),
                    time: new Date().toLocaleTimeString(),
                    type,
                    message: message || (type === "nodeUpdate" ? `Node ${nodeId} status: ${data?.status}` : ""),
                    nodeId,
                  },
                  ...prev.slice(0, 99),
                ]);
              }

              if (type === "llm_chunk" && chunk && !isSilent) {
                appendAssistantOutput(chunk);
              }

              if (type === "done" && output) {
                finalResultText = typeof output === 'string' ? output : output.text || '';
              }

              switch (type) {
                case "log":
                  addLog(message);
                  break;
                case "nodeUpdate":
                  if (!isSilent) {
                    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
                  }
                  break;
                case "error":
                  if (!isSilent) setPlaygroundError(message);
                  break;
              }
            } catch (e) {}
          }
        }

        if (!isSilent) setRuntimeStatus("success");
        return finalResultText;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setRuntimeStatus('cancelled');
        } else {
          setPlaygroundError(err.message);
          setRuntimeStatus('error');
        }
        return null;
      } finally {
        if (isSilent) {
          isSilentExecutionRunningRef.current = false;
        }
      }
    },
    [getNodes, getEdges, getGlobalVariables, setNodes, setIsLogsOpenExclusive, appendAssistantOutput, setRuntimeStatus, setPlaygroundError]
  );

  const onSendMessage = useCallback(
    async (msg: string) => {
      setPlaygroundMessages((prev) => [...prev, { role: "user", text: msg }]);
      setIsPlaygroundTyping(true);

      const response = await executeFlow(msg, false, { showLogs: false });

      setIsPlaygroundTyping(false);
      if (response) {
        appendAssistantOutput(response);
      }
    },
    [executeFlow, appendAssistantOutput],
  );

  const onRunAll = useCallback(async () => {
    setIsPlaygroundOpen(true);
    setPlaygroundMessages((prev) => [
      ...prev,
      { role: "user", text: "[System: Deploy Flow Triggered]" },
    ]);

    const isValid = onValidateFlow(false);
    if (!isValid) {
      setActiveDockTab("validation");
      setPlaygroundError("Deploy aborted. Fix validation errors shown on flow and run again.");
      return;
    }

    setIsPlaygroundTyping(true);
    const response = await executeFlow();
    setIsPlaygroundTyping(false);
    
    if (response) {
      appendAssistantOutput(response);
    }
  }, [executeFlow, appendAssistantOutput, onValidateFlow, setIsPlaygroundOpen, setActiveDockTab, setPlaygroundError]);

  const onClearPlaygroundMessages = useCallback(() => {
    setPlaygroundMessages(INITIAL_PLAYGROUND_MESSAGES);
    setPlaygroundError(null);
  }, []);

  /**
   * Run a single node and all its upstream dependencies (ancestors) as a
   * sub-flow.
   */
  const executeNodeSubgraph = useCallback(
    async (nodeId: string) => {
      const nodes = getNodes();
      const edges = getEdges();
      const globalVariables = getGlobalVariables();

      // BFS/DFS backwards from nodeId to collect ancestor node ids
      const edgesById = new Map<string, Edge[]>();
      edges.forEach((e) => {
        const list = edgesById.get(e.target) ?? [];
        list.push(e);
        edgesById.set(e.target, list);
      });

      const visited = new Set<string>();
      const queue: string[] = [nodeId];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        (edgesById.get(cur) ?? []).forEach((e) => queue.push(e.source));
      }

      const subNodes = nodes.filter((n) => visited.has(n.id));
      const subEdges = edges.filter(
        (e) => visited.has(e.source) && visited.has(e.target),
      );

      if (subNodes.length === 0) return;

      setIsPlaygroundOpen(true);
      setPlaygroundMessages((prev) => [
        ...prev,
        { role: 'user', text: `[System: Run Node — ${subNodes.find((n) => n.id === nodeId)?.data?.label ?? nodeId}]` },
      ]);
      setIsPlaygroundTyping(true);

      const runtimeBaseUrl = (import.meta as any).env?.VITE_RUNTIME_URL || 'http://localhost:8787';

      executionAbortRef.current?.abort();
      const controller = new AbortController();
      executionAbortRef.current = controller;
      setRuntimeStatus('running');
      setPlaygroundError(null);

      // Reset status on sub-nodes
      setNodes((nds) =>
        nds.map((n) =>
          visited.has(n.id)
            ? { ...n, data: { ...n.data, status: 'idle', errorMessage: undefined } }
            : n,
        ),
      );

      try {
        const serverResponse = await fetch(
          `${runtimeBaseUrl}/api/flow/execute/stream`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              nodes: subNodes,
              edges: subEdges,
              globalVariables,
              isSilent: false,
            }),
          },
        );

        if (!serverResponse.ok || !serverResponse.body) {
          const payload = await serverResponse.json().catch(() => ({}));
          throw new Error(payload?.error ?? `Server error: ${serverResponse.status}`);
        }

        const reader = serverResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          lines.forEach((line) => {
            const raw = line.trim();
            if (!raw) return;
            try {
              const event = JSON.parse(raw);
              if (event.type === 'ping' || event.type === 'done') return;
              if (event.type === 'nodeUpdate' && event.nodeId) {
                setNodes((nds) =>
                  nds.map((n) =>
                    n.id === event.nodeId ? { ...n, data: { ...n.data, ...event.data } } : n,
                  ),
                );
              }
              if (event.type === 'error') {
                setPlaygroundError(event.message ?? 'Execution error');
              }
            } catch { /* ignore parse errors */ }
          });
        }

        setRuntimeStatus('success');
        setPlaygroundMessages((prev) => [
          ...prev,
          { role: 'system', text: '[System: Node execution completed]' },
        ]);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setPlaygroundError(err.message);
          setRuntimeStatus('error');
        } else {
          setRuntimeStatus('cancelled');
        }
      } finally {
        setIsPlaygroundTyping(false);
      }
    },
    [getNodes, getEdges, getGlobalVariables, setNodes, setIsPlaygroundOpen, setRuntimeStatus, setPlaygroundError]
  );

  return {
    runtimeStatus,
    setRuntimeStatus,
    playgroundMessages,
    setPlaygroundMessages,
    isPlaygroundTyping,
    playgroundError,
    setPlaygroundError,
    executionLogs,
    setExecutionLogs,
    flowIssues,
    validationLocale,
    setValidationLocale,
    onValidateFlow,
    executeFlow,
    onSendMessage,
    onRunAll,
    onClearPlaygroundMessages,
    executeNodeSubgraph,
  };
};
