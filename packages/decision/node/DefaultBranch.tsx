import React from "react";
import { Flex, Typography, Tag } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useReactFlow } from "@xyflow/react";
import { FlowNode } from "../../../models/flowTypes";

interface DefaultBranchProps {
  target: string;
}

const DefaultBranch: React.FC<DefaultBranchProps> = ({ target }) => {
  const { getNode } = useReactFlow();
  
  const getNodeName = (nodeId: string) => {
    const node: FlowNode = getNode(nodeId) as FlowNode;
    return node?.data?.form?.name || nodeId;
  };

  return (
    <Flex align="center" justify="space-between" style={{ marginTop: 8 }}>
      <Typography.Text type="secondary">Default:</Typography.Text>
      <Tag color="warning">
        <ArrowRightOutlined style={{ marginRight: 4 }} />
        {getNodeName(target)}
      </Tag>
    </Flex>
  );
};

export default DefaultBranch;
