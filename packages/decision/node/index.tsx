import React from "react";
import { Handle, Position, NodeProps, Node, useReactFlow } from "@xyflow/react";
import { QuestionOutlined } from "@ant-design/icons";
import { BaseNode } from "@n2flowjs/flow";
import DecisionBranches from "./DecisionBranches";
import DefaultBranch from "./DefaultBranch";
import { getHandleStyle } from "@n2flowjs/flow/node/base-node/handle-icon";
import { useFlowEditorContext } from "@n2flowjs/flow/editor-context";
import { slugify } from "@n2flowjs/flow/flow-helpers";
import { theme } from 'antd';
import { DecisionNodeData } from "../types";

const DecisionNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<DecisionNodeData>>) => {
  const form = data.form || {};
  const branches = form.branches || [];
  const hasBranches = branches.length > 0;
  const { openNextStepModal } = useFlowEditorContext();
  const { getNode } = useReactFlow();
  const { token } = theme.useToken();

  const styleOpts = {
    sourceColor: token.colorSuccess,
    targetColor: token.colorPrimary,
    borderColor: (token as any).colorBorderSecondary ?? token.colorBorder,
    shadow: (token as any).boxShadowSecondary ?? token.boxShadow,
  };

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
        const total = branches.length;
        const styleBase = getHandleStyle(Position.Right, 'source', index, total, styleOpts);
        return (
          <Handle
            key={`branch-${index}`}
            type="source"
            position={Position.Right}
            id={handleId}
            style={styleBase}
            title={branch.name}
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
            ...getHandleStyle(Position.Right, 'source', undefined, undefined, styleOpts),
            background: token.colorWarning,
          }}
          title="default"
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
