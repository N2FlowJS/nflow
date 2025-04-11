import React, { memo } from "react";
import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { Card, Typography } from "antd";
import { QuestionOutlined } from "@ant-design/icons";

import { NodeData } from "../types/flowTypes";

const { Title } = Typography;

const DecisionNode = ({
  data,
  isConnectable,
  selected,
}: NodeProps<Node<NodeData>>) => {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <QuestionOutlined style={{ marginRight: 8 }} />
          <span>Decision: {data.label}</span>
        </div>
      }
      size="small"
      style={{
        width: 200,
        border: selected ? "2px solid #1890ff" : "1px solid #d9d9d9",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div style={{ padding: "10px 0" }}>
        <Typography.Paragraph ellipsis={{ rows: 2 }}>
          {JSON.stringify(data.condition) || "Conditional logic"}{" "}
          {/* Add default fallback */}
        </Typography.Paragraph>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "25%", background: "#52c41a" }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "75%", background: "#f5222d" }}
        isConnectable={isConnectable}
      />
    </Card>
  );
};

export default memo(DecisionNode);
