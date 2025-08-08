import React from "react";
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { QuestionOutlined } from "@ant-design/icons";
import { DecisionNodeData } from "../../../../models/flowTypes";
import BaseNode from "../base-node";
import DecisionBranches from "./DecisionBranches";
import DefaultBranch from "./DefaultBranch";
import { NODE_REGISTRY } from "../../../../utils/client/NODE_REGISTRY";
import { sourceColor } from "../base-node/handle-icon";
import { useFlowEditorContext } from "../../canvas/FlowEditorContext";

const slugify = (s: string) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const DecisionNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<DecisionNodeData>>) => {
  const form = data.form || {};
  const branches = form.branches || [];
  const hasBranches = branches.length > 0;
  const nodeConfig = NODE_REGISTRY.decision;
  const { openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();

  return (
    <BaseNode
      data={data}
      id={id}
      selected={selected}
      handlePositions={{
        input: [Position.Left],
        output: [],
      }}
      icon={<QuestionOutlined style={{ color: "#faad14" }} />}
      role={form?.role}

    >
      <div>
        {hasBranches && (
          <DecisionBranches branches={branches} />
        )}

        {form.defaultTarget && (
          <DefaultBranch target={form.defaultTarget} />
        )}
      </div>

      {branches.map((branch, index) => {
        const handleId = `out-${slugify(branch.name)}`;
        return (
          <Handle
            key={`branch-${index}`}
            type="source"
            position={Position.Right}
            id={handleId}
            style={{
              top: `${(index + 1) * (100 / (branches.length + 1))}%`,
              background: nodeConfig.color.handle,
              border: "2px solid " + nodeConfig.color.border,
              width: "10px",
              height: "10px",
              cursor: 'pointer',
              pointerEvents: 'auto',
              zIndex: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              const n = getNode(id as any);
              const sourceW = (n as any)?.width ?? (n as any)?.measured?.width;
              const sourceH = (n as any)?.height ?? (n as any)?.measured?.height;
              openNextStepModal?.({
                nodeId: id,
                handleId: handleId,
                handleType: 'source',
                position: Position.Right,
                nodeType: data.type as any,
                clientX: e.clientX,
                clientY: e.clientY,
                sourceW: sourceW as number,
                sourceH: sourceH as number,
              });
            }}
          />
        );
      })}

      {/* Default branch handle */}
      {form.defaultTarget && (
        <Handle
          type="source"
          position={Position.Right}
          id={`out-default`}
          style={{
            top: "90%",
            background: sourceColor,
            border: "2px solid white",
            width: "10px",
            height: "10px",
            cursor: 'pointer',
            pointerEvents: 'auto',
            zIndex: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            const n = getNode(id as any);
            const sourceW = (n as any)?.width ?? (n as any)?.measured?.width;
            const sourceH = (n as any)?.height ?? (n as any)?.measured?.height;
            openNextStepModal?.({
              nodeId: id,
              handleId: `out-default`,
              handleType: 'source',
              position: Position.Right,
              nodeType: data.type as any,
              clientX: e.clientX,
              clientY: e.clientY,
              sourceW: sourceW as number,
              sourceH: sourceH as number,
            });
          }}
        />
      )}
    </BaseNode>
  );
};

export default DecisionNode;
