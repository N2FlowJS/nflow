import React from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { QuestionOutlined } from "@ant-design/icons";
import { DecisionNodeData } from "../../../../models/flowTypes";
import BaseNode from "../base-node";
import DecisionBranches from "./DecisionBranches";
import DefaultBranch from "./DefaultBranch";
import { NODE_REGISTRY } from "../../../../utils/client";
import { sourceColor } from "../base-node/handle-icon";

const DecisionNode = ({
  data,
  id,
  selected,
}: NodeProps<Node<DecisionNodeData>>) => {
  const form = data.form || {};
  const branches = form.branches || [];
  const hasBranches = branches.length > 0;
  const nodeConfig = NODE_REGISTRY.decision;

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

      {branches.map((branch, index) => (
        <Handle
          key={`branch-${index}`}
          type="source"
          position={Position.Right}
          id={`out-${branch.name}`} 
          style={{
            top: `${(index + 1) * (100 / (branches.length + 1))}%`,
            background:nodeConfig.color.handle,
            border: "2px solid "+ nodeConfig.color.border,
            width: "10px",
            height: "10px",

          }}
        />
      ))}

      {/* Default branch handle */}
      {form.defaultTarget && (
        <Handle
          type="source"
          position={Position.Right}
          id={`out-default`} // Dynamic ID based on target
          style={{
            top: "90%", // Adjust position if needed, maybe based on branch count?
            background:sourceColor,
            border: "2px solid white",
            width: "10px",
            height: "10px",
          }}
        />
      )}
    </BaseNode>
  );
};

export default DecisionNode;
