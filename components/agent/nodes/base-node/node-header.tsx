import React from "react";
import { Typography, Tooltip, Flex } from "antd";
import { NodeTypeString } from "../../types/flowTypes";

interface NodeHeaderProps {
  id?: string;
  label: string;
  name: string;
  type: NodeTypeString;
  icon?: React.ReactNode;
}

const NodeHeader: React.FC<NodeHeaderProps> = ({ id, name, label, type, icon }) => {
  return (
    <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
      {icon && <div>{icon}</div>}
      <Tooltip title={id}>
        <Typography.Text 
          strong 
          ellipsis={{ tooltip: id }}
          style={{ flex: 1 }}
        >
          {name || label}
        </Typography.Text>
      </Tooltip>
    </Flex>
  );
};

export default NodeHeader;
