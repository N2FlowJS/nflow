import React, { useEffect, useRef, useState, memo } from "react";

import type { CustomNodeType, NodeData } from "@n2flow/types";
import {
  Settings2,
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
import { Input, TextArea, Select } from "../ui/index";
import { apiService } from "../../lib/apiService";
import { maskSecretValue } from "../../lib/utils";
import type { GlobalVariable } from "../../types/editor";
import {
  CyberAction,
  CyberBadge,
  CyberFieldShell,
  CyberMetaText,
  CyberPanel,
  CyberToggleSwitch,
  CyberEmptyState,
} from "../shared/CyberUI";

type ConfigField = NonNullable<NodeData["configSchema"]>[number];

interface NodeConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  data: CustomNodeType["data"] | null;
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

const DESCRIPTION_FIELD_CLASS = "!min-h-[32px] !text-white/50 placeholder:!text-white/20";

export const NodeConfigPanel = ({
  isOpen,
  onClose,
  data,
  updateNodeData,
  handleParamChange,
  globalVariables,
}: NodeConfigPanelProps) => {
  const [models, setModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const lastFetchKeyRef = useRef<string | null>(null);

  const isDock = true;

  const baseVal = data ? String(getNodeFieldValue(data, "baseUrl") ?? "") : "";
  const apiKeyVal = data ? String(getNodeFieldValue(data, "apiKey") ?? "") : "";

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

  // Empty state if no node is selected or data is empty
  const hasNoData = !data || !data.type;

  const content = (
    <CyberPanel
      title="NODE_CONFIG"
      icon={Settings2}
      onClose={onClose}
      className={isDock ? "h-full rounded-none border-y-0 border-r-0 border-cyber-primary/20 bg-black/80 backdrop-blur-xl" : "border-cyber-primary/20 bg-black/80 backdrop-blur-xl"}
      maxHeight={isDock ? "100%" : "90vh"}
      scrollable={!isDock}
      actions={
        data?.type ? (
          <CyberMetaText className="px-0 text-[9px] opacity-30">
            {data.type}
          </CyberMetaText>
        ) : undefined
      }
    >
      {hasNoData ? (
        <div className="h-full flex items-center justify-center p-8 min-h-[300px]">
          <CyberEmptyState label="SELECT A NODE TO CONFIGURE" className="text-center" />
        </div>
      ) : (
        <div className={`p-3 space-y-3.5 flex flex-col min-h-0 ${isDock ? "h-full overflow-y-auto custom-scrollbar" : ""}`}>
          <TextArea
            variant="micro"
            className={DESCRIPTION_FIELD_CLASS}
            value={data.description || ""}
            onChange={(e) => updateNodeData({ description: e.target.value })}
            placeholder="Description..."
            onFocus={() =>
              window.dispatchEvent(new CustomEvent("takeSnapshot"))
            }
          />

          <div className={`space-y-2.5 min-h-0 ${isDock ? "" : "scrollbar-hide overflow-y-auto max-h-[70vh]"}`}>
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
                  <CyberFieldShell
                    key={f.name}
                    label={f.label}
                    leading={<FieldIcon type={f.type} />}
                    headerClassName="group-focus-within/f:text-cyber-primary"
                    className="group/f"
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
                          variant="dense"
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
                          variant="dense"
                          value={val}
                          onChange={(e) => onValueChange(e.target.value)}
                          placeholder="Model ID..."
                        />
                      )
                    ) : f.type === "select" ? (
                      <Select
                        variant="dense"
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
                        variant="dense"
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                      />
                    ) : f.type === "number" ? (
                      <NumberInput
                        value={val}
                        onChange={onValueChange}
                        variant="dense"
                      />
                    ) : f.type === "boolean" ? (
                      <div className="flex items-center justify-between p-1.5 bg-black/20 rounded border border-white/5">
                        <CyberBadge label={val === "true" ? "On" : "Off"} variant={val === "true" ? "success" : "info"} />
                        <CyberToggleSwitch
                          checked={val === "true"}
                          onChange={onValueChange}
                        />
                      </div>
                    ) : isPw ? (
                      <div className="space-y-1">
                        {f.name !== "apiKey" && globalVariables.length > 0 && (
                          <Select
                            variant="micro"
                            className="!bg-black/60 !border-cyber-primary/10"
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
                            variant="dense"
                            className="!pr-7"
                            value={val}
                            onChange={(e) => onValueChange(e.target.value)}
                          />
                          <CyberAction
                            onClick={() =>
                              setShowPassword((p) => ({
                                ...p,
                                ...showPassword,
                                [f.name]: !p[f.name],
                              }))
                            }
                            icon={showPassword[f.name] ? EyeOff : Eye}
                            showLabel={false}
                            className="absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 justify-center border-none bg-transparent opacity-30 hover:opacity-100"
                          />
                        </div>
                        {variable && (
                          <CyberMetaText>
                            {maskSecretValue(variable.value)}
                          </CyberMetaText>
                        )}
                      </div>
                    ) : (
                      <Input
                        variant="dense"
                        value={val}
                        onChange={(e) => onValueChange(e.target.value)}
                      />
                    )}
                  </CyberFieldShell>
                );
              })}
          </div>
        </div>
      )}
    </CyberPanel>
  );

  return <div className="h-full w-full min-h-0">{content}</div>;
};

export default NodeConfigPanel;
