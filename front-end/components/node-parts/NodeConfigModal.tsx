import React, { useEffect, useRef, useState, memo } from "react";
import { Panel } from "@xyflow/react";
import type { CustomNodeType, NodeData } from "@n2flow/types";
import {
  Settings,
  Hash,
  Type,
  List,
  FileText,
  ToggleLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { getNodeFieldValue } from "../../../back-end/node-registry";
import NumberInput from "../ui/NumberInput";
import { Input, TextArea, Select } from "../ui";
import { apiService } from "../../lib/apiService";
import { maskSecretValue } from "../../lib/utils";
import type { GlobalVariable } from "../../types/editor";
import { CyberAction, CyberPanel } from "../shared/CyberUI";

type ConfigField = NonNullable<NodeData["configSchema"]>[number];

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomNodeType["data"];
  updateNodeData: (newData: Partial<CustomNodeType["data"]>) => void;
  handleParamChange: (name: string, value: string | number | boolean) => void;
  globalVariables: GlobalVariable[];
}

const FieldIcon = memo(({ type }: { type: ConfigField["type"] }) => {
  const props = { size: 10, className: "opacity-40" };
  switch (type) {
    case "select":
      return <List {...props} />;
    case "textarea":
      return <FileText {...props} />;
    case "number":
      return <Hash {...props} />;
    case "boolean":
      return <ToggleLeft {...props} />;
    default:
      return <Type {...props} />;
  }
});

const ToggleSwitch = memo(
  ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`nodrag h-4 w-8 rounded-full transition-all flex items-center px-0.5 ${checked ? "bg-cyber-primary" : "bg-white/10"}`}
    >
      <div
        className={`h-3 w-3 rounded-full bg-white transition-transform ${checked ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  )
);

const FIELD_INPUT_CLASS = "!h-7 !py-0 !text-[10px] !bg-black/40";
const TEXTAREA_FIELD_CLASS = "!min-h-[50px] !py-1 !text-[10px] !bg-black/40";
const VARIABLE_SELECT_CLASS = "!h-5 !py-0 !text-[8px] !bg-black/60 !border-cyber-primary/10";
const FIELD_LABEL_CLASS = "flex items-center justify-between text-[9px] font-bold uppercase tracking-tighter text-white/30 group-focus-within/f:text-cyber-primary transition-colors";

const ConfigFieldShell = memo(
  ({
    type,
    label,
    action,
    children,
  }: {
    type: ConfigField["type"];
    label: string;
    action?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1 group/f px-0.5">
      <div className={FIELD_LABEL_CLASS}>
        <div className="flex items-center gap-1">
          <FieldIcon type={type} />
          {label}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
);

export const NodeConfigModal = ({
  isOpen,
  onClose,
  data,
  updateNodeData,
  handleParamChange,
  globalVariables,
}: NodeConfigModalProps) => {
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const lastFetchKeyRef = useRef<string | null>(null);

  const baseVal = String(getNodeFieldValue(data, "baseUrl") ?? "");
  const apiKeyVal = String(getNodeFieldValue(data, "apiKey") ?? "");

  useEffect(() => {
    setModels([]);
    setModelsLoading(false);
    lastFetchKeyRef.current = null;
  }, [baseVal, apiKeyVal]);

  const tryFetchModels = async () => {
    if (!baseVal) return;
    const fetchKey = `${baseVal}::${apiKeyVal}`;
    if (lastFetchKeyRef.current === fetchKey && models.length > 0) return;

    setModelsLoading(true);
    try {
      const res = await apiService.post<{
        ok: boolean;
        error?: string;
        models?: any[];
      }>("/api/llm/models", {
        baseUrl: baseVal,
        apiKey: apiKeyVal,
        provider: "NVIDIA",
      });
      if (res.ok && Array.isArray(res.models)) {
        setModels(
          Array.from(
            new Set(
              res.models
                .map((m) => (typeof m === "string" ? m : m.id || m.name))
                .filter(Boolean)
            )
          )
        );
        lastFetchKeyRef.current = fetchKey;
      }
    } catch {
      // Ignore fetch failures here; users can still enter the model manually.
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Panel
      position="top-right"
      className="m-4 w-[320px] z-50 animate-in fade-in slide-in-from-right-2 duration-200"
    >
      <CyberPanel
        title="NODE_CONFIG"
        icon={Settings}
        onClose={onClose}
        className="border-cyber-primary/20 bg-black/80 backdrop-blur-xl"
        maxHeight="90vh"
        actions={
          <span className="text-[9px] font-mono opacity-30 uppercase">
            {data.type}
          </span>
        }
      >
        <div className="p-2 space-y-2.5">
          <textarea
            className="w-full bg-black/40 border border-white/5 rounded px-2 py-1 text-[10px] text-white/50 focus:outline-none focus:border-cyber-primary/20 resize-none min-h-[32px]"
            value={data.description || ""}
            onChange={(e) => updateNodeData({ description: e.target.value })}
            placeholder="Description..."
            onFocus={() =>
              window.dispatchEvent(new CustomEvent("takeSnapshot"))
            }
          />

          <div className="space-y-2 scrollbar-hide overflow-y-auto max-h-[70vh]">
            {data.configSchema
              ?.filter((f) => !f.hidden)
              .map((f) => {
                const isPw =
                  f.type === "password" ||
                  f.name.match(/key|token|secret|password/i);
                const canScanModels = f.name === "model" && baseVal && apiKeyVal;
                const val = String(getNodeFieldValue(data, f.name) ?? "");
                const varMatch = val.match(/^\{\{\s*(.*?)\s*\}\}$/)?.[1];
                const variable = varMatch
                  ? globalVariables.find((v) => v.name === varMatch)
                  : null;
                const onValueChange = (value: string | number | boolean) =>
                  handleParamChange(f.name, value);

                return (
                  <ConfigFieldShell
                    key={f.name}
                    type={f.type}
                    label={f.label}
                    action={canScanModels ? (
                      <CyberAction
                        onClick={tryFetchModels}
                        label={modelsLoading ? "..." : "Scan"}
                        className="h-5 px-1.5 border-none bg-transparent text-[8px] opacity-50 hover:opacity-100"
                        colorClass="text-cyber-primary"
                      />
                    ) : undefined}
                  >
                    {canScanModels ? (
                      models.length > 0 ? (
                        <Select
                          className={FIELD_INPUT_CLASS}
                          value={val}
                          onChange={(e) => onValueChange(e.target.value)}
                        >
                          <option value="">-- SELECT --</option>
                          {models.map((m) => (
                            <option key={m} value={m} className="bg-slate-900">
                              {m}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          className={FIELD_INPUT_CLASS}
                          value={val}
                          onChange={(e) => onValueChange(e.target.value)}
                          placeholder="Model ID..."
                        />
                      )
                    ) : f.type === "select" ? (
                      <Select
                        className={FIELD_INPUT_CLASS}
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                      >
                        {f.options?.map((o) => (
                          <option key={o} value={o} className="bg-slate-900">
                            {o}
                          </option>
                        ))}
                      </Select>
                    ) : f.type === "textarea" ? (
                      <TextArea
                        className={TEXTAREA_FIELD_CLASS}
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                      />
                    ) : f.type === "number" ? (
                      <NumberInput
                        value={val}
                        onChange={onValueChange}
                        className={FIELD_INPUT_CLASS}
                      />
                    ) : f.type === "boolean" ? (
                      <div className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-white/5">
                        <span className="text-[8px] opacity-20 font-black">
                          {val === "true" ? "ON" : "OFF"}
                        </span>
                        <ToggleSwitch
                          checked={val === "true"}
                          onChange={onValueChange}
                        />
                      </div>
                    ) : isPw ? (
                      <div className="space-y-1">
                        {f.name !== "apiKey" && globalVariables.length > 0 && (
                          <Select
                            className={VARIABLE_SELECT_CLASS}
                            value={varMatch || ""}
                            onChange={(e) =>
                              e.target.value && onValueChange(`{{${e.target.value}}}`)
                            }
                          >
                            <option value="">-- VAR --</option>
                            {globalVariables.map((v) => (
                              <option key={v.id} value={v.name}>
                                {v.name}
                              </option>
                            ))}
                          </Select>
                        )}
                        <div className="relative">
                          <Input
                            type={showPassword[f.name] ? "text" : "password"}
                            className={`${FIELD_INPUT_CLASS} !pr-7`}
                            value={val}
                            onChange={(e) => onValueChange(e.target.value)}
                          />
                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100"
                            onClick={() =>
                              setShowPassword((p) => ({
                                ...p,
                                [f.name]: !p[f.name],
                              }))
                            }
                          >
                            {showPassword[f.name] ? (
                              <EyeOff size={10} />
                            ) : (
                              <Eye size={10} />
                            )}
                          </button>
                        </div>
                        {variable && (
                          <div className="text-[8px] font-mono text-white/20 truncate px-1">
                            {maskSecretValue(variable.value)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        className={FIELD_INPUT_CLASS}
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                      />
                    )}
                  </ConfigFieldShell>
                );
              })}
          </div>
        </div>
      </CyberPanel>
    </Panel>
  );
};
